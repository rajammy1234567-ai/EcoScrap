import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/context/AuthContext";
import { authService } from "../../src/services/auth";
import { colors, radii, spacing, typography } from "../../src/theme";

const DEMO_USER = {
  id: "demo-user-001",
  phone: null,
  first_name: "Abhishek",
  last_name: "Demo",
  email: "demo@thekabadiwala.com",
  referral_code: "DEMO123",
  category: "individual",
};

export default function EnterEmailScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDemoLogin = async () => {
    await login("demo-access-token", "demo-refresh-token", DEMO_USER);
    router.replace("/(tabs)/home");
  };

  const handleContinue = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authService.sendOtp(email);
      router.push({ pathname: "/(auth)/verify-otp", params: { email } });
    } catch (err: any) {
      const msg =
        err?.code === "ECONNABORTED" || err?.message?.includes("timeout")
          ? "Connection timed out. Make sure the server is running."
          : err?.response?.data?.message ||
            err?.response?.data?.detail ||
            "Could not send OTP. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.skipRow}>
        <Button
          label="Skip"
          onPress={() => router.replace("/(tabs)/home")}
          variant="skipPill"
        />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>♻️</Text>
            </View>
            <Text style={styles.appName}>TheKabadiwala</Text>
          </View>

          <Text style={styles.title}>Enter your{"\n"}email address</Text>
          <Text style={styles.subtitle}>
            We'll send you a one-time verification code
          </Text>

          <Input
            placeholder="Enter Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (error) setError("");
            }}
            error={error}
          />

          <Button
            label="Continue"
            onPress={handleContinue}
            variant="primaryGreen"
            loading={loading}
          />

          {/* Demo login banner */}
          <Pressable style={styles.demoBanner} onPress={handleDemoLogin}>
            <View style={styles.demoLeft}>
              <Feather name="zap" size={16} color={colors.functional.warning} />
              <Text style={styles.demoText}>
                Demo Login — tap to test the app instantly
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={16}
              color={colors.functional.warning}
            />
          </Pressable>

          <Text style={styles.terms}>
            By continuing, you agree to our{" "}
            <Text style={styles.link}>Terms of Service</Text>,{" "}
            <Text style={styles.link}>Privacy Policy</Text> and{" "}
            <Text style={styles.link}>Content Policy</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  flex: { flex: 1 },
  skipRow: {
    alignItems: "flex-end",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["2xl"],
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing["2xl"],
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.green50,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 20 },
  appName: { ...typography.h3, color: colors.primary.green600 },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.neutral.black,
    lineHeight: 36,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral.gray600,
    marginBottom: spacing["2xl"],
  },
  demoBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: "#FFF8E1",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  demoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  demoText: {
    ...typography.bodySm,
    color: "#795548",
    fontWeight: "500" as const,
    flex: 1,
  },
  terms: {
    ...typography.caption,
    color: colors.neutral.gray600,
    textAlign: "center",
    marginTop: spacing.lg,
    lineHeight: 18,
  },
  link: { color: colors.primary.green600, fontWeight: "500" as const },
});
