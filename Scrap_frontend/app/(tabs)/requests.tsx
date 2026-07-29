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
import { Pickup, pickupEarnedAmount } from "../../src/types";
import { Button } from "../../src/components/ui/Button";
import { AppImages } from "../../src/assets/images";
import { useTabBarInset } from "../../src/hooks/useTabBarInset";
import {
  colors,
  spacing,
  typography,
  radii,
  shadows,
  layout,
} from "../../src/theme";

type Tab = "pending" | "completed" | "cancelled";

const TABS: {
  key: Tab;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { key: "pending", label: "Scheduled", icon: "calendar" },
  { key: "completed", label: "Completed", icon: "check-circle" },
  { key: "cancelled", label: "Cancelled", icon: "x-circle" },
];

const EMPTY_MESSAGES: Record<
  Tab,
  { title: string; sub: string; icon: keyof typeof Feather.glyphMap }
> = {
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
  const params = useLocalSearchParams<{
    pickupId?: string;
    pickupJson?: string;
  }>();
  const { pickupId, pickupJson } = params;
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [counts, setCounts] = useState({
    pending: 0,
    completed: 0,
    cancelled: 0,
  });
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (tab: Tab) => {
      if (!isAuthenticated) {
        setPickups([]);
        setCounts({ pending: 0, completed: 0, cancelled: 0 });
        setTotalEarnings(0);
        return;
      }
      try {
        const [pendingRes, acceptedRes, completedRes, cancelledRes] =
          await Promise.all([
            pickupService.list({ status: "pending" }),
            pickupService.list({ status: "accepted" }).catch(() => ({
              data: { pickups: [] as Pickup[] },
            })),
            pickupService.list({ status: "completed" }),
            pickupService.list({ status: "cancelled" }),
          ]);
        const statusMap: Record<Tab, Pickup[]> = {
          pending: [
            ...(pendingRes.data.pickups ?? []),
            ...(acceptedRes.data.pickups ?? []),
          ],
          completed: completedRes.data.pickups ?? [],
          cancelled: cancelledRes.data.pickups ?? [],
        };

        setCounts({
          pending: statusMap.pending.length,
          completed: statusMap.completed.length,
          cancelled: statusMap.cancelled.length,
        });
        // Cash earned = sum of scrapper-recorded paymentAmount on completed pickups
        const fromApi = (completedRes.data as any)?.earnings?.totalEarned;
        if (typeof fromApi === "number" && fromApi >= 0) {
          setTotalEarnings(fromApi);
        } else {
          setTotalEarnings(
            statusMap.completed.reduce(
              (sum, p) => sum + pickupEarnedAmount(p),
              0,
            ),
          );
        }
        setPickups(statusMap[tab]);
      } catch {
        setPickups([]);
      } finally {
        setRefreshing(false);
      }
    },
    [isAuthenticated],
  );

  useEffect(() => {
    load(activeTab);
  }, [activeTab, load]);

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
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerEyebrow}>YOUR ACTIVITY</Text>
            <Text style={styles.headerTitle}>My Pickups</Text>
            <Text style={styles.headerSub}>
              Track, manage & earn from your scrap
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Feather name="package" size={22} color={colors.neutral.white} />
          </View>
        </View>

        {/* Stats cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Feather name="calendar" size={14} color={colors.neutral.white} />
            </View>
            <Text style={styles.statNum}>{counts.pending}</Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Feather
                name="check-circle"
                size={14}
                color={colors.neutral.white}
              />
            </View>
            <Text style={styles.statNum}>{counts.completed}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={[styles.statCard, styles.statCardEarn]}>
            <View style={styles.statIconWrap}>
              <Feather
                name="dollar-sign"
                size={14}
                color={colors.neutral.white}
              />
            </View>
            <Text style={styles.statNum} numberOfLines={1}>
              {totalEarnings > 0 ? `₹${totalEarnings}` : "—"}
            </Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Tab chips */}
        <View style={styles.tabsCard}>
          {TABS.map((t) => {
            const active = activeTab === t.key;
            return (
              <Pressable
                key={t.key}
                style={[styles.tabChip, active && styles.tabChipActive]}
                onPress={() => {
                  setActiveTab(t.key);
                  load(t.key);
                }}
              >
                <Feather
                  name={t.icon}
                  size={13}
                  color={
                    active ? colors.neutral.white : colors.primary.green600
                  }
                />
                <Text
                  style={[styles.tabLabel, active && styles.tabLabelActive]}
                >
                  {t.label}
                </Text>
                {counts[t.key] > 0 && (
                  <View
                    style={[
                      styles.tabCount,
                      active && styles.tabCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabCountText,
                        active && styles.tabCountTextActive,
                      ]}
                    >
                      {counts[t.key]}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Schedule CTA */}
        <Pressable
          style={styles.scheduleBtn}
          onPress={() => router.push("/(home)/select-items")}
        >
          <LinearGradient
            colors={[colors.primary.green700, colors.primary.green500]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scheduleGrad}
          >
            <View style={styles.scheduleIcon}>
              <Feather name="plus" size={20} color={colors.primary.green700} />
            </View>
            <View style={styles.scheduleTextCol}>
              <Text style={styles.scheduleTitle}>Schedule new pickup</Text>
              <Text style={styles.scheduleSub}>
                Free doorstep · Instant cash
              </Text>
            </View>
            <View style={styles.scheduleArrow}>
              <Feather
                name="arrow-right"
                size={18}
                color={colors.neutral.white}
              />
            </View>
          </LinearGradient>
        </Pressable>

        {activeTab === "completed" && totalEarnings > 0 && (
          <View style={styles.earnBanner}>
            <View style={styles.earnBannerIcon}>
              <Feather
                name="trending-up"
                size={18}
                color={colors.primary.green700}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.earnBannerLabel}>Total scrap earnings</Text>
              <Text style={styles.earnBannerValue}>
                ₹{totalEarnings.toLocaleString("en-IN")}
              </Text>
              <Text style={styles.earnBannerSub}>
                Cash received on completed pickups
              </Text>
            </View>
          </View>
        )}

        {pickups.length > 0 && (
          <View style={styles.listMetaRow}>
            <Text style={styles.listMeta}>
              {pickups.length} pickup{pickups.length !== 1 ? "s" : ""}
              {activeTab === "completed" && totalEarnings > 0
                ? ` · ₹${totalEarnings.toLocaleString("en-IN")} earned`
                : ""}
            </Text>
            <Text style={styles.listMetaHint}>Pull to refresh</Text>
          </View>
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
              onRefresh={() => {
                setRefreshing(true);
                load(activeTab);
              }}
              colors={[colors.primary.green600]}
            />
          }
          renderItem={({ item }) => (
            <PickupCard
              pickup={item}
              onPress={() =>
                router.push({
                  pathname: "/(requests)/detail",
                  params: {
                    id: item.id,
                    pickupJson: JSON.stringify(item),
                  },
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBubble}>
                  <Feather
                    name={empty.icon}
                    size={28}
                    color={colors.primary.green600}
                  />
                </View>
                {AppImages.emptyPickup ? (
                  <View style={styles.emptyImageWrap}>
                    <Image
                      source={AppImages.emptyPickup}
                      style={styles.emptyImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : null}
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
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: layout.screenBg },

  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing["3xl"],
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: "800" as const,
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: colors.neutral.white,
    letterSpacing: -0.5,
  },
  headerSub: {
    ...typography.caption,
    color: "rgba(255,255,255,0.78)",
    marginTop: 4,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  earnBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primary.green50,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary.green100,
  },
  earnBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.neutral.white,
    alignItems: "center",
    justifyContent: "center",
  },
  earnBannerLabel: {
    ...typography.caption,
    color: colors.primary.green700,
    fontWeight: "600" as const,
  },
  earnBannerValue: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: colors.primary.green700,
    marginTop: 2,
  },
  earnBannerSub: {
    ...typography.caption,
    color: colors.neutral.gray600,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  statCardEarn: {
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statNum: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: colors.neutral.white,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.72)",
    marginTop: 2,
    fontWeight: "600" as const,
  },

  body: {
    flex: 1,
    marginTop: -spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },

  tabsCard: {
    flexDirection: "row",
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: 5,
    gap: 4,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
  },
  tabChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: radii.lg,
  },
  tabChipActive: {
    backgroundColor: colors.primary.green700,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: colors.neutral.gray600,
  },
  tabLabelActive: {
    color: colors.neutral.white,
  },
  tabCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary.green50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabCountActive: {
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: "800" as const,
    color: colors.primary.green700,
  },
  tabCountTextActive: {
    color: colors.neutral.white,
  },

  scheduleBtn: {
    borderRadius: radii.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  scheduleGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    minHeight: 68,
  },
  scheduleIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.neutral.white,
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleTextCol: { flex: 1 },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: "800" as const,
    color: colors.neutral.white,
  },
  scheduleSub: {
    ...typography.caption,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  scheduleArrow: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  listMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  listMeta: {
    ...typography.caption,
    color: colors.neutral.gray600,
    fontWeight: "700" as const,
  },
  listMetaHint: {
    fontSize: 11,
    color: colors.neutral.gray400,
    fontWeight: "500" as const,
  },
  list: { flex: 1 },
  listContent: { gap: spacing.md },
  emptyList: { flexGrow: 1 },

  emptyState: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  emptyCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl + 4,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.neutral.gray100,
    ...shadows.sm,
  },
  emptyIconBubble: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary.green50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary.green100,
  },
  emptyImageWrap: {
    width: "100%",
    height: 140,
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  emptyImage: { width: "100%", height: "100%" },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800" as const,
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
