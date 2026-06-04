import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Button } from "../../src/components/ui/Button";
import { Header } from "../../src/components/shared/Header";
import { pickupService } from "../../src/services/pickup";
import { Pickup } from "../../src/types";
import { colors, radii, spacing, typography } from "../../src/theme";

// ─── Rate Card (same as scrap-rates fallback) ────────────────────────────────
const RATE_MAP: Record<string, number> = {
  "paper-1": 14,   // Newspaper
  "paper-2": 10,   // Books
  "metal-1": 28,   // Iron
  "metal-2": 450,  // Copper
  "ewaste-1": 500, // Laptop (per unit)
  "ewaste-2": 200, // Phone (per unit)
  "carton-1": 7,   // Cardboard
  "carton-2": 5,   // Plastic Bottles
  "others-1": 30,  // Battery
  "appliance-1": 200, // Fridge
};

const ITEM_NAMES: Record<string, string> = {
  "paper-1": "Newspaper",
  "paper-2": "Books / Magazines",
  "metal-1": "Iron / Steel",
  "metal-2": "Copper Wire",
  "ewaste-1": "Laptop",
  "ewaste-2": "Mobile Phone",
  "carton-1": "Cardboard",
  "carton-2": "Plastic Bottles",
  "others-1": "Battery",
  "appliance-1": "Refrigerator / Fridge",
};

const CAT_LABELS: Record<string, string> = {
  paper: "📰 Paper",
  metal: "🔩 Metals",
  ewaste: "💻 E-Waste",
  carton: "📦 Carton / Plastic",
  others: "🔋 Others",
  appliance: "🏠 Big Appliances",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  accepted: colors.primary.green600,
  completed: colors.primary.green600,
  cancelled: colors.functional.error,
};

const STATUS_ICONS: Record<string, string> = {
  pending: "clock",
  accepted: "check-circle",
  completed: "award",
  cancelled: "x-circle",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getCategoryFromItemId(id: string): string {
  const prefix = id.split("-")[0];
  return CAT_LABELS[prefix] || prefix;
}

function calcExpectedAmount(items: any[]): number {
  return items.reduce((total, item) => {
    const rate = RATE_MAP[item.scrap_item_id] ?? 0;
    const qty = item.estimated_qty ?? 0;
    return total + rate * qty;
  }, 0);
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, mono && { fontFamily: "monospace", fontSize: 12 }]}>{value}</Text>
    </View>
  );
}

export default function RequestDetailScreen() {
  const { id, pickupJson } = useLocalSearchParams<{
    id: string;
    pickupJson: string;
  }>();

  const [pickup, setPickup] = useState<Pickup | null>(() =>
    pickupJson ? JSON.parse(pickupJson) : null,
  );
  const [loading, setLoading] = useState(!pickup);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (pickup || !id) return;
    setLoading(true);
    pickupService
      .get(id)
      .then((r) => {
        setPickup({ ...r.data.pickup, items: r.data.pickup?.items || [] });
      })
      .catch((err: any) => {
        if (err?.isNetworkError || err?.code === "ECONNABORTED") {
          setLoadError("Network timeout. Please check your internet and retry.");
        } else if (err?.response?.status === 401) {
          setLoadError("Authentication error. Please login again.");
        } else {
          setLoadError(err?.response?.data?.message || "Unable to load pickup details.");
        }
      })
      .finally(() => setLoading(false));
  }, [id, pickup]);

  const handleCancel = () => {
    if (!pickup) return;
    if (pickup.status !== "pending") {
      Alert.alert("Cannot cancel", "Only pending pickups can be cancelled.");
      return;
    }
    Alert.alert(
      "Cancel Pickup",
      "Are you sure you want to cancel this pickup? This cannot be undone.",
      [
        { text: "No, Keep it", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await pickupService.cancel(id);
              setPickup((prev) =>
                prev
                  ? { ...prev, status: "cancelled", adminNote: "User cancelled this pickup" }
                  : prev,
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.response?.data?.message || "Could not cancel pickup. Try again.",
              );
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  // ── Loading / Error state ──────────────────────────────────────────────────
  if (!pickup) {
    return (
      <SafeAreaView style={s.safe}>
        <Header title="Pickup Detail" />
        <View style={s.center}>
          {loading ? (
            <Text style={s.dimText}>Loading…</Text>
          ) : loadError ? (
            <View style={s.errorPanel}>
              <Feather name="wifi-off" size={40} color={colors.functional.error} />
              <Text style={[s.dimText, { color: colors.functional.error, textAlign: "center", marginTop: spacing.md }]}>
                {loadError}
              </Text>
              <Pressable
                style={s.retryBtn}
                onPress={() => { setLoadError(null); }}
              >
                <Text style={s.retryLabel}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={s.dimText}>Pickup not found.</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const statusColor = STATUS_COLORS[pickup.status] ?? colors.neutral.gray400;
  const statusIcon = STATUS_ICONS[pickup.status] ?? "info";
  const canCancel = pickup.status === "pending";
  const items: any[] = (pickup as any).items ?? [];
  const address: any = (pickup as any).address;
  const expectedAmount = calcExpectedAmount(items);
  const isCancelled = pickup.status === "cancelled";

  const STATUS_STEPS = [
    { key: "pending", label: "Scheduled", icon: "calendar" },
    { key: "accepted", label: "Confirmed", icon: "check-circle" },
    { key: "completed", label: "Completed", icon: "award" },
  ];
  const stepIndex = STATUS_STEPS.findIndex((st) => st.key === pickup.status);
  const activeIndex = isCancelled ? -1 : stepIndex >= 0 ? stepIndex : 0;

  const addressText = address
    ? [address.flat_number, address.locality, address.city, address.pincode]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <SafeAreaView style={s.safe}>
      <Header title="Track Pickup" />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── STATUS BANNER ──────────────────────────────────────────────── */}
        <LinearGradient
          colors={[statusColor + "22", statusColor + "08"]}
          style={s.statusBanner}
        >
          <View style={[s.statusIconCircle, { backgroundColor: statusColor + "22" }]}>
            <Feather name={statusIcon as any} size={22} color={statusColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.statusTitle, { color: statusColor }]}>
              {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
            </Text>
            <Text style={s.statusSub}>
              {pickup.status === "pending" && "Your pickup is scheduled and awaiting confirmation."}
              {pickup.status === "accepted" && "Your pickup has been confirmed! We're on our way."}
              {pickup.status === "completed" && "Pickup completed. Thank you for recycling! 🌱"}
              {pickup.status === "cancelled" && "This pickup has been cancelled."}
            </Text>
          </View>
        </LinearGradient>

        {/* ── CANCELLED NOTE ────────────────────────────────────────────── */}
        {isCancelled && pickup.adminNote && (
          <View style={s.cancelNote}>
            <Feather name="alert-circle" size={16} color={colors.functional.error} />
            <Text style={s.cancelNoteText}>{(pickup as any).adminNote}</Text>
          </View>
        )}

        {/* ── TRACKING TIMELINE ─────────────────────────────────────────── */}
        {!isCancelled && (
          <View style={s.card}>
            <Text style={s.cardTitle}>📍 Tracking Progress</Text>
            <View style={s.timeline}>
              {STATUS_STEPS.map((step, index) => {
                const done = index <= activeIndex;
                return (
                  <View key={step.key} style={s.timelineItem}>
                    <View style={[s.tBullet, { backgroundColor: done ? statusColor : colors.neutral.gray200 }]}>
                      <Feather name={step.icon as any} size={12} color={done ? "#fff" : colors.neutral.gray400} />
                    </View>
                    {index < STATUS_STEPS.length - 1 && (
                      <View style={[s.tLine, { backgroundColor: index < activeIndex ? statusColor : colors.neutral.gray200 }]} />
                    )}
                    <Text style={[s.tLabel, done && { color: colors.neutral.black, fontWeight: "600" }]}>
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── PICKUP SUMMARY CARD ────────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📋 Pickup Summary</Text>
          <InfoRow label="Pickup ID" value={(pickup.id ?? "N/A").toUpperCase()} mono />
          <View style={s.divider} />
          {(pickup.created_at || pickup.createdAt) && (
            <>
              <InfoRow label="Booked On" value={formatDateTime((pickup.created_at || pickup.createdAt) as string)} />
              <View style={s.divider} />
            </>
          )}
          {pickup.scheduled_at && (
            <>
              <InfoRow label="Scheduled For" value={formatDateTime(pickup.scheduled_at as any)} />
              <View style={s.divider} />
            </>
          )}
        </View>

        {/* ── ADDRESS ───────────────────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📍 Pickup Address</Text>
          {addressText ? (
            <View style={s.addrBox}>
              <Feather name="home" size={18} color={colors.primary.green600} />
              <Text style={s.addrText}>{addressText}</Text>
            </View>
          ) : (
            <Text style={s.dimText}>Address details not available</Text>
          )}
        </View>

        {/* ── MATERIALS ─────────────────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>♻️ Materials for Pickup</Text>
          {items.length === 0 ? (
            <Text style={s.dimText}>No items listed</Text>
          ) : (
            items.map((item: any, idx: number) => {
              const itemName = ITEM_NAMES[item.scrap_item_id] ?? getCategoryFromItemId(item.scrap_item_id);
              const rate = RATE_MAP[item.scrap_item_id] ?? 0;
              const qty = item.estimated_qty ?? 0;
              const est = rate * qty;

              return (
                <View key={idx} style={[s.itemRow, idx !== items.length - 1 && s.itemRowBorder]}>
                  <View style={s.itemLeft}>
                    <View style={s.itemDot} />
                    <View>
                      <Text style={s.itemName}>{itemName}</Text>
                      <Text style={s.itemCat}>{getCategoryFromItemId(item.scrap_item_id)}</Text>
                    </View>
                  </View>
                  <View style={s.itemRight}>
                    <Text style={s.itemQty}>~{qty} kg</Text>
                    {rate > 0 && (
                      <Text style={s.itemEst}>₹{rate}/kg → ≈₹{est.toLocaleString("en-IN")}</Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ── EXPECTED EARNING ──────────────────────────────────────────── */}
        {items.length > 0 && expectedAmount > 0 && (
          <LinearGradient colors={["#E8F5E9", "#C8F5C2"]} style={s.earningsCard}>
            <View>
              <Text style={s.earningsLabel}>Expected Earnings</Text>
              <Text style={s.earningsNote}>Based on estimated weights & current rates</Text>
            </View>
            <Text style={s.earningsAmount}>
              ₹{expectedAmount.toLocaleString("en-IN")}
            </Text>
          </LinearGradient>
        )}

        {/* ── NOTES ─────────────────────────────────────────────────────── */}
        {(pickup as any).notes && (
          <View style={s.card}>
            <Text style={s.cardTitle}>📝 Your Notes</Text>
            <Text style={s.notesText}>{(pickup as any).notes}</Text>
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── CANCEL BUTTON ─────────────────────────────────────────────────── */}
      {canCancel && (
        <View style={s.cta}>
          <Button
            label="Cancel Pickup"
            onPress={handleCancel}
            variant="secondary"
            loading={cancelling}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F8F6" },
  content: { padding: spacing.xl, paddingBottom: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  dimText: { ...typography.bodySm, color: colors.neutral.gray400, textAlign: "center" },

  // ── Status banner
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    marginBottom: spacing.lg,
  },
  statusIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  statusTitle: { ...typography.h3, fontWeight: "700" as const },
  statusSub: { ...typography.caption, color: colors.neutral.gray600, marginTop: 2, lineHeight: 18 },

  // ── Cancelled note
  cancelNote: {
    flexDirection: "row", alignItems: "flex-start", gap: spacing.sm,
    backgroundColor: colors.functional.errorBg,
    padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.lg,
    borderLeftWidth: 3, borderLeftColor: colors.functional.error,
  },
  cancelNoteText: { ...typography.bodySmMedium, color: colors.functional.error, flex: 1, lineHeight: 20 },

  // ── Cards
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
  },
  cardTitle: {
    ...typography.bodySmMedium,
    color: colors.neutral.black,
    fontWeight: "700" as const,
    marginBottom: spacing.md,
    fontSize: 14,
  },

  // ── Timeline
  timeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: spacing.sm,
  },
  timelineItem: { flex: 1, alignItems: "center", position: "relative" },
  tBullet: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    marginBottom: spacing.sm,
  },
  tLine: {
    position: "absolute",
    top: 16, left: "60%", right: "-60%",
    height: 2, zIndex: -1,
  },
  tLabel: {
    ...typography.caption, color: colors.neutral.gray400,
    textAlign: "center", lineHeight: 16,
  },

  // ── Info rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  infoLabel: { ...typography.caption, color: colors.neutral.gray400, flex: 1 },
  infoValue: { ...typography.bodySmMedium, color: colors.neutral.black, textAlign: "right", flex: 2 },
  divider: { height: 1, backgroundColor: colors.neutral.gray100 },

  // ── Address
  addrBox: {
    flexDirection: "row", alignItems: "flex-start", gap: spacing.md,
    backgroundColor: colors.primary.green50,
    padding: spacing.md, borderRadius: radii.md,
  },
  addrText: { ...typography.bodySm, color: colors.neutral.gray600, flex: 1, lineHeight: 20 },

  // ── Material items
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.neutral.gray100 },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  itemDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.primary.green600,
  },
  itemName: { ...typography.bodySmMedium, color: colors.neutral.black },
  itemCat: { ...typography.caption, color: colors.neutral.gray400, marginTop: 2 },
  itemRight: { alignItems: "flex-end" },
  itemQty: { ...typography.bodySmMedium, color: colors.neutral.black },
  itemEst: { ...typography.caption, color: colors.primary.green600, marginTop: 2 },

  // ── Earnings card
  earningsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radii.xl,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primary.green200,
  },
  earningsLabel: { ...typography.bodySmMedium, color: colors.primary.green700, fontWeight: "700" as const },
  earningsNote: { ...typography.caption, color: colors.primary.green600, marginTop: 2, lineHeight: 16 },
  earningsAmount: {
    fontSize: 28, fontWeight: "800" as const,
    color: colors.primary.green700,
  },

  // ── Notes
  notesText: {
    ...typography.bodySm, color: colors.neutral.gray600,
    backgroundColor: "#FFFDE7",
    padding: spacing.md,
    borderRadius: radii.md,
    lineHeight: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },

  // ── Error panel
  errorPanel: { alignItems: "center", gap: spacing.md },
  retryBtn: {
    marginTop: spacing.md, paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral.black, borderRadius: radii.lg,
  },
  retryLabel: {
    ...typography.bodySmMedium,
    color: colors.neutral.white,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // ── CTA
  cta: {
    padding: spacing.xl,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
    backgroundColor: colors.neutral.white,
  },
});
