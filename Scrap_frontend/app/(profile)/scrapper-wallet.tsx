import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { scrapperService, WalletInfo } from "../../src/services/scrapper";
import { useAuth } from "../../src/context/AuthContext";
import { EmptyState } from "../../src/components/ui/EmptyState";
import {
  colors,
  radii,
  spacing,
  typography,
  shadows,
  layout,
} from "../../src/theme";

interface Tx {
  id: string;
  _id?: string;
  type: "credit" | "debit";
  category: string;
  amount: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  signup_bonus: "Signup bonus",
  admin_topup: "Admin top-up",
  admin_adjustment: "Adjustment",
  customer_payout: "Paid to customer",
  payout_refund: "Payout refund",
  other: "Other",
};

export default function ScrapperWalletScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isScrapper =
    user?.role === "scrapper" || user?.scrapperStatus === "approved";

  const load = useCallback(async () => {
    if (!isAuthenticated || !isScrapper) {
      setLoading(false);
      return;
    }
    try {
      const res = await scrapperService.getWallet({ limit: 50 });
      setWallet(res.data.wallet);
      setTxs(res.data.transactions || []);
    } catch {
      setWallet(null);
      setTxs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, isScrapper]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  if (!isScrapper) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={() => router.back()} />
        <EmptyState
          title="Wallet locked"
          subtitle="Approve as scrapper first to receive ₹5000 float."
          ctaLabel="Become a Scrapper"
          onCta={() => router.push("/(profile)/become-scrapper")}
          icon="lock"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header onBack={() => router.back()} />

      <FlatList
        data={txs}
        keyExtractor={(item) => item.id || item._id || String(Math.random())}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primary.green600}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <LinearGradient
              colors={["#1B5E20", "#2E7D32"]}
              style={styles.balanceCard}
            >
              <Text style={styles.balanceLabel}>Available float</Text>
              <Text style={styles.balanceValue}>
                ₹{wallet?.balance?.toFixed?.(0) ?? wallet?.balance ?? "—"}
              </Text>
              <View style={styles.statsRow}>
                <View>
                  <Text style={styles.statLabel}>Credited</Text>
                  <Text style={styles.statValue}>
                    ₹{wallet?.totalCredited ?? 0}
                  </Text>
                </View>
                <View>
                  <Text style={styles.statLabel}>Spent on pickups</Text>
                  <Text style={styles.statValue}>
                    ₹{wallet?.totalDebited ?? 0}
                  </Text>
                </View>
              </View>
              <Text style={styles.balanceHint}>
                Pay scrap sellers from this balance. Admin tracks every rupee.
              </Text>
            </LinearGradient>
            <Text style={styles.sectionTitle}>Transaction history</Text>
          </View>
        }
        contentContainerStyle={
          txs.length === 0 && !loading ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="No transactions"
              subtitle="Signup bonus and customer payments will appear here."
              icon="credit-card"
            />
          ) : null
        }
        renderItem={({ item }) => {
          const credit = item.type === "credit";
          return (
            <View style={styles.txCard}>
              <View
                style={[
                  styles.txIcon,
                  {
                    backgroundColor: credit
                      ? colors.primary.green50
                      : colors.functional.warningBg,
                  },
                ]}
              >
                <Feather
                  name={credit ? "arrow-down-left" : "arrow-up-right"}
                  size={18}
                  color={
                    credit
                      ? colors.primary.green600
                      : colors.functional.warning
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txTitle}>
                  {CATEGORY_LABEL[item.category] || item.category}
                </Text>
                <Text style={styles.txSub} numberOfLines={2}>
                  {item.description || "—"}
                </Text>
                <Text style={styles.txTime}>
                  {new Date(item.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={[
                    styles.txAmount,
                    { color: credit ? colors.primary.green600 : "#E65100" },
                  ]}
                >
                  {credit ? "+" : "−"}₹{item.amount}
                </Text>
                <Text style={styles.txBal}>Bal ₹{item.balanceAfter}</Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
        <Feather name="arrow-left" size={22} color={colors.neutral.black} />
      </Pressable>
      <Text style={styles.headerTitle}>Scrapper Wallet</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: layout.screenBg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    ...typography.h3,
    color: colors.neutral.black,
    textAlign: "center",
  },
  headerBlock: { padding: spacing.lg, paddingBottom: 0 },
  balanceCard: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  balanceLabel: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  balanceValue: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "800",
    marginVertical: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  statLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  statValue: { color: "#fff", fontWeight: "700", fontSize: 16, marginTop: 2 },
  balanceHint: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.neutral.black,
    marginBottom: spacing.md,
  },
  list: { paddingBottom: 40 },
  emptyList: { flexGrow: 1 },
  txCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: colors.neutral.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  txTitle: {
    ...typography.bodySmMedium,
    fontWeight: "700",
    color: colors.neutral.black,
  },
  txSub: { ...typography.caption, color: colors.neutral.gray600, marginTop: 2 },
  txTime: { ...typography.caption, color: colors.neutral.gray400, marginTop: 4 },
  txAmount: { fontWeight: "800", fontSize: 16 },
  txBal: { ...typography.caption, color: colors.neutral.gray400, marginTop: 2 },
});
