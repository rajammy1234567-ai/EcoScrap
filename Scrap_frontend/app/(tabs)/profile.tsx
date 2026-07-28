import { useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/context/AuthContext";
import { useTabBarInset } from "../../src/hooks/useTabBarInset";
import { api } from "../../src/services/api";
import { colors, radii, spacing, typography, layout, shadows } from "../../src/theme";

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowIconBox}>
        <Feather name={icon as any} size={18} color={colors.neutral.gray600} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Feather name="chevron-right" size={16} color={colors.neutral.gray400} />
    </Pressable>
  );
}

function MenuCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser, isAuthenticated } = useAuth();

  // Keep role / scrapperStatus fresh after admin approval
  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) return;
      api
        .get("/api/auth/me")
        .then((res) => {
          if (res.data?.user) setUser(res.data.user);
        })
        .catch(() => {});
    }, [isAuthenticated, setUser]),
  );

  const isScrapper =
    user?.role === "scrapper" || user?.scrapperStatus === "approved";
  const scrapperPending = user?.scrapperStatus === "pending";

  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";
  const displayName = user?.first_name
    ? `Hi ${user.first_name} !`
    : "Hi Guest !";
  const contactInfo = user?.phone
    ? "XXXXXX" + user.phone.slice(-4)
    : user?.email || "Not logged in";
  const bottomInset = useTabBarInset();

  const scrapperLabel = isScrapper
    ? "Scrapper Jobs"
    : scrapperPending
      ? "Scrapper Application (Pending)"
      : "Become a Scrapper";

  return (
    <SafeAreaView style={styles.safe}>
      {/* Back button */}
      <Pressable
        style={styles.backBtn}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <Feather name="arrow-left" size={22} color={colors.neutral.black} />
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset }]}
      >
        {/* Avatar section */}
        <LinearGradient
          colors={["#E8F5E9", "#F5F5F5"]}
          style={styles.avatarSection}
        >
          {/* Decorative circles */}
          <View style={styles.deco1} />
          <View style={styles.deco2} />

          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Pressable
            onPress={() => router.push("/(profile)/edit-profile")}
            style={styles.editHint}
          >
            <Feather
              name="chevron-down"
              size={16}
              color={colors.neutral.gray400}
            />
          </Pressable>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.phone}>{contactInfo}</Text>
        </LinearGradient>

        <View style={styles.menuSection}>
          {/* Scrapper section */}
          <MenuCard>
            <MenuRow
              icon="tool"
              label={scrapperLabel}
              onPress={() =>
                router.push(
                  isScrapper
                    ? "/(profile)/scrapper-jobs"
                    : "/(profile)/become-scrapper",
                )
              }
            />
            {isScrapper && (
              <>
                <View style={styles.separator} />
                <MenuRow
                  icon="credit-card"
                  label="Scrapper Wallet"
                  onPress={() => router.push("/(profile)/scrapper-wallet")}
                />
                <View style={styles.separator} />
                <MenuRow
                  icon="file-text"
                  label="Scrapper Application"
                  onPress={() => router.push("/(profile)/become-scrapper")}
                />
              </>
            )}
            <View style={styles.separator} />
            <MenuRow
              icon="bell"
              label="Notifications"
              onPress={() => router.push("/(profile)/notifications")}
            />
          </MenuCard>

          <MenuCard>
            <MenuRow
              icon="help-circle"
              label="Help & Support"
              onPress={() => router.push("/(profile)/help-support")}
            />
            <View style={styles.separator} />
            <MenuRow
              icon="file-text"
              label="Terms & Conditions"
              onPress={() => router.push("/(profile)/terms")}
            />
          </MenuCard>

          <MenuCard>
            <MenuRow
              icon="settings"
              label="Account Settings"
              onPress={() => router.push("/(profile)/edit-profile")}
            />
            <View style={styles.separator} />
            <MenuRow icon="info" label="About Us" onPress={() => {}} />
          </MenuCard>

          <MenuCard>
            <MenuRow
              icon="refresh-cw"
              label="Check for Updates"
              onPress={() => {}}
            />
          </MenuCard>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerApp}>Eco Scrap</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: layout.screenBg },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
    marginTop: spacing.sm,
  },
  scroll: {},

  avatarSection: {
    alignItems: "center",
    paddingTop: spacing["2xl"],
    paddingBottom: spacing["3xl"],
    marginBottom: spacing.xl,
    overflow: "hidden",
  },
  deco1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(46,125,50,0.05)",
    top: -80,
    right: -40,
  },
  deco2: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(46,125,50,0.05)",
    bottom: -30,
    left: -20,
  },

  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.green600,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.neutral.white,
  },
  editHint: { marginBottom: spacing.sm },
  name: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: colors.neutral.black,
    marginBottom: 4,
  },
  phone: { ...typography.bodySm, color: colors.neutral.gray400 },

  menuSection: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    overflow: "hidden",
    ...shadows.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.neutral.white,
  },
  rowIconBox: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.neutral.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
  },
  rowLabel: { flex: 1, ...typography.body, color: colors.neutral.black },
  separator: {
    height: 1,
    backgroundColor: colors.neutral.gray100,
    marginLeft: 68,
  },

  footer: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
    marginTop: spacing["2xl"],
  },
  footerApp: {
    ...typography.bodySmMedium,
    color: colors.neutral.gray400,
    fontWeight: "600" as const,
  },
  footerVersion: {
    ...typography.caption,
    color: colors.neutral.gray400,
    marginTop: 4,
  },
});
