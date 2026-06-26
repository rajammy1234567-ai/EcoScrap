import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { AuthScreenShell } from "../../src/components/auth/AuthScreenShell";
import { useAuth } from "../../src/context/AuthContext";
import { authService } from "../../src/services/auth";
import { AppImages } from "../../src/assets/images";
import { colors, radii, spacing, typography, shadows } from "../../src/theme";

const DEMO_USER = {
  id: "demo-user-001",
  phone: "",
  first_name: "Abhishek",
  last_name: "Demo",
  email: "demo@thekabadiwala.com",
  referral_code: "DEMO123",
  category: "individual",
};

const PERKS = [
  { icon: "truck", text: "Free doorstep pickup" },
  { icon: "dollar-sign", text: "Instant cash" },
  { icon: "shield", text: "Verified weight" },
] as const;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    await login("demo-access-token", "demo-refresh-token", DEMO_USER);
    router.replace("/(tabs)/home");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.login(email, password);
      await login(data.token, data.token, data.user);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      const msg =
        err?.code === "ECONNABORTED" || err?.message?.includes("timeout")
          ? "Connection timed out. Make sure the server is running."
          : err?.response?.data?.message ||
            "Could not login. Please check your credentials.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell
      title="Welcome back"
      subtitle="Sign in to schedule pickups and track earnings"
      heroImage={AppImages.heroOnboarding}
      onSkip={() => router.replace("/(tabs)/home")}
      scroll
      footer={
        <View style={styles.perks}>
          {PERKS.map((p) => (
            <View key={p.icon} style={styles.perk}>
              <Feather name={p.icon} size={12} color={colors.primary.green600} />
              <Text style={styles.perkText}>{p.text}</Text>
            </View>
          ))}
        </View>
      }
    >
      <Input
        label="Email"
        placeholder="you@email.com"
        leftIcon="mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Input
        label="Password"
        placeholder="Enter your password"
        leftIcon="lock"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />

      <Button
        label="Sign In"
        onPress={handleLogin}
        variant="primaryDark"
        loading={loading}
        style={styles.primaryBtn}
      />

      <View style={styles.registerRow}>
        <Text style={styles.registerText}>New here? </Text>
        <Pressable onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.registerLink}>Create account</Text>
        </Pressable>
      </View>

      <Pressable style={styles.demoCard} onPress={handleDemoLogin}>
        <View style={styles.demoIcon}>
          <Feather name="zap" size={18} color={colors.functional.warning} />
        </View>
        <View style={styles.demoTextCol}>
          <Text style={styles.demoTitle}>Try demo mode</Text>
          <Text style={styles.demoSub}>Explore the app without signing up</Text>
        </View>
        <Feather name="arrow-right" size={18} color={colors.neutral.gray400} />
      </Pressable>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  primaryBtn: { marginTop: spacing.sm, ...shadows.md },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  registerText: { ...typography.bodySm, color: colors.neutral.gray600 },
  registerLink: {
    ...typography.bodySm,
    color: colors.primary.green600,
    fontWeight: "700" as const,
  },
  demoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.functional.warningBg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  demoIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.neutral.white,
    alignItems: "center",
    justifyContent: "center",
  },
  demoTextCol: { flex: 1 },
  demoTitle: {
    ...typography.bodySmMedium,
    fontWeight: "700" as const,
    color: colors.neutral.black,
  },
  demoSub: { ...typography.caption, color: colors.neutral.gray600, marginTop: 2 },
  perks: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
  },
  perk: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary.green50,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  perkText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: colors.primary.green700,
  },
});