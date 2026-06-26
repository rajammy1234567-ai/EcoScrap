import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { AuthScreenShell } from "../../src/components/auth/AuthScreenShell";
import { useAuth } from "../../src/context/AuthContext";
import { authService } from "../../src/services/auth";
import { AppImages } from "../../src/assets/images";
import { colors, spacing, typography, shadows } from "../../src/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !email || !password) {
      Alert.alert("Error", "First Name, Email, and Password are required.");
      return;
    }

    setLoading(true);
    try {
      const name = `${firstName} ${lastName}`.trim();
      const { data } = await authService.register(name, email, password, phone);
      await login(data.token, data.token, data.user);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      const msg =
        err?.code === "ECONNABORTED" || err?.message?.includes("timeout")
          ? "Connection timed out. Make sure the server is running."
          : err?.response?.data?.message ||
            "Could not register. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell
      title="Create account"
      subtitle="Join thousands earning from home scrap"
      heroImage={AppImages.bannerDoorstep}
      onBack={() => router.back()}
      onSkip={() => router.replace("/(tabs)/home")}
      scroll
    >
      <View style={styles.nameRow}>
        <View style={styles.half}>
          <Input
            label="First name"
            placeholder="First name"
            leftIcon="user"
            value={firstName}
            onChangeText={setFirstName}
            required
          />
        </View>
        <View style={styles.half}>
          <Input
            label="Last name"
            placeholder="Last name"
            leftIcon="user"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
      </View>

      <Input
        label="Email"
        placeholder="you@email.com"
        leftIcon="mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        required
      />

      <Input
        label="Password"
        placeholder="Min. 6 characters"
        leftIcon="lock"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
        required
      />

      <Input
        label="Phone"
        placeholder="10-digit mobile (optional)"
        leftIcon="phone"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <Button
        label="Create Account"
        onPress={handleRegister}
        variant="primaryDark"
        loading={loading}
        style={styles.primaryBtn}
      />

      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.loginLink}>Sign in</Text>
        </Pressable>
      </View>

      <Text style={styles.legal}>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  nameRow: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1 },
  primaryBtn: { marginTop: spacing.sm, ...shadows.md },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  loginText: { ...typography.bodySm, color: colors.neutral.gray600 },
  loginLink: {
    ...typography.bodySm,
    color: colors.primary.green600,
    fontWeight: "700" as const,
  },
  legal: {
    ...typography.caption,
    color: colors.neutral.gray400,
    textAlign: "center",
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});