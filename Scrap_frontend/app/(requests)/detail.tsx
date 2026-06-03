import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { Button } from "../../src/components/ui/Button";
import { Header } from "../../src/components/shared/Header";
import { pickupService } from "../../src/services/pickup";
import { Pickup } from "../../src/types";
import { colors, radii, spacing, typography } from "../../src/theme";

const STATUS_COLORS: Record<string, string> = {
  pending: colors.functional.warning,
  confirmed: colors.primary.green600,
  assigned: colors.functional.info,
  in_progress: colors.functional.info,
  completed: colors.primary.green600,
  cancelled: colors.functional.error,
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function RequestDetailScreen() {
  const { id, pickupJson } = useLocalSearchParams<{
    id: string;
    pickupJson: string;
  }>();

  const router = useRouter();

  const [pickup, setPickup] = useState<Pickup | null>(() =>
    pickupJson ? JSON.parse(pickupJson) : null
  );

  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!pickup && id && UUID_RE.test(id)) {
      pickupService
        .get(id)
        .then((r) => {
          setPickup({
            ...r.data.pickup,
            items: r.data.pickup?.items || [],
          });
        })
        .catch((err) => {
          console.log("Pickup fetch error:", err);
        });
    }
  }, [id]);

  const handleCancel = () => {
    Alert.alert(
      "Cancel Pickup",
      "Are you sure you want to cancel this pickup?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              setCancelling(true);

              await pickupService.cancel(id);

              setPickup((prev) =>
                prev
                  ? {
                      ...prev,
                      status: "cancelled",
                    }
                  : prev
              );
            } catch (error) {
              Alert.alert("Error", "Could not cancel pickup.");
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (!pickup) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="Pickup Detail" />

        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor =
    STATUS_COLORS[pickup?.status] || colors.neutral.gray400;

  const canCancel = ["pending", "confirmed"].includes(
    pickup?.status || ""
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Pickup Detail" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* STATUS */}
        <View
          style={[
            styles.badge,
            {
              backgroundColor: statusColor + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: statusColor,
              },
            ]}
          >
            {pickup?.status
              ? pickup.status.charAt(0).toUpperCase() +
                pickup.status.slice(1)
              : "Unknown"}
          </Text>
        </View>

        {/* PICKUP ID */}
        <Text style={styles.section}>Pickup ID</Text>

        <Text style={styles.value}>
          {pickup?.id
            ? pickup.id.length > 8
              ? pickup.id.slice(0, 8).toUpperCase()
              : pickup.id.toUpperCase()
            : "N/A"}
        </Text>

        {/* DATE */}
        {pickup?.scheduled_at && (
          <>
            <Text style={styles.section}>Scheduled</Text>

            <Text style={styles.value}>
              {new Date(pickup.scheduled_at).toLocaleString("en-IN")}
            </Text>
          </>
        )}

        {/* ITEMS */}
        <Text style={styles.section}>Items</Text>

        {pickup?.items?.length > 0 ? (
          pickup.items.map((item: any, index: number) => (
            <View
              key={item?.id || index}
              style={styles.itemRow}
            >
              <Feather
                name="box"
                size={16}
                color={colors.neutral.gray400}
              />

              <Text style={styles.itemText}>
                Item{" "}
                {item?.id
                  ? item.id.length > 6
                    ? item.id.slice(0, 6).toUpperCase()
                    : item.id.toUpperCase()
                  : "N/A"}
                {" "}— {item?.estimated_qty ?? "?"} kg est.
                {item?.actual_qty != null
                  ? ` / ${item.actual_qty} kg actual`
                  : ""}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.value}>No items found</Text>
        )}

        {/* TOTAL AMOUNT */}
        {pickup?.total_amount != null && (
          <>
            <Text style={styles.section}>Total Amount</Text>

            <Text style={styles.amount}>
              ₹{pickup.total_amount}
            </Text>
          </>
        )}

        {/* NOTES */}
        {pickup?.notes && (
          <>
            <Text style={styles.section}>Notes</Text>

            <Text style={styles.value}>
              {pickup.notes}
            </Text>
          </>
        )}
      </ScrollView>

      {/* CANCEL BUTTON */}
      {canCancel && (
        <View style={styles.cta}>
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },

  content: {
    padding: spacing.xl,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    ...typography.body,
    color: colors.neutral.gray400,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.pill,
    marginBottom: spacing["2xl"],
  },

  badgeText: {
    ...typography.bodySmMedium,
  },

  section: {
    ...typography.caption,
    color: colors.neutral.gray400,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  value: {
    ...typography.body,
    color: colors.neutral.black,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },

  itemText: {
    ...typography.bodySm,
    color: colors.neutral.black,
  },

  amount: {
    ...typography.h2,
    color: colors.neutral.black,
    fontWeight: "700",
  },

  cta: {
    padding: spacing.xl,
  },
});