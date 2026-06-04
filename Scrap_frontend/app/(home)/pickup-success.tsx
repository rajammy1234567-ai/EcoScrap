import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../../src/components/ui/Button";
import { colors, radii, spacing, typography } from "../../src/theme";
import { Pickup } from "../../src/types";

export default function PickupSuccessScreen() {
  const { pickupId, pickupJson, scheduledAt } = useLocalSearchParams<{
    pickupId: string;
    pickupJson?: string;
    scheduledAt?: string;
  }>();
  const router = useRouter();

  const pickup: Pickup | null = pickupJson ? JSON.parse(pickupJson) : null;
  const displayId = pickup?.displayId || (pickupId
    ? pickupId.length > 8
      ? pickupId.slice(0, 8).toUpperCase()
      : pickupId.toUpperCase()
    : null);
  const scheduledAtValue = pickup?.scheduled_at ?? scheduledAt;
  const scheduledLabel = scheduledAtValue
    ? new Date(scheduledAtValue).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#E8F5E9", "#FFFFFF"]}
        style={styles.heroGradient}
      >
        <View style={styles.iconCircle}>
          <Feather name="check" size={48} color={colors.neutral.white} />
        </View>
        <Text style={styles.title}>Pickup Scheduled!</Text>
        <Text style={styles.subtitle}>
          Your scrap pickup request has been confirmed.{"\n"}Our partner will
          contact you shortly.
        </Text>
        {displayId && (
          <View style={styles.idBadge}>
            <Text style={styles.idLabel}>Pickup ID</Text>
            <Text style={styles.idValue}>{displayId}</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Feather name="clock" size={22} color={colors.primary.green600} />
          <Text style={styles.infoText}>
            {scheduledLabel
              ? `Scheduled for${"\n"}${scheduledLabel}`
              : "Pickup within" + "\n24 hours"}
          </Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Feather name="phone" size={22} color={colors.primary.green600} />
          <Text style={styles.infoText}>Partner will{"\n"}call you first</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Feather
            name="dollar-sign"
            size={22}
            color={colors.primary.green600}
          />
          <Text style={styles.infoText}>Instant cash{"\n"}payment</Text>
        </View>
      </View>

      <View style={styles.cta}>
        <Button
          label="Track My Pickup"
          onPress={() =>
            pickupId
              ? router.replace({
                  pathname: "/(tabs)/requests",
                  params: {
                    pickupId,
                  },
                })
              : router.replace("/(tabs)/requests")
          }
          variant="primaryGreen"
        />
        <Button
          label="Back to My Pickups"
          onPress={() => router.replace("/(tabs)/requests")}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  heroGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary.green600,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing["2xl"],
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: colors.neutral.black,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral.gray600,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  idBadge: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.primary.green100,
  },
  idLabel: {
    ...typography.caption,
    color: colors.neutral.gray400,
    marginBottom: 4,
  },
  idValue: {
    ...typography.h3,
    color: colors.primary.green700,
    letterSpacing: 2,
    fontFamily: "monospace",
  },
  infoRow: {
    flexDirection: "row",
    marginHorizontal: spacing.xl,
    backgroundColor: colors.primary.green50,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoItem: { flex: 1, alignItems: "center", gap: spacing.sm },
  infoDivider: { width: 1, backgroundColor: colors.primary.green100 },
  infoText: {
    ...typography.caption,
    color: colors.neutral.gray600,
    textAlign: "center",
    lineHeight: 16,
  },
  cta: { padding: spacing.xl, gap: spacing.md },
});
