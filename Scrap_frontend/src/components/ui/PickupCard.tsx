import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Pickup } from "../../types";
import { colors, radii, shadows, spacing, typography } from "../../theme";

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  pending: { color: colors.functional.warning, icon: "clock", label: "Scheduled" },
  accepted: { color: colors.primary.green600, icon: "truck", label: "On the way" },
  completed: { color: colors.primary.green600, icon: "check-circle", label: "Completed" },
  cancelled: { color: colors.functional.error, icon: "x-circle", label: "Cancelled" },
};

interface Props {
  pickup: Pickup;
  onPress: () => void;
}

export function PickupCard({ pickup, onPress }: Props) {
  const cfg = STATUS_CONFIG[pickup.status] ?? STATUS_CONFIG.pending;
  const date = pickup.scheduled_at
    ? new Date(pickup.scheduled_at)
    : new Date(pickup.created_at);
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
  const itemLabel = `${pickup.items.length} categor${pickup.items.length !== 1 ? "ies" : "y"}`;
  const displayId = pickup.displayId ?? pickup.id.slice(0, 8).toUpperCase();

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={[styles.statusPill, { backgroundColor: cfg.color + "18" }]}>
          <Feather name={cfg.icon as any} size={12} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={styles.pickupId}>#{displayId}</Text>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.routeLine}>
          <View style={[styles.routeDot, { backgroundColor: cfg.color }]} />
          <View style={styles.routeDash} />
          <View style={styles.routeSquare} />
        </View>
        <View style={styles.routeInfo}>
          <Text style={styles.routeDate}>{dateStr}{timeStr ? ` · ${timeStr}` : ""}</Text>
          <Text style={styles.routeItems}>{itemLabel} selected</Text>
          {pickup.total_amount != null && (
            <Text style={styles.routeAmount}>Earned ₹{pickup.total_amount}</Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerHint}>Tap for details</Text>
        <Feather name="chevron-right" size={18} color={colors.neutral.gray400} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.md,
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
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  statusText: { ...typography.caption, fontWeight: "700" as const },
  pickupId: {
    ...typography.caption,
    color: colors.neutral.gray400,
    fontFamily: "monospace",
    fontWeight: "600" as const,
  },
  routeRow: { flexDirection: "row", gap: spacing.md },
  routeLine: { alignItems: "center", width: 16, paddingTop: 4 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeDash: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: colors.neutral.gray200,
    marginVertical: 4,
  },
  routeSquare: {
    width: 8,
    height: 8,
    backgroundColor: colors.neutral.gray400,
    borderRadius: 2,
  },
  routeInfo: { flex: 1 },
  routeDate: {
    ...typography.bodySmMedium,
    fontWeight: "700" as const,
    color: colors.neutral.black,
  },
  routeItems: {
    ...typography.caption,
    color: colors.neutral.gray600,
    marginTop: 2,
  },
  routeAmount: {
    ...typography.bodySm,
    fontWeight: "700" as const,
    color: colors.primary.green700,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
  },
  footerHint: { ...typography.caption, color: colors.neutral.gray400 },
});