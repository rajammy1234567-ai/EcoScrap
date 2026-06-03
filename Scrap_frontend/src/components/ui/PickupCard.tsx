import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Pickup } from "../../types";
import { colors, radii, shadows, spacing, typography } from "../../theme";

const STATUS_COLORS: Record<string, string> = {
  pending: colors.functional.warning,
  accepted: colors.primary.green600,
  completed: colors.primary.green600,
  cancelled: colors.functional.error,
};

interface Props {
  pickup: Pickup;
  onPress: () => void;
}

export function PickupCard({ pickup, onPress }: Props) {
  const statusColor = STATUS_COLORS[pickup.status] || colors.neutral.gray400;
  const date = pickup.scheduled_at
    ? new Date(pickup.scheduled_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date(pickup.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
  const time = pickup.scheduled_at
    ? new Date(pickup.scheduled_at).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;
  const itemLabel = `${pickup.items.length} item${pickup.items.length !== 1 ? "s" : ""}`;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: statusColor + "20" }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
          </Text>
        </View>
        <Text style={styles.date}>{date}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.items}>{itemLabel}</Text>
        {time ? <Text style={styles.time}>{time}</Text> : null}
      </View>
      {pickup.total_amount != null && (
        <Text style={styles.amount}>₹{pickup.total_amount}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  badgeText: { ...typography.caption, fontWeight: "600" },
  date: { ...typography.caption, color: colors.neutral.gray400 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  items: { ...typography.bodySmMedium, color: colors.neutral.black },
  time: { ...typography.caption, color: colors.neutral.gray400 },
  amount: {
    ...typography.body,
    fontWeight: "700",
    color: colors.neutral.black,
    marginTop: 4,
  },
});
