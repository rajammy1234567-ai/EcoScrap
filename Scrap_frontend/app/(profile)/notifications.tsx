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
import {
  notificationService,
  AppNotification,
} from "../../src/services/notifications";
import { useAuth } from "../../src/context/AuthContext";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { colors, radii, spacing, typography, shadows, layout } from "../../src/theme";

function typeIcon(type: string): keyof typeof Feather.glyphMap {
  switch (type) {
    case "scrapper_approved":
      return "check-circle";
    case "scrapper_rejected":
      return "x-circle";
    case "scrapper_pending":
      return "clock";
    case "pickup_assigned":
      return "truck";
    case "pickup_update":
      return "package";
    default:
      return "bell";
  }
}

function typeColor(type: string) {
  switch (type) {
    case "scrapper_approved":
      return colors.primary.green600;
    case "scrapper_rejected":
      return colors.functional.error;
    case "scrapper_pending":
      return colors.functional.warning;
    case "pickup_assigned":
      return colors.functional.info;
    default:
      return colors.neutral.gray600;
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const res = await notificationService.list({ limit: 50 });
      setItems(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const onPressItem = async (n: AppNotification) => {
    const id = n.id || n._id;
    if (id && !n.isRead) {
      try {
        await notificationService.markRead(id);
        setItems((prev) =>
          prev.map((x) =>
            (x.id || x._id) === id ? { ...x, isRead: true } : x,
          ),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        /* ignore */
      }
    }

    if (
      n.type === "scrapper_approved" ||
      n.type === "pickup_nearby" ||
      n.type === "pickup_assigned"
    ) {
      router.push("/(profile)/scrapper-jobs");
    } else if (
      n.type === "scrapper_rejected" ||
      n.type === "scrapper_pending"
    ) {
      router.push("/(profile)/become-scrapper");
    }
  };

  const markAll = async () => {
    try {
      await notificationService.markAllRead();
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Feather name="arrow-left" size={22} color={colors.neutral.black} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <Pressable onPress={markAll} hitSlop={8}>
            <Text style={styles.markAll}>Read all</Text>
          </Pressable>
        ) : (
          <View style={{ width: 56 }} />
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
        contentContainerStyle={
          items.length === 0 ? styles.emptyList : styles.list
        }
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
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="No notifications"
              subtitle="Accept/reject decisions and pickup updates will show here with reasons."
              icon="bell"
            />
          ) : (
            <Text style={styles.loadingText}>Loading...</Text>
          )
        }
        renderItem={({ item }) => {
          const color = typeColor(item.type);
          return (
            <Pressable
              style={[styles.card, !item.isRead && styles.cardUnread]}
              onPress={() => onPressItem(item)}
            >
              <View style={[styles.iconBox, { backgroundColor: color + "18" }]}>
                <Feather name={typeIcon(item.type)} size={18} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                {!!item.reason && (
                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel}>Reason</Text>
                    <Text style={styles.reasonText}>{item.reason}</Text>
                  </View>
                )}
                <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
              </View>
              {!item.isRead && <View style={styles.dot} />}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
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
  markAll: {
    ...typography.caption,
    color: colors.primary.green600,
    fontWeight: "600",
    width: 56,
    textAlign: "right",
  },
  list: { padding: spacing.lg, paddingBottom: 40 },
  emptyList: { flexGrow: 1 },
  card: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardUnread: {
    borderWidth: 1.5,
    borderColor: colors.primary.green100,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.bodySmMedium,
    fontWeight: "700",
    color: colors.neutral.black,
    marginBottom: 2,
  },
  body: { ...typography.bodySm, color: colors.neutral.gray600 },
  reasonBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.neutral.gray100,
  },
  reasonLabel: {
    ...typography.caption,
    color: colors.neutral.gray400,
    marginBottom: 2,
  },
  reasonText: { ...typography.bodySm, color: colors.neutral.gray800 },
  time: {
    ...typography.caption,
    color: colors.neutral.gray400,
    marginTop: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.green600,
    marginTop: 6,
  },
  loadingText: {
    textAlign: "center",
    marginTop: spacing["3xl"],
    color: colors.neutral.gray400,
  },
});
