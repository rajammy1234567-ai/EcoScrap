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

function networkErrorMessage(err: any, fallback: string) {
  if (err?.isNetworkError || err?.code === "ECONNABORTED" || err?.message?.includes("timeout") || err?.message?.includes("Cannot reach")) {
    return err?.message || "Server se connect nahi ho pa raha. Internet check karo ya backend start karo.";
  }
  return err?.response?.data?.message || err?.message || fallback;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<AuthMode>("email");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const fullName = `${firstName} ${lastName}`.trim();

  const resetPhoneOtp = () => {
    setOtp("");
    setOtpSent(false);
    setGeneratedOtp(null);
  };

  const handleModeChange = (next: AuthMode) => {
    setMode(next);
    resetPhoneOtp();
  };

  const handleEmailRegister = async () => {
    if (!firstName.trim() || !email.trim() || !password) {
      Alert.alert("Error", "First Name, Email, and Password are required.");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }
    if (phone && !isValidPhone(sanitizePhone(phone))) {
      Alert.alert("Error", "Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await authService.register(
        fullName || firstName.trim(),
        email.trim(),
        password,
        phone ? sanitizePhone(phone) : undefined,
      );
      await login(data.token, data.token, data.user);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      Alert.alert("Error", networkErrorMessage(err, "Could not register. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!firstName.trim()) {
      Alert.alert("Error", "First name is required.");
      return;
    }
    const cleanPhone = sanitizePhone(phone);
    if (!isValidPhone(cleanPhone)) {
      Alert.alert("Error", "Phone number must be exactly 10 digits.");
      return;
    }

    setOtpLoading(true);
    try {
      const { data } = await authService.sendOtp({
        phone: cleanPhone,
        name: fullName || firstName.trim(),
        purpose: "register",
      });
      const appOtp = data.otp as string | undefined;
      setOtpSent(true);
      setGeneratedOtp(appOtp || null);
      setOtp("");
      if (appOtp) {
        Alert.alert(
          "OTP Generated",
          `Your in-app OTP is: ${appOtp}\n\nEnter this OTP below to create your account. (Valid 10 min)`,
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

  const handleVerifyOtpRegister = async () => {
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
        name: fullName || firstName.trim(),
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
      const { token, user } = await signInWithGoogle({
        preferredName: fullName || undefined,
      });
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
      title="Create account"
      subtitle="Join with email, phone OTP, or Google"
      heroImage={AppImages.bannerDoorstep}
      onBack={() => router.back()}
      onSkip={() => router.replace("/(tabs)/home")}
      scroll
    >
      <AuthModeToggle mode={mode} onChange={handleModeChange} />

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
            phonePrefix
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => setPhone(sanitizePhone(t))}
          />

          <Button
            label="Create Account"
            onPress={handleEmailRegister}
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
            required
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
                      Enter this code below to create account
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
                label="Verify & Create Account"
                onPress={handleVerifyOtpRegister}
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
