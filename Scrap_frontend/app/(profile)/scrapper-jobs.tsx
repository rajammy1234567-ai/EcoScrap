import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { scrapperService, WalletInfo } from "../../src/services/scrapper";
import { contentService } from "../../src/services/content";
import { useAuth } from "../../src/context/AuthContext";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Button } from "../../src/components/ui/Button";
import {
  colors,
  radii,
  spacing,
  typography,
  shadows,
  layout,
} from "../../src/theme";

type Tab = "available" | "mine";

interface JobPickup {
  id: string;
  _id?: string;
  displayId?: string;
  status: string;
  scheduled_at?: string;
  createdAt?: string;
  notes?: string;
  paymentAmount?: number;
  paymentStatus?: string;
  distanceKm?: number | null;
  image_urls?: string[];
  items?: { scrap_item_id: string; estimated_qty?: number }[];
  address?: {
    flat_number?: string;
    locality?: string;
    city?: string;
    pincode?: string;
  } | null;
  customer?: { name?: string; phone?: string; payoutUpi?: string | null };
  location?: { latitude?: number; longitude?: number };
}

export default function ScrapperJobsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>("available");
  const [jobs, setJobs] = useState<JobPickup[]>([]);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const [payJob, setPayJob] = useState<JobPickup | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payUpi, setPayUpi] = useState("");
  const [payMethod, setPayMethod] = useState<"upi" | "cash">("upi");
  const [payWeight, setPayWeight] = useState("");
  const [paying, setPaying] = useState(false);
  const [scrapperHasLocation, setScrapperHasLocation] = useState(true);
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState(10);

  const isScrapper =
    user?.role === "scrapper" || user?.scrapperStatus === "approved";

  const load = useCallback(async () => {
    if (!isAuthenticated || !isScrapper) {
      setJobs([]);
      setLoading(false);
      return;
    }
    try {
      // Refresh scrapper GPS so 10 km matching is accurate
      try {
        const { syncLocationToServer } = await import(
          "../../src/services/location"
        );
        await syncLocationToServer();
      } catch {
        // continue without fresh GPS
      }

      const [jobsRes, walletRes] = await Promise.all([
        scrapperService.listJobs({ tab }),
        scrapperService.getWallet({ limit: 1 }).catch(() => null),
      ]);
      setJobs(jobsRes.data.pickups || []);
      if (typeof jobsRes.data.scrapperHasLocation === "boolean") {
        setScrapperHasLocation(jobsRes.data.scrapperHasLocation);
      }
      if (jobsRes.data.nearbyRadiusKm) {
        setNearbyRadiusKm(jobsRes.data.nearbyRadiusKm);
      }
      if (walletRes?.data?.wallet) setWallet(walletRes.data.wallet);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, isScrapper, tab]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const showAlert = (title: string, msg: string) => {
    if (Platform.OS === "web") window.alert(`${title}\n${msg}`);
    else Alert.alert(title, msg);
  };

  const handleAccept = async (id: string) => {
    setActingId(id);
    try {
      await scrapperService.acceptJob(id);
      showAlert("Accepted", "Job assigned. Collect scrap then pay customer.");
      load();
    } catch (err: any) {
      showAlert(
        "Error",
        err?.response?.data?.message || "Could not accept job",
      );
    } finally {
      setActingId(null);
    }
  };

  const openPay = (job: JobPickup) => {
    setPayJob(job);
    setPayAmount("");
    setPayUpi(job.customer?.payoutUpi || "");
    setPayMethod("upi");
    setPayWeight("");
  };

  const handlePay = async () => {
    if (!payJob) return;
    const amount = Number(payAmount);
    if (!amount || amount < 1) {
      showAlert("Amount required", "Enter the amount to pay the customer");
      return;
    }
    if (wallet && wallet.balance < amount) {
      showAlert(
        "Insufficient balance",
        `Wallet has ₹${wallet.balance}. Ask admin to top-up.`,
      );
      return;
    }

    const id = payJob.id || payJob._id || "";
    setPaying(true);
    try {
      const res = await scrapperService.completeAndPay(id, {
        amount,
        customerUpi: payMethod === "upi" ? payUpi.trim() || undefined : undefined,
        method: payMethod,
        actualWeightKg: payWeight ? Number(payWeight) : undefined,
      });
      setPayJob(null);
      if (res.data.wallet?.balance != null) {
        setWallet((w) =>
          w
            ? {
                ...w,
                balance: res.data.wallet.balance,
                totalDebited:
                  (w.totalDebited || 0) + Number(payAmount),
              }
            : {
                balance: res.data.wallet.balance,
                totalCredited: 0,
                totalDebited: Number(payAmount),
              },
        );
      }
      const paidMsg =
        res.data.message ||
        `₹${amount} paid. Remaining wallet: ₹${res.data.wallet?.balance ?? "—"}`;

      // Optional: happy customer photo for home page
      const askHappy = async () => {
        const pick = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!pick.granted) {
          showAlert("Paid ✓", paidMsg);
          load();
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.55,
          base64: true,
        });
        if (result.canceled || !result.assets?.[0]?.base64) {
          showAlert("Paid ✓", paidMsg);
          load();
          return;
        }
        const mime = result.assets[0].mimeType || "image/jpeg";
        const photoUrl = `data:${mime};base64,${result.assets[0].base64}`;
        try {
          await contentService.postHappyCustomer({
            pickupId: id,
            photoUrl,
            customerName: payJob.customer?.name,
            city: payJob.address?.city,
            caption: "Pickup completed successfully",
          });
          showAlert("Paid ✓", `${paidMsg}\nHappy customer photo posted!`);
        } catch {
          showAlert("Paid ✓", paidMsg);
        }
        load();
      };

      if (Platform.OS === "web") {
        if (window.confirm(`${paidMsg}\n\nAdd a Happy Customer photo for the home page?`)) {
          await askHappy();
        } else {
          load();
        }
      } else {
        Alert.alert("Paid ✓", paidMsg, [
          { text: "Skip", onPress: () => load() },
          { text: "Add photo", onPress: () => askHappy() },
        ]);
      }
    } catch (err: any) {
      showAlert(
        "Payment failed",
        err?.response?.data?.message || "Could not complete payment",
      );
    } finally {
      setPaying(false);
    }
  };

  const formatAddr = (a?: JobPickup["address"]) => {
    if (!a) return "Address not available";
    return [a.flat_number, a.locality, a.city, a.pincode]
      .filter(Boolean)
      .join(", ");
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "Flexible";
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderJob = ({ item }: { item: JobPickup }) => {
    const id = item.id || item._id || "";
    const isMine = tab === "mine";
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.pkgId}>{item.displayId || id.slice(-6)}</Text>
          <View
            style={[
              styles.badge,
              item.status === "completed" && styles.badgeDone,
              item.status === "accepted" && styles.badgeAccepted,
              item.status === "pending" && styles.badgePending,
            ]}
          >
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Feather name="user" size={14} color={colors.neutral.gray600} />
          <Text style={styles.rowText}>
            {item.customer?.name || "Customer"} · {item.customer?.phone || "—"}
          </Text>
        </View>
        <View style={styles.row}>
          <Feather name="map-pin" size={14} color={colors.neutral.gray600} />
          <Text style={styles.rowText}>{formatAddr(item.address)}</Text>
        </View>
        {item.distanceKm != null && (
          <View style={styles.row}>
            <Feather name="navigation" size={14} color={colors.primary.green600} />
            <Text style={[styles.rowText, { color: colors.primary.green700, fontWeight: "600" }]}>
              {item.distanceKm < 1
                ? `${Math.round(item.distanceKm * 1000)} m away`
                : `${item.distanceKm.toFixed(1)} km away`}
              {" · within "}
              {nearbyRadiusKm} km
            </Text>
          </View>
        )}
        <View style={styles.row}>
          <Feather name="calendar" size={14} color={colors.neutral.gray600} />
          <Text style={styles.rowText}>
            {formatDate(item.scheduled_at || item.createdAt)}
          </Text>
        </View>
        <View style={styles.row}>
          <Feather name="package" size={14} color={colors.neutral.gray600} />
          <Text style={styles.rowText}>
            {item.items?.length || 0} item(s)
            {item.items?.[0]?.estimated_qty
              ? ` · ~${item.items[0].estimated_qty} kg est.`
              : ""}
          </Text>
        </View>

        {!!item.notes && (
          <View style={styles.row}>
            <Feather name="file-text" size={14} color={colors.neutral.gray600} />
            <Text style={styles.rowText} numberOfLines={3}>
              Note: {item.notes}
            </Text>
          </View>
        )}

        {!!item.image_urls?.length && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imgScroll}
            contentContainerStyle={{ gap: 8 }}
          >
            {item.image_urls.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={styles.jobImg}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {item.paymentStatus === "paid" && (
          <View style={styles.paidBox}>
            <Feather
              name="check-circle"
              size={14}
              color={colors.primary.green600}
            />
            <Text style={styles.paidText}>
              Paid customer ₹{item.paymentAmount}
            </Text>
          </View>
        )}

        {item.status !== "completed" && item.status !== "cancelled" && (
          <View style={styles.actions}>
            {!isMine && (
              <Button
                label="Accept Job"
                variant="primaryGreen"
                loading={actingId === id}
                onPress={() => handleAccept(id)}
                style={{ flex: 1 }}
              />
            )}
            {isMine && (
              <Button
                label="Complete & Pay"
                variant="primaryDark"
                onPress={() => openPay(item)}
                style={{ flex: 1 }}
              />
            )}
          </View>
        )}
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe}>
        <HeaderBar
          onBack={() => router.back()}
          onWallet={() => router.push("/(profile)/scrapper-wallet")}
          balance={null}
        />
        <EmptyState
          title="Login required"
          subtitle="Login to view scrapper jobs"
          icon="lock"
        />
      </SafeAreaView>
    );
  }

  if (!isScrapper) {
    return (
      <SafeAreaView style={styles.safe}>
        <HeaderBar
          onBack={() => router.back()}
          onWallet={() => router.push("/(profile)/scrapper-wallet")}
          balance={null}
        />
        <EmptyState
          title="Not a scrapper yet"
          subtitle="Submit KYC from Profile → Become a Scrapper. After admin approval + ₹5000 credit, jobs open here."
          ctaLabel="Become a Scrapper"
          onCta={() => router.push("/(profile)/become-scrapper")}
          icon="tool"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderBar
        onBack={() => router.back()}
        onWallet={() => router.push("/(profile)/scrapper-wallet")}
        balance={wallet?.balance ?? null}
      />

      <View style={styles.tabs}>
        {(
          [
            { key: "available", label: "Available" },
            { key: "mine", label: "My Jobs" },
          ] as const
        ).map((t) => (
          <Pressable
            key={t.key}
            onPress={() => {
              setTab(t.key);
              setLoading(true);
            }}
            style={[styles.tab, tab === t.key && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, tab === t.key && styles.tabTextActive]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "available" && (
        <View
          style={[
            styles.locBanner,
            !scrapperHasLocation && styles.locBannerWarn,
          ]}
        >
          <Feather
            name={scrapperHasLocation ? "navigation" : "alert-circle"}
            size={14}
            color={
              scrapperHasLocation
                ? colors.primary.green700
                : colors.functional.error
            }
          />
          <Text
            style={[
              styles.locBannerText,
              !scrapperHasLocation && styles.locBannerTextWarn,
            ]}
          >
            {scrapperHasLocation
              ? `Showing pickups within ${nearbyRadiusKm} km of your location`
              : "Enable location to see nearby jobs (within 10 km) and get notifications"}
          </Text>
        </View>
      )}

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
        renderItem={renderJob}
        contentContainerStyle={
          jobs.length === 0 ? styles.emptyList : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primary.green600}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title={
                tab === "available" ? "No nearby requests" : "No jobs assigned"
              }
              subtitle={
                tab === "available"
                  ? scrapperHasLocation
                    ? `No open pickups within ${nearbyRadiusKm} km right now. Pull to refresh.`
                    : "Turn on location so we can show pickups near you."
                  : "Accept available jobs, then complete & pay."
              }
              icon="inbox"
            />
          ) : (
            <Text style={styles.loadingText}>Loading jobs...</Text>
          )
        }
      />

      {/* Pay modal */}
      <Modal visible={!!payJob} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Complete & Pay Customer</Text>
            <Text style={styles.modalSub}>
              Wallet balance: ₹{wallet?.balance ?? "—"} · Pickup{" "}
              {payJob?.displayId}
            </Text>

            <Text style={styles.fieldLabel}>Amount to pay (₹) *</Text>
            <TextInput
              style={styles.input}
              value={payAmount}
              onChangeText={setPayAmount}
              keyboardType="numeric"
              placeholder="e.g. 450"
              placeholderTextColor={colors.neutral.gray400}
            />

            <Text style={styles.fieldLabel}>Payment method</Text>
            <View style={styles.methodRow}>
              {(["upi", "cash"] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setPayMethod(m)}
                  style={[
                    styles.methodChip,
                    payMethod === m && styles.methodChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.methodText,
                      payMethod === m && styles.methodTextActive,
                    ]}
                  >
                    {m.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            {payMethod === "upi" && (
              <>
                <Text style={styles.fieldLabel}>Customer UPI</Text>
                <TextInput
                  style={styles.input}
                  value={payUpi}
                  onChangeText={setPayUpi}
                  placeholder="customer@upi"
                  autoCapitalize="none"
                  placeholderTextColor={colors.neutral.gray400}
                />
              </>
            )}

            <Text style={styles.fieldLabel}>Actual weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={payWeight}
              onChangeText={setPayWeight}
              keyboardType="decimal-pad"
              placeholder="optional"
              placeholderTextColor={colors.neutral.gray400}
            />

            <Text style={styles.modalNote}>
              Amount is deducted from your company float wallet. Admin Razorpay
              is used for UPI when enabled. Full record goes to admin ledger.
            </Text>

            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => setPayJob(null)}
                style={{ flex: 1 }}
              />
              <Button
                label={paying ? "Paying..." : "Pay & Complete"}
                variant="primaryGreen"
                loading={paying}
                onPress={handlePay}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function HeaderBar({
  onBack,
  onWallet,
  balance,
}: {
  onBack: () => void;
  onWallet: () => void;
  balance: number | null;
}) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
        <Feather name="arrow-left" size={22} color={colors.neutral.black} />
      </Pressable>
      <Text style={styles.headerTitle}>Scrapper Jobs</Text>
      <Pressable onPress={onWallet} style={styles.walletBtn} hitSlop={8}>
        <Feather name="credit-card" size={16} color={colors.primary.green600} />
        <Text style={styles.walletBtnText}>
          {balance != null ? `₹${balance}` : "Wallet"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: layout.screenBg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.lg,
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
  headerTitle: {
    flex: 1,
    ...typography.h3,
    color: colors.neutral.black,
    textAlign: "center",
  },
  walletBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary.green50,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  walletBtnText: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.primary.green700,
  },
  tabs: {
    flexDirection: "row",
    margin: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: 4,
    ...shadows.sm,
  },
  locBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.green50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary.green100,
  },
  locBannerWarn: {
    backgroundColor: colors.functional.errorBg,
    borderColor: "#FECACA",
  },
  locBannerText: {
    ...typography.caption,
    color: colors.primary.green700,
    flex: 1,
    fontWeight: "600",
  },
  locBannerTextWarn: {
    color: colors.functional.error,
  },
  imgScroll: { marginTop: spacing.sm, marginBottom: spacing.sm },
  jobImg: {
    width: 88,
    height: 88,
    borderRadius: radii.lg,
    backgroundColor: colors.neutral.gray100,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: radii.md,
  },
  tabActive: { backgroundColor: colors.primary.green600 },
  tabText: { ...typography.bodySmMedium, color: colors.neutral.gray600 },
  tabTextActive: { color: colors.neutral.white, fontWeight: "700" },
  list: { padding: spacing.lg, paddingTop: 0, paddingBottom: 40 },
  emptyList: { flexGrow: 1 },
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  pkgId: {
    ...typography.bodySmMedium,
    fontWeight: "700",
    color: colors.neutral.black,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.neutral.gray100,
  },
  badgePending: { backgroundColor: colors.functional.warningBg },
  badgeAccepted: { backgroundColor: colors.functional.infoBg },
  badgeDone: { backgroundColor: colors.primary.green50 },
  badgeText: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.neutral.gray800,
    textTransform: "capitalize",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  rowText: { flex: 1, ...typography.bodySm, color: colors.neutral.gray600 },
  paidBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
    backgroundColor: colors.primary.green50,
    padding: spacing.sm,
    borderRadius: radii.md,
  },
  paidText: {
    ...typography.bodySmMedium,
    color: colors.primary.green700,
    fontWeight: "600",
  },
  actions: { flexDirection: "row", marginTop: spacing.md, gap: spacing.sm },
  loadingText: {
    textAlign: "center",
    marginTop: spacing["3xl"],
    color: colors.neutral.gray400,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    paddingBottom: Platform.OS === "ios" ? 36 : spacing.xl,
  },
  modalTitle: { ...typography.h3, color: colors.neutral.black },
  modalSub: {
    ...typography.caption,
    color: colors.neutral.gray400,
    marginBottom: spacing.lg,
    marginTop: 4,
  },
  fieldLabel: {
    ...typography.bodySmMedium,
    color: colors.neutral.black,
    marginBottom: 6,
    marginTop: spacing.sm,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    ...typography.body,
    color: colors.neutral.black,
  },
  methodRow: { flexDirection: "row", gap: spacing.sm },
  methodChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
  },
  methodChipActive: {
    borderColor: colors.primary.green600,
    backgroundColor: colors.primary.green50,
  },
  methodText: { ...typography.bodySmMedium, color: colors.neutral.gray600 },
  methodTextActive: { color: colors.primary.green700, fontWeight: "700" },
  modalNote: {
    ...typography.caption,
    color: colors.neutral.gray400,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  modalActions: { flexDirection: "row", gap: spacing.md },
});
