import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PickupCard } from "../../src/components/ui/PickupCard";
import { pickupService } from "../../src/services/pickup";
import { useAuth } from "../../src/context/AuthContext";
import { Pickup } from "../../src/types";
import { SegmentedControl } from "../../src/components/layout/SegmentedControl";
import { Button } from "../../src/components/ui/Button";
import { AppImages } from "../../src/assets/images";
import { useTabBarInset } from "../../src/hooks/useTabBarInset";
import { colors, spacing, typography, radii, shadows, layout } from "../../src/theme";

type Tab = "pending" | "completed" | "cancelled";

const TABS: { key: Tab; label: string }[] = [
  { key: "pending", label: "Scheduled" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const EMPTY_MESSAGES: Record<Tab, { title: string; sub: string; icon: string }> = {
  pending: {
    title: "No scheduled pickups",
    sub: "Book a free doorstep pickup and turn your scrap into cash today.",
    icon: "calendar",
  },
  completed: {
    title: "No completed pickups yet",
    sub: "Your pickup history and earnings will show up here.",
    icon: "check-circle",
  },
  cancelled: {
    title: "No cancelled pickups",
    sub: "All your bookings are on track. Great!",
    icon: "slash",
  },
};

export default function RequestsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ pickupId?: string; pickupJson?: string }>();
  const { pickupId, pickupJson } = params;
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [counts, setCounts] = useState({ pending: 0, completed: 0, cancelled: 0 });
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (tab: Tab) => {
      if (!isAuthenticated) {
        setPickups([]);
        setCounts({ pending: 0, completed: 0, cancelled: 0 });
        return;
      }
      try {
        const [pendingRes, completedRes, cancelledRes] = await Promise.all([
          pickupService.list({ status: "pending" }),
          pickupService.list({ status: "completed" }),
          pickupService.list({ status: "cancelled" }),
        ]);
        const statusMap: Record<Tab, Pickup[]> = {
          pending: pendingRes.data.pickups ?? [],
          completed: completedRes.data.pickups ?? [],
          cancelled: cancelledRes.data.pickups ?? [],
        };
        setCounts({
          pending: statusMap.pending.length,
          completed: statusMap.completed.length,
          cancelled: statusMap.cancelled.length,
        });
        setTotalEarnings(
          statusMap.completed.reduce((sum, p) => sum + (p.total_amount ?? 0), 0),
        );
        setPickups(statusMap[tab]);
      } catch {
        setPickups([]);
      } finally {
        setRefreshing(false);
      }
    },
    [isAuthenticated],
  );

  useEffect(() => { load(activeTab); }, [activeTab, load]);

  useEffect(() => {
    if (!pickupId) return;
    const t = setTimeout(() => {
      router.push({
        pathname: "/(requests)/detail",
        params: { id: pickupId, pickupJson },
      });
    }, 50);
    return () => clearTimeout(t);
  }, [pickupId, pickupJson, router]);

  const empty = EMPTY_MESSAGES[activeTab];
  const bottomInset = useTabBarInset();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <LinearGradient
        colors={[...layout.headerGradient]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>My Pickups</Text>
        <Text style={styles.headerSub}>Track, manage & earn from your scrap</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{counts.pending}</Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{counts.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{totalEarnings > 0 ? `₹${totalEarnings}` : "—"}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <SegmentedControl
          tabs={TABS.map((t) => ({
            key: t.key,
            label: t.label,
            count: counts[t.key],
          }))}
          active={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            load(tab);
          }}
        />

        <Pressable
          style={styles.scheduleBtn}
          onPress={() => router.push("/(home)/select-items")}
        >
          <View style={styles.scheduleLeft}>
            <Feather name="plus-circle" size={22} color={colors.neutral.white} />
            <View>
              <Text style={styles.scheduleTitle}>Schedule new pickup</Text>
              <Text style={styles.scheduleSub}>Free doorstep · Instant cash</Text>
            </View>
          </View>
          <Feather name="arrow-right" size={20} color={colors.neutral.white} />
        </Pressable>

        {pickups.length > 0 && (
          <Text style={styles.listMeta}>
            {pickups.length} pickup{pickups.length !== 1 ? "s" : ""}
          </Text>
        )}

        <FlatList
          data={pickups}
          keyExtractor={(p) => p.id}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomInset },
            pickups.length === 0 && styles.emptyList,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(activeTab); }}
              colors={[colors.primary.green600]}
            />
          }
          renderItem={({ item }) => (
            <PickupCard
              pickup={item}
              onPress={() =>
                router.push({
                  pathname: "/(requests)/detail",
                  params: { id: item.id, pickupJson: JSON.stringify(item) },
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyImageWrap}>
                <Image
                  source={AppImages.emptyPickup}
                  style={styles.emptyImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.emptyTitle}>{empty.title}</Text>
              <Text style={styles.emptySub}>{empty.sub}</Text>
              {!isAuthenticated ? (
                <Button
                  label="Login to continue"
                  onPress={() => router.push("/(auth)/enter-mobile")}
                  variant="primaryGreen"
                  style={styles.emptyCta}
                />
              ) : activeTab === "pending" ? (
                <Button
                  label="Schedule Pickup"
                  onPress={() => router.push("/(home)/select-items")}
                  variant="primaryGreen"
                  style={styles.emptyCta}
                />
              ) : null}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: layout.screenBg },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: colors.neutral.white,
  },
  headerSub: {
    ...typography.caption,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: radii.xl,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  statBox: { flex: 1, alignItems: "center" },
  statNum: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: colors.neutral.white,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    fontWeight: "600" as const,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 4,
  },
  body: {
    flex: 1,
    marginTop: -spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.neutral.black,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  scheduleLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  scheduleTitle: {
    ...typography.bodySmMedium,
    fontWeight: "700" as const,
    color: colors.neutral.white,
  },
  scheduleSub: { ...typography.caption, color: "rgba(255,255,255,0.6)" },
  listMeta: {
    ...typography.caption,
    color: colors.neutral.gray600,
    fontWeight: "600" as const,
    marginTop: spacing.xs,
  },
  list: { flex: 1 },
  listContent: { gap: spacing.sm },
  emptyList: { flexGrow: 1 },
  emptyState: {
    alignItems: "center",
    paddingTop: spacing["3xl"],
    paddingHorizontal: spacing.xl,
  },
  emptyImageWrap: {
    width: "100%",
    height: 180,
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  emptyImage: { width: "100%", height: "100%" },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.neutral.black,
    textAlign: "center",
  },
  emptySub: {
    ...typography.bodySm,
    color: colors.neutral.gray600,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  emptyCta: { marginTop: spacing.xl, alignSelf: "stretch" },
});