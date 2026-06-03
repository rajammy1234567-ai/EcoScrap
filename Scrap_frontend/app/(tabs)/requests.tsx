import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { PickupCard } from "../../src/components/ui/PickupCard";
import { pickupService } from "../../src/services/pickup";
import { useAuth } from "../../src/context/AuthContext";
import { Pickup } from "../../src/types";
import { colors, spacing, typography, radii } from "../../src/theme";

const TRUCK_IMG = require("../../assets/images/brands/Gemini_Generated_Image_czpogxczpogxczpo.png");

type Tab = "pending" | "completed" | "cancelled";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "pending", label: "Scheduled", icon: "truck" },
  { key: "completed", label: "Completed", icon: "check-square" },
  { key: "cancelled", label: "Cancelled", icon: "trash-2" },
];

const EMPTY_MESSAGES: Record<Tab, { title: string; sub: string }> = {
  pending: {
    title: "No scheduled pickups",
    sub: "Your recyclables deserve a second life!",
  },
  completed: {
    title: "No completed pickups",
    sub: "Schedule one and earn cash!",
  },
  cancelled: {
    title: "No cancelled pickups",
    sub: "Great job keeping them active!",
  },
};

export default function RequestsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    pickupId?: string;
    pickupJson?: string;
  }>();
  const pickupId = params.pickupId;
  const pickupJson = params.pickupJson;
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (tab: Tab) => {
      if (!isAuthenticated) {
        setPickups([]);
        return;
      }
      try {
        const statusMap: Record<Tab, string> = {
          pending: "pending",
          completed: "completed",
          cancelled: "cancelled",
        };
        const res = await pickupService.list({ status: statusMap[tab] });
        setPickups(res.data.pickups ?? []);
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

    // Defer navigation slightly to avoid navigating before the root layout mounts.
    const t = setTimeout(() => {
      router.push({
        pathname: "/(requests)/detail",
        params: {
          id: pickupId,
          pickupJson,
        },
      });
    }, 50);

    return () => clearTimeout(t);
  }, [pickupId, pickupJson, router]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    load(tab);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    load(activeTab);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <Text style={styles.header}>PICKUPS</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            style={styles.tab}
            onPress={() => handleTabChange(t.key)}
          >
            <Feather
              name={t.icon as any}
              size={28}
              color={
                activeTab === t.key
                  ? colors.primary.green600
                  : colors.neutral.gray400
              }
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === t.key && styles.tabLabelActive,
              ]}
            >
              {t.label}
            </Text>
            {activeTab === t.key && <View style={styles.tabUnderline} />}
          </Pressable>
        ))}
      </View>

      {/* Schedule Pickup CTA */}
      <View style={styles.ctaRow}>
        <View style={styles.ctaGlowRing}>
          <Pressable
            style={styles.ctaBtn}
            onPress={() => router.push("/(home)/select-items")}
          >
            <Text style={styles.ctaBtnText}>Schedule Pickup</Text>
            <Text style={styles.ctaBtnPlus}> +</Text>
          </Pressable>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={pickups}
        keyExtractor={(p) => p.id}
        contentContainerStyle={[
          styles.list,
          pickups.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
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
            <Image
              source={TRUCK_IMG}
              style={styles.emptyImg}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>
              {EMPTY_MESSAGES[activeTab].title}
            </Text>
            <Text style={styles.emptySub}>{EMPTY_MESSAGES[activeTab].sub}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  header: {
    fontSize: 18,
    fontWeight: "700" as const,
    letterSpacing: 2,
    color: colors.neutral.black,
    textAlign: "center",
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    position: "relative",
  },
  tabLabel: {
    ...typography.caption,
    color: colors.neutral.gray400,
    marginTop: 4,
    textTransform: "capitalize",
  },
  tabLabelActive: {
    color: colors.primary.green600,
    fontWeight: "600" as const,
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: colors.primary.green600,
    borderRadius: 1,
  },
  ctaRow: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  ctaGlowRing: {
    width: "100%",
    borderRadius: 50,
    padding: 3,
    backgroundColor: colors.primary.green100,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral.black,
    borderRadius: 50,
    height: 52,
  },
  ctaBtnText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: colors.neutral.white,
  },
  ctaBtnPlus: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.neutral.white,
  },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 96 },
  emptyList: { flex: 1 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing["4xl"],
  },
  emptyImg: { width: 280, height: 220, marginBottom: spacing["2xl"] },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.neutral.black,
    textAlign: "center",
  },
  emptySub: {
    ...typography.body,
    color: colors.neutral.gray400,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
