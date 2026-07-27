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
import { AuthModeToggle, AuthMode } from "../../src/components/auth/AuthModeToggle";
import { GoogleContinueButton } from "../../src/components/auth/GoogleContinueButton";
import { useAuth } from "../../src/context/AuthContext";
import {
  authService,
  sanitizePhone,
  isValidPhone,
  isValidEmail,
} from "../../src/services/auth";
import { signInWithGoogle } from "../../src/services/googleSignIn";
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

function networkErrorMessage(err: any, fallback: string) {
  if (err?.isNetworkError || err?.code === "ECONNABORTED" || err?.message?.includes("timeout") || err?.message?.includes("Cannot reach")) {
    return err?.message || "Server se connect nahi ho pa raha. Internet check karo ya backend start karo.";
  }
  return err?.response?.data?.message || err?.message || fallback;
}

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<AuthMode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const resetPhoneOtp = () => {
    setOtp("");
    setOtpSent(false);
    setGeneratedOtp(null);
  };

  const handleModeChange = (next: AuthMode) => {
    setMode(next);
    resetPhoneOtp();
  };

  const handleDemoLogin = async () => {
    await login("demo-access-token", "demo-refresh-token", DEMO_USER);
    router.replace("/(tabs)/home");
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.login(email.trim(), password);
      await login(data.token, data.token, data.user);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      Alert.alert("Error", networkErrorMessage(err, "Could not login. Please check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const cleanPhone = sanitizePhone(phone);
    if (!isValidPhone(cleanPhone)) {
      Alert.alert("Error", "Phone number must be exactly 10 digits.");
      return;
    }
    setOtpLoading(true);
    try {
      const { data } = await authService.sendOtp({
        phone: cleanPhone,
        purpose: "login",
      });
      const appOtp = data.otp as string | undefined;
      setOtpSent(true);
      setGeneratedOtp(appOtp || null);
      setOtp("");
      if (appOtp) {
        Alert.alert(
          "OTP Generated",
          `Your in-app OTP is: ${appOtp}\n\nEnter this OTP below to sign in. (Valid 10 min)`,
        );
      } else {
        Alert.alert("OTP Sent", data.message || "OTP generated successfully.");
      }
    } catch (err: any) {
      Alert.alert("Error", networkErrorMessage(err, "Could not generate OTP."));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtpLogin = async () => {
    const cleanPhone = sanitizePhone(phone);
    if (!isValidPhone(cleanPhone)) {
      Alert.alert("Error", "Phone number must be exactly 10 digits.");
      return;
    }
    if (!otp.trim() || otp.trim().length < 4) {
      Alert.alert("Error", "Please enter the OTP shown in the app.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.verifyOtp({
        phone: cleanPhone,
        otp: otp.trim(),
      });
      const token = data.token || data.access_token;
      await login(token, token, data.user);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      Alert.alert("Error", networkErrorMessage(err, "Invalid or expired OTP."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleContinue = async () => {
    setGoogleLoading(true);
    try {
      const { token, user } = await signInWithGoogle();
      await login(token, token, user);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      if (
        err?.code === "GOOGLE_CANCELLED" ||
        err?.code === "SIGN_IN_CANCELLED" ||
        err?.message?.includes("cancelled")
      ) {
        return;
      }
      Alert.alert(
        "Error",
        networkErrorMessage(err, "Google sign-in failed. Please try again."),
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthScreenShell
      title="Welcome back"
      subtitle="Sign in with email, phone OTP, or Google"
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
      <AuthModeToggle mode={mode} onChange={handleModeChange} />

      {mode === "email" ? (
        <>
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
            onPress={handleEmailLogin}
            variant="primaryDark"
            loading={loading}
            style={styles.primaryBtn}
          />
        </>
      ) : (
        <>
          <Input
            label="Mobile number"
            placeholder="10-digit mobile number"
            leftIcon="phone"
            phonePrefix
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => {
              setPhone(sanitizePhone(t));
              if (otpSent) resetPhoneOtp();
            }}
          />

          {!otpSent ? (
            <Button
              label="Get OTP"
              onPress={handleSendOtp}
              variant="primaryDark"
              loading={otpLoading}
              style={styles.primaryBtn}
            />
          ) : (
            <>
              {generatedOtp ? (
                <View style={styles.otpBanner}>
                  <Feather name="shield" size={16} color={colors.primary.green700} />
                  <View style={styles.otpBannerText}>
                    <Text style={styles.otpBannerTitle}>In-app OTP</Text>
                    <Text style={styles.otpBannerCode}>{generatedOtp}</Text>
                    <Text style={styles.otpBannerHint}>
                      Enter this code below to verify
                    </Text>
                  </View>
                </View>
              ) : null}

              <Input
                label="Enter OTP"
                placeholder="6-digit OTP"
                leftIcon="key"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />

              <Button
                label="Verify & Sign In"
                onPress={handleVerifyOtpLogin}
                variant="primaryDark"
                loading={loading}
                style={styles.primaryBtn}
              />

              <Pressable onPress={handleSendOtp} disabled={otpLoading} style={styles.resendRow}>
                <Text style={styles.resendText}>
                  {otpLoading ? "Sending..." : "Resend OTP"}
                </Text>
              </Pressable>
            </>
          )}
        </>
      )}

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleContinueButton
        onPress={handleGoogleContinue}
        loading={googleLoading}
        disabled={loading || otpLoading}
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
  otpBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.primary.green50,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.primary.green200,
    marginBottom: spacing.lg,
  },
  otpBannerText: { flex: 1 },
  otpBannerTitle: {
    ...typography.caption,
    color: colors.primary.green700,
    fontWeight: "600" as const,
  },
  otpBannerCode: {
    fontSize: 28,
    fontWeight: "800" as const,
    letterSpacing: 6,
    color: colors.primary.green700,
    marginTop: 4,
  },
  otpBannerHint: {
    ...typography.caption,
    color: colors.neutral.gray600,
    marginTop: 4,
  },
  resendRow: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  resendText: {
    ...typography.bodySm,
    color: colors.primary.green600,
    fontWeight: "700" as const,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral.gray200,
  },
  dividerText: {
    ...typography.caption,
    color: colors.neutral.gray400,
    fontWeight: "600" as const,
  },
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
