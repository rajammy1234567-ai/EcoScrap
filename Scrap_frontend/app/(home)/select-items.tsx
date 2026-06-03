import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { userService } from "../../src/services/user";
import { scrapService } from "../../src/services/scrap";
import { pickupService } from "../../src/services/pickup";
import { colors, radii, spacing, typography } from "../../src/theme";
import { Address, ScrapCategory } from "../../src/types";

// ── 3D category icons ─────────────────────────────────────────────────────────
const CAT_ICONS: Record<string, any> = {
  paper: require("../../assets/images/brands/Untitled design/newspaper.png"),
  metal: require("../../assets/images/brands/Untitled design/metal.png"),
  metals: require("../../assets/images/brands/Untitled design/metal.png"),
  "e-waste": require("../../assets/images/brands/Untitled design/laptop.png"),
  ewaste: require("../../assets/images/brands/Untitled design/laptop.png"),
  carton: require("../../assets/images/brands/Untitled design/cardboard.png"),
  plastic: require("../../assets/images/brands/Untitled design/cardboard.png"),
  glass: require("../../assets/images/brands/Untitled design/glass.png"),
  clothes: require("../../assets/images/brands/Untitled design/tshirt.png"),
  appliance: require("../../assets/images/brands/Untitled design/fridge.png"),
  others: require("../../assets/images/brands/Untitled design/battery.png"),
};

function getCatIcon(name: string): any | null {
  const lower = name.toLowerCase();
  for (const key of Object.keys(CAT_ICONS)) {
    if (lower.includes(key)) return CAT_ICONS[key];
  }
  return null;
}

const TIME_SLOTS = [
  { label: "2:30 PM to 4:30 PM", hour: 14, minute: 30 },
  { label: "4:30 PM to 7:00 PM", hour: 16, minute: 30 },
] as const;

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
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(0);
  const [selectedWeightIdx, setSelectedWeightIdx] = useState(0);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) return;
      userService
        .getAddresses()
        .then((r) => {
          const addrs: Address[] = r.data.addresses ?? [];
          setAddresses(addrs);
          const def = addrs.find((a) => a.is_default);
          setSelectedAddr(def?.id ?? addrs[0]?.id ?? null);
        })
        .catch(() => {});
    }, [isAuthenticated]),
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
      const slot = TIME_SLOTS[selectedSlotIdx];
      const now = new Date();
      const scheduled = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        slot.hour,
        slot.minute,
        0,
      );
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

        router.replace({
          pathname: "/(home)/pickup-success",
          params: { pickupId: res.data.pickup.id },
        });
        return;
      } catch (err) {
        showAlert("Error", "Could not schedule pickup. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Feather name="arrow-left" size={22} color={colors.neutral.black} />
        </Pressable>
        <Text style={styles.headerTitle}>Schedule Pickup</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Time ─────────────────────────────────────────────────────────── */}
        <View style={styles.sectionRow}>
          <Feather name="clock" size={16} color={colors.neutral.black} />
          <Text style={styles.sectionLabel}>Time</Text>
        </View>
        <View style={styles.chipRow}>
          {TIME_SLOTS.map((s, i) => (
            <Pressable
              key={i}
              style={[styles.chip, selectedSlotIdx === i && styles.chipActive]}
              onPress={() => setSelectedSlotIdx(i)}
            >
              <Text
                style={[
                  styles.chipLabel,
                  selectedSlotIdx === i && styles.chipLabelActive,
                ]}
              >
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Estimated Weight ─────────────────────────────────────────────── */}
        <View style={styles.sectionRow}>
          <Feather name="package" size={16} color={colors.neutral.black} />
          <Text style={styles.sectionLabel}>Estimated Weight</Text>
        </View>
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

        {/* ── Address ──────────────────────────────────────────────────────── */}
        <View style={[styles.sectionRow, styles.sectionRowSpaced]}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
            }}
          >
            <Feather name="map-pin" size={16} color={colors.neutral.black} />
            <Text style={styles.sectionLabel}>Address</Text>
          </View>
          <Pressable onPress={() => router.push("/(location)/add-address")}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Feather
                name="edit-2"
                size={12}
                color={colors.primary.green600}
              />
              <Text style={styles.changeLink}>Change</Text>
            </View>
          </Pressable>
        </View>

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

        {/* ── Select Categories ─────────────────────────────────────────────── */}
        <View style={styles.sectionRow}>
          <Feather name="grid" size={16} color={colors.neutral.black} />
          <Text style={styles.sectionLabel}>Select Categories</Text>
        </View>
        <Text style={styles.sectionSub}>What type of scrap do you have?</Text>

        <View style={styles.catGrid}>
          {categories.map((cat) => {
            const icon = getCatIcon(cat.name);
            const isActive = selectedCats.has(cat.id);
            return (
              <Pressable
                key={cat.id}
                style={[styles.catChip, isActive && styles.catChipActive]}
                onPress={() => toggleCat(cat.id)}
              >
                {icon ? (
                  <Image
                    source={icon}
                    style={styles.catIcon}
                    resizeMode="contain"
                  />
                ) : (
                  <Feather
                    name="box"
                    size={28}
                    color={
                      isActive ? colors.neutral.white : colors.neutral.gray400
                    }
                  />
                )}
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

        {/* ── View Rate List ────────────────────────────────────────────────── */}
        <Pressable
          style={styles.rateLink}
          onPress={() => router.push("/(tabs)/scrap-rates" as any)}
        >
          <View style={styles.rateLinkRow}>
            <Image
              source={require("../../assets/images/brands/Untitled design/newspaper.png")}
              style={styles.rateLinkIcon}
              resizeMode="contain"
            />
            <Image
              source={require("../../assets/images/brands/Untitled design/metal.png")}
              style={styles.rateLinkIcon}
              resizeMode="contain"
            />
            <Image
              source={require("../../assets/images/brands/Untitled design/laptop.png")}
              style={styles.rateLinkIcon}
              resizeMode="contain"
            />
            <Text style={styles.rateLinkText}>View Rate List</Text>
            <Feather
              name="arrow-right"
              size={14}
              color={colors.primary.green600}
            />
          </View>
        </Pressable>
      </ScrollView>

      {/* ── Complete Pickup CTA ───────────────────────────────────────────── */}
      <View style={styles.ctaWrap}>
        <Pressable
          style={[styles.ctaBtn, !!loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={!!loading}
        >
          <Text style={styles.ctaBtnText}>
            {loading ? "Scheduling..." : "COMPLETE PICKUP"}
          </Text>
          {!loading && (
            <Feather
              name="arrow-right"
              size={20}
              color={colors.neutral.white}
            />
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },

  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    ...typography.h3,
    color: colors.neutral.black,
    textAlign: "center",
  },

  content: { padding: spacing.xl, paddingBottom: 110 },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionRowSpaced: { justifyContent: "space-between" },
  sectionLabel: {
    ...typography.bodySmMedium,
    color: colors.neutral.black,
    fontWeight: "600" as const,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.neutral.gray600,
    marginBottom: spacing.md,
    marginTop: -spacing.xs,
  },
  changeLink: {
    ...typography.caption,
    color: colors.primary.green600,
    fontWeight: "600" as const,
  },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
    backgroundColor: colors.neutral.white,
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
    aspectRatio: 0.9,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
    backgroundColor: colors.neutral.white,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    gap: spacing.xs,
  },
  catChipActive: {
    backgroundColor: colors.primary.green600,
    borderColor: colors.primary.green600,
  },
  catIcon: { width: 44, height: 44 },
  catLabel: {
    ...typography.caption,
    color: colors.neutral.gray600,
    textAlign: "center",
  },
  catLabelActive: { color: colors.neutral.white, fontWeight: "600" as const },

  rateLink: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.neutral.gray100,
  },
  rateLinkRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rateLinkIcon: { width: 26, height: 26 },
  rateLinkText: {
    flex: 1,
    ...typography.bodySmMedium,
    color: colors.primary.green600,
  },

  ctaWrap: {
    padding: spacing.xl,
    paddingBottom: Platform.OS === "ios" ? 32 : spacing.xl,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral.black,
    borderRadius: radii.pill,
    height: 56,
    gap: spacing.md,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.neutral.white,
    letterSpacing: 0.5,
  },
});
