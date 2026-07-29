import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Pickup, pickupEarnedAmount } from "../../types";
import { colors, radii, shadows, spacing, typography } from "../../theme";

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; icon: string; label: string }
> = {
  pending: {
    color: colors.functional.warning,
    bg: colors.functional.warningBg,
    icon: "clock",
    label: "Scheduled",
  },
  accepted: {
    color: colors.primary.green600,
    bg: colors.primary.green50,
    icon: "truck",
    label: "On the way",
  },
  completed: {
    color: colors.primary.green700,
    bg: colors.primary.green50,
    icon: "check-circle",
    label: "Completed",
  },
  cancelled: {
    color: colors.functional.error,
    bg: colors.functional.errorBg,
    icon: "x-circle",
    label: "Cancelled",
  },
};

interface Props {
  pickup: Pickup;
  onPress: () => void;
}

export function PickupCard({ pickup, onPress }: Props) {
  const cfg = STATUS_CONFIG[pickup.status] ?? STATUS_CONFIG.pending;
  const date = pickup.scheduled_at
    ? new Date(pickup.scheduled_at)
    : new Date(pickup.created_at || pickup.createdAt || Date.now());
  const dateStr = date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeStr = pickup.scheduled_at
    ? new Date(pickup.scheduled_at).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;
  const itemCount = pickup.items?.length ?? 0;
  const itemLabel = `${itemCount} categor${itemCount !== 1 ? "ies" : "y"}`;
  const displayId =
    pickup.displayId ?? String(pickup.id || "").slice(0, 8).toUpperCase();
  const earned = pickupEarnedAmount(pickup);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Left status accent */}
      <View style={[styles.accent, { backgroundColor: cfg.color }]} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
            <Feather name={cfg.icon as any} size={12} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>
              {cfg.label}
            </Text>
          </View>
          <Text style={styles.pickupId}>#{displayId}</Text>
        </View>

        <View style={styles.mainRow}>
          <View style={[styles.iconBubble, { backgroundColor: cfg.bg }]}>
            <Feather name="package" size={20} color={cfg.color} />
          </View>

          <View style={styles.info}>
            <Text style={styles.dateText}>
              {dateStr}
              {timeStr ? ` · ${timeStr}` : ""}
            </Text>
            <View style={styles.metaRow}>
              <Feather name="layers" size={11} color={colors.neutral.gray400} />
              <Text style={styles.metaText}>{itemLabel} selected</Text>
            </View>
            {earned > 0 && (
              <View style={styles.earnRow}>
                <Text style={styles.earnLabel}>Earned</Text>
                <Text style={styles.earnValue}>₹{earned}</Text>
              </View>
            )}
          </View>

          <View style={styles.chevronWrap}>
            <Feather
              name="chevron-right"
              size={18}
              color={colors.primary.green600}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Feather name="map-pin" size={11} color={colors.primary.green600} />
            <Text style={styles.footerHint}>Doorstep pickup</Text>
          </View>
          <Text style={styles.detailsLink}>View details</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.neutral.gray100,
    ...shadows.sm,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  accent: {
    width: 5,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    paddingLeft: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800" as const,
  },
  pickupId: {
    fontSize: 11,
    color: colors.neutral.gray400,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, minWidth: 0 },
  dateText: {
    fontSize: 15,
    fontWeight: "800" as const,
    color: colors.neutral.black,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.neutral.gray600,
  },
  earnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  earnLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: colors.neutral.gray400,
  },
  earnValue: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: colors.primary.green700,
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary.green50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary.green100,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral.gray100,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerHint: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: colors.primary.green600,
  },
  detailsLink: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: colors.neutral.gray400,
  },
});
