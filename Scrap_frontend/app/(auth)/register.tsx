import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/context/AuthContext";
import { authService } from "../../src/services/auth";
import { colors, radii, spacing, typography } from "../../src/theme";

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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>♻️</Text>
            </View>
            <Text style={styles.appName}>TheKabadiwala</Text>
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up to start selling your scrap
          </Text>

          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                placeholder="First Name *"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={styles.half}>
              <Input
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <View style={{ height: 16 }} />

          <Input
            placeholder="Email Address *"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <View style={{ height: 16 }} />

          <Input
            placeholder="Password *"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />

          <View style={{ height: 16 }} />

          <Input
            placeholder="Phone Number (Optional)"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <View style={{ height: 24 }} />

          <Button
            label="Register"
            onPress={handleRegister}
            variant="primaryGreen"
            loading={loading}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.loginLink}>Login</Text>
            </Pressable>
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing["3xl"],
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xl,
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
  row: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1 },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  loginText: {
    ...typography.body,
    color: colors.neutral.gray600,
  },
  loginLink: {
    ...typography.body,
    color: colors.primary.green600,
    fontWeight: "600",
  },
});
