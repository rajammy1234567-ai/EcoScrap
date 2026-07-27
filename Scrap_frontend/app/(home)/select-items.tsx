import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { userService } from "../../src/services/user";
import { scrapService } from "../../src/services/scrap";
import { pickupService } from "../../src/services/pickup";
import { ScrapIcon } from "../../src/components/ui/ScrapIcon";
import {
  DigitalClockPicker,
  formatTwoHourSlot,
} from "../../src/components/ui/DigitalClockPicker";
import { StepProgress } from "../../src/components/layout/StepProgress";
import { SectionHeader } from "../../src/components/layout/SectionHeader";
import { colors, radii, spacing, typography, shadows, layout } from "../../src/theme";
import { Address, ScrapCategory } from "../../src/types";

const WEIGHTS = [
  { label: "50–200 Kgs", qty: 100 },
  { label: "30–50 Kgs", qty: 40 },
  { label: "More than 200 Kgs", qty: 250 },
  { label: "0–10 Kgs", qty: 5 },
  { label: "10–30 Kgs", qty: 20 },
] as const;

const FALLBACK_CATS: ScrapCategory[] = [
  { id: "paper", name: "Paper", icon_url: null, sort_order: 1 },
  { id: "metal", name: "Metals", icon_url: null, sort_order: 2 },
  { id: "ewaste", name: "E-Waste", icon_url: null, sort_order: 3 },
  { id: "carton", name: "Cartons / Plastics", icon_url: null, sort_order: 4 },
  { id: "others", name: "Others", icon_url: null, sort_order: 5 },
  { id: "appliance", name: "Big Appliances", icon_url: null, sort_order: 6 },
];

function showAlert(title: string, msg: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${msg}`);
  } else {
    Alert.alert(title, msg);
  }
}

export default function SelectItemsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [categories, setCategories] = useState<ScrapCategory[]>(FALLBACK_CATS);
  const [catItems, setCatItems] = useState<Record<string, string>>({});
  /** Start of 2-hour pickup window (digital / system clock) */
  const [startHour, setStartHour] = useState(14);
  const [startMinute, setStartMinute] = useState(30);
  const [selectedWeightIdx, setSelectedWeightIdx] = useState(0);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const slotLabel = formatTwoHourSlot(startHour, startMinute);

  useEffect(() => {
    scrapService
      .getCategories()
      .then(async (r) => {
        const cats: ScrapCategory[] = r.data.categories ?? FALLBACK_CATS;
        if (cats.length > 0) setCategories(cats);
        const map: Record<string, string> = {};
        await Promise.all(
          cats.map(async (c) => {
            try {
              const ir = await scrapService.getItems(c.id);
              const items = ir.data.items ?? [];
              if (items.length > 0) map[c.id] = items[0].id;
            } catch {}
          }),
        );
        setCatItems(map);
      })
      .catch(() => {});
  }, []);

  const { selectedAddr: selectedAddrParam } = useLocalSearchParams<{
    selectedAddr?: string;
  }>();

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) return;
      userService
        .getAddresses()
        .then((r) => {
          const addrs: Address[] = r.data.addresses ?? [];
          setAddresses(addrs);
          const def = addrs.find((a) => a.is_default);
          const selected = selectedAddrParam
            ? addrs.find((a) => a.id === selectedAddrParam)
            : undefined;
          setSelectedAddr(selected?.id ?? def?.id ?? addrs[0]?.id ?? null);
        })
        .catch(() => {});
    }, [isAuthenticated, selectedAddrParam]),
  );

  const toggleCat = (id: string) => {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddr);
  const addressText = selectedAddress
    ? [
        selectedAddress.flat_number,
        selectedAddress.locality,
        selectedAddress.city,
        selectedAddress.pincode,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      if (Platform.OS === "web") {
        if (window.confirm("Login required. Go to login?"))
          router.push("/(auth)/enter-mobile");
      } else {
        Alert.alert("Login Required", "Please login to schedule a pickup", [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/(auth)/enter-mobile") },
        ]);
      }
      return;
    }
    if (!selectedAddr) {
      showAlert("No Address", "Please add a pickup address first");
      return;
    }
    if (selectedCats.size === 0) {
      showAlert(
        "Select Categories",
        "Please select at least one scrap category",
      );
      return;
    }
    setLoading(true);
    try {
      const now = new Date();
      // Build scheduled start of 2-hour window; if already past today → tomorrow
      let scheduled = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        startHour,
        startMinute,
        0,
      );
      if (scheduled.getTime() <= now.getTime() + 30 * 60 * 1000) {
        scheduled = new Date(scheduled.getTime() + 24 * 60 * 60 * 1000);
      }
      const qty = WEIGHTS[selectedWeightIdx].qty;

      // Ensure we have item ids for the selected categories. If any are missing,
      // attempt to fetch them now (handles slow initial loads or transient failures).
      let currentCatItems: Record<string, string> = { ...catItems };
      const missingCatIds = [...selectedCats].filter(
        (catId) => !currentCatItems[catId],
      );
      if (missingCatIds.length > 0) {
        const fetchedMap: Record<string, string> = {};
        await Promise.all(
          missingCatIds.map(async (cId) => {
            try {
              const ir = await scrapService.getItems(cId);
              const items = ir.data.items ?? [];
              if (items.length > 0) fetchedMap[cId] = items[0].id;
            } catch {}
          }),
        );
        if (Object.keys(fetchedMap).length > 0) {
          currentCatItems = { ...currentCatItems, ...fetchedMap };
          setCatItems((prev) => ({ ...prev, ...fetchedMap }));
        }
      }

      const buildItemsPayload = (map: Record<string, string>) =>
        [...selectedCats].flatMap((catId) => {
          const itemId = map[catId];
          if (!itemId) return [];
          return [{ scrap_item_id: itemId, estimated_qty: qty }];
        });

      let itemsPayload = buildItemsPayload(currentCatItems);

      if (itemsPayload.length === 0) {
        const missingIds = [...selectedCats].filter(
          (catId) => !currentCatItems[catId],
        );
        const missingNames = missingIds.map(
          (id) => categories.find((c) => c.id === id)?.name ?? id,
        );
        const msg =
          missingNames.length > 0
            ? `Could not find items for selected categories: ${missingNames.join(", ")}.`
            : "Could not find items for selected categories.";

        // Offer a Retry to fetch missing items once more
        if (Platform.OS === "web") {
          if (window.confirm(`${msg} Retry?`)) {
            // continue to retry below
          } else {
            setLoading(false);
            return;
          }
        } else {
          const retry = await new Promise<boolean>((resolve) => {
            Alert.alert("Error", `${msg} Retry?`, [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => resolve(false),
              },
              { text: "Retry", onPress: () => resolve(true) },
            ]);
          });
          if (!retry) {
            setLoading(false);
            return;
          }
        }

        // Retry fetching missing items
        const fetchedMap: Record<string, string> = {};
        await Promise.all(
          missingIds.map(async (cId) => {
            try {
              const ir = await scrapService.getItems(cId);
              const items = ir.data.items ?? [];
              if (items.length > 0) fetchedMap[cId] = items[0].id;
            } catch {}
          }),
        );
        if (Object.keys(fetchedMap).length > 0) {
          currentCatItems = { ...currentCatItems, ...fetchedMap };
          setCatItems((prev) => ({ ...prev, ...fetchedMap }));
        }

        itemsPayload = buildItemsPayload(currentCatItems);
        if (itemsPayload.length === 0) {
          showAlert("Error", `${msg} Please try again later.`);
          setLoading(false);
          return;
        }
      }

      try {
        const res = await pickupService.create({
          address_id: selectedAddr,
          items: itemsPayload,
          image_urls: [],
          scheduled_at: scheduled.toISOString(),
        });

        if (!res?.data?.pickup?.id) {
          throw new Error("Invalid pickup response from server.");
        }

        router.replace({
          pathname: "/(home)/pickup-success",
          params: {
            pickupId: res.data.pickup.id,
            scheduledAt: res.data.pickup.scheduled_at,
          },
        });
        return;
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Could not schedule pickup. Please try again.";

        if (err?.isNetworkError || err?.code === "ECONNABORTED") {
          showAlert(
            "Network Error",
            "Unable to reach the server. Please check your internet connection or backend status.",
          );
        } else {
          showAlert("Error", msg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const estimatedEarning = selectedCats.size > 0
    ? `₹${WEIGHTS[selectedWeightIdx].qty * 8}+ est.`
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.neutral.black} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Schedule Pickup</Text>
          <Text style={styles.headerSub}>Free doorstep collection</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <StepProgress
        current={2}
        total={3}
        labels={["Address", "Details", "Confirm"]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <SectionHeader
            title="Pickup time"
            subtitle="Digital clock · 2-hour slot"
          />
          <DigitalClockPicker
            hour={startHour}
            minute={startMinute}
            onChange={(h, m) => {
              setStartHour(h);
              setStartMinute(m);
            }}
          />
        </View>

        <View style={styles.card}>
          <SectionHeader title="Estimated weight" subtitle="Helps us assign the right vehicle" />
          <View style={styles.chipRow}>
          {WEIGHTS.map((w, i) => (
            <Pressable
              key={i}
              style={[
                styles.chip,
                selectedWeightIdx === i && styles.chipActive,
              ]}
              onPress={() => setSelectedWeightIdx(i)}
            >
              <Text
                style={[
                  styles.chipLabel,
                  selectedWeightIdx === i && styles.chipLabelActive,
                ]}
              >
                {w.label}
              </Text>
            </Pressable>
          ))}
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader
            title="Pickup address"
            actionLabel="Change"
            onAction={() => router.push("/(location)/add-address")}
          />

        {!isAuthenticated ? (
          <Pressable
            style={styles.addrErrorCard}
            onPress={() => router.push("/(auth)/enter-mobile")}
          >
            <Feather
              name="alert-circle"
              size={18}
              color={colors.functional.error}
            />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.addrErrorTitle}>Login Required</Text>
              <Text style={styles.addrErrorSub}>
                Tap to login and add an address.
              </Text>
            </View>
          </Pressable>
        ) : !addressText ? (
          <Pressable
            style={styles.addrErrorCard}
            onPress={() => router.push("/(location)/add-address")}
          >
            <Feather
              name="alert-circle"
              size={18}
              color={colors.functional.error}
            />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.addrErrorTitle}>
                Sorry!, Error Loading Address
              </Text>
              <Text style={styles.addrErrorSub}>
                Not found · Tap to add an address.
              </Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.addrCard}>
            <Feather name="home" size={16} color={colors.primary.green600} />
            <Text style={styles.addrText} numberOfLines={2}>
              {addressText}
            </Text>
          </View>
        )}
        </View>

        <View style={styles.card}>
          <SectionHeader
            title="Scrap categories"
            subtitle="Select all that apply"
            actionLabel="Rates"
            onAction={() => router.push("/(tabs)/scrap-rates" as any)}
          />
          <View style={styles.catGrid}>
          {categories.map((cat) => {
            const isActive = selectedCats.has(cat.id);
            return (
              <Pressable
                key={cat.id}
                style={[styles.catChip, isActive && styles.catChipActive]}
                onPress={() => toggleCat(cat.id)}
              >
                <ScrapIcon
                  name={cat.name}
                  variant="filled"
                  size={28}
                  active={isActive}
                />
                <Text
                  style={[styles.catLabel, isActive && styles.catLabelActive]}
                  numberOfLines={2}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.ctaWrap}>
        {estimatedEarning && (
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Estimated earning</Text>
            <Text style={styles.estimateValue}>{estimatedEarning}</Text>
          </View>
        )}
        <Pressable
          style={[styles.ctaBtn, !!loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={!!loading}
        >
          <View>
            <Text style={styles.ctaBtnText}>
              {loading ? "Scheduling..." : "Confirm Pickup"}
            </Text>
            {!loading && (
              <Text style={styles.ctaBtnSub}>
                {selectedCats.size > 0
                  ? `${selectedCats.size} categories · ${slotLabel}`
                  : "Select categories to continue"}
              </Text>
            )}
          </View>
          {!loading && (
            <View style={styles.ctaArrow}>
              <Feather name="arrow-right" size={20} color={colors.neutral.white} />
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: layout.screenBg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    ...typography.h3,
    color: colors.neutral.black,
  },
  headerSub: {
    ...typography.caption,
    color: colors.neutral.gray400,
  },

  content: { padding: spacing.lg, paddingBottom: 130, gap: spacing.md },

  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
    backgroundColor: colors.neutral.gray100,
  },
  chipActive: {
    backgroundColor: colors.primary.green600,
    borderColor: colors.primary.green600,
  },
  chipLabel: { ...typography.bodySm, color: colors.neutral.gray600 },
  chipLabelActive: { color: colors.neutral.white, fontWeight: "600" as const },

  addrErrorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.functional.errorBg,
    borderWidth: 1,
    borderColor: colors.functional.errorBg,
  },
  addrErrorTitle: {
    ...typography.bodySmMedium,
    color: colors.functional.error,
  },
  addrErrorSub: {
    ...typography.caption,
    color: colors.functional.error,
    marginTop: 2,
  },
  addrCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.primary.green50,
    borderWidth: 1.5,
    borderColor: colors.primary.green100,
  },
  addrText: { flex: 1, ...typography.bodySm, color: colors.neutral.gray600 },

  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  catChip: {
    width: "30%",
    aspectRatio: 0.85,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
    backgroundColor: colors.neutral.gray100,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    gap: spacing.xs,
  },
  catChipActive: {
    backgroundColor: colors.primary.green600,
    borderColor: colors.primary.green600,
  },
  catLabel: {
    ...typography.caption,
    color: colors.neutral.gray600,
    textAlign: "center",
  },
  catLabelActive: { color: colors.neutral.white, fontWeight: "600" as const },

  ctaWrap: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 32 : spacing.lg,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
    ...shadows.lg,
  },
  estimateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  estimateLabel: { ...typography.caption, color: colors.neutral.gray600 },
  estimateValue: {
    ...typography.bodySmMedium,
    fontWeight: "800" as const,
    color: colors.primary.green700,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.neutral.black,
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 64,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.neutral.white,
  },
  ctaBtnSub: {
    ...typography.caption,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  ctaArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.green600,
    alignItems: "center",
    justifyContent: "center",
  },
});
