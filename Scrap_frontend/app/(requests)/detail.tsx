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

import { Button } from "../../src/components/ui/Button";
import { Header } from "../../src/components/shared/Header";
import { pickupService } from "../../src/services/pickup";
import { Pickup } from "../../src/types";
import { colors, radii, spacing, typography } from "../../src/theme";

const STATUS_COLORS: Record<string, string> = {
  pending: colors.functional.warning,
  accepted: colors.primary.green600,
  completed: colors.primary.green600,
  cancelled: colors.functional.error,
};

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
    setLoadError(null);

    pickupService
      .get(id)
      .then((r) => {
        setPickup({
          ...r.data.pickup,
          items: r.data.pickup?.items || [],
        });
      })
      .catch((err: any) => {
        console.log("Pickup fetch error:", err);
        if (
          err?.isNetworkError ||
          err?.code === "ECONNABORTED" ||
          (err?.message && err.message.toLowerCase().includes("timeout"))
        ) {
          setLoadError(
            "Network timeout or connection issue. Please check your internet or try again.",
          );
        } else if (err?.response?.status === 401) {
          setLoadError("Authentication error. Please login again.");
        } else {
          setLoadError(
            err?.response?.data?.message ||
              "Unable to load pickup details. Please try again.",
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, pickup]);

  const handleCancel = () => {
    if (!pickup) return;

    if (pickup.status === "pending") {
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
                    : prev,
                );
              } catch (error: any) {
                Alert.alert(
                  "Error",
                  error?.response?.data?.message ||
                    "Could not cancel pickup. Please try again.",
                );
              } finally {
                setCancelling(false);
              }
            },
          },
        ],
      );
      return;
    }

    Alert.alert(
      "Cannot cancel now",
      "This pickup has already been accepted and cannot be cancelled at this stage.",
    );
  };

  if (!pickup) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="Pickup Detail" />

        <View style={styles.center}>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : loadError ? (
            <View style={styles.errorPanel}>
              <Text style={styles.errorText}>{loadError}</Text>
              <Pressable
                style={styles.retryBtn}
                onPress={() => {
                  setPickup(null);
                  setLoadError(null);
                }}
              >
                <Text style={styles.retryLabel}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.loadingText}>
              Pickup not found. Please go back and try again.
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = STATUS_COLORS[pickup?.status] || colors.neutral.gray400;

  const canCancel = pickup?.status === "pending";

  const STATUS_STEPS = [
    { key: "pending", label: "Pickup Scheduled" },
    { key: "accepted", label: "Confirmed" },
    { key: "completed", label: "Completed" },
  ];

  const statusIndex = STATUS_STEPS.findIndex(
    (step) => step.key === pickup?.status,
  );
  const activeIndex = statusIndex >= 0 ? statusIndex : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Track Pickup" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.trackPanel}>
          <Text style={styles.trackTitle}>Track your pickup</Text>
          <Text style={styles.trackSubtitle}>
            We will keep you updated as your pickup moves from scheduled to
            completed.
          </Text>

          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, index) => {
              const isActive = index <= activeIndex;
              return (
                <View key={step.key} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineBullet,
                      {
                        backgroundColor: isActive
                          ? colors.primary.green600
                          : colors.neutral.gray200,
                      },
                    ]}
                  />
                  {index < STATUS_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor:
                            index < activeIndex
                              ? colors.primary.green600
                              : colors.neutral.gray200,
                        },
                      ]}
                    />
                  )}
                  <Text
                    style={[
                      styles.timelineLabel,
                      isActive && { color: colors.neutral.black },
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

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
              ? pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)
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
            <View key={item?.id || index} style={styles.itemRow}>
              <Feather name="box" size={16} color={colors.neutral.gray400} />

              <Text style={styles.itemText}>
                Item{" "}
                {item?.id
                  ? item.id.length > 6
                    ? item.id.slice(0, 6).toUpperCase()
                    : item.id.toUpperCase()
                  : "N/A"}{" "}
                — {item?.estimated_qty ?? "?"} kg est.
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

            <Text style={styles.amount}>₹{pickup.total_amount}</Text>
          </>
        )}

        {/* NOTES */}
        {pickup?.notes && (
          <>
            <Text style={styles.section}>Notes</Text>

            <Text style={styles.value}>{pickup.notes}</Text>
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

  trackPanel: {
    backgroundColor: colors.primary.green50,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  trackTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
    color: colors.neutral.black,
  },
  trackSubtitle: {
    ...typography.bodySm,
    color: colors.neutral.gray600,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  timeline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  timelineItem: {
    flex: 1,
    alignItems: "center",
  },
  timelineBullet: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineLine: {
    position: "absolute",
    top: 8,
    left: "50%",
    right: -32,
    height: 2,
    zIndex: -1,
  },
  timelineLabel: {
    ...typography.caption,
    color: colors.neutral.gray400,
    marginTop: spacing.xs,
    textAlign: "center",
  },

  errorPanel: {
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.functional.error,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.neutral.black,
  },
  retryLabel: {
    ...typography.bodySmMedium,
    color: colors.neutral.white,
    textTransform: "uppercase",
    letterSpacing: 0.8,
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
