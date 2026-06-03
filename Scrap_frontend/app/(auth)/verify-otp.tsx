import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Header } from '../../src/components/shared/Header';
import { useAuth } from '../../src/context/AuthContext';
import { authService } from '../../src/services/auth';
import { storage } from '../../src/services/storage';
import { colors, radii, spacing, typography } from '../../src/theme';

export default function VerifyOTPScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    if (next.every((d) => d !== '')) verify(next.join(''));
  };

  const verify = async (code: string) => {
    if (loading) return; // prevent double-fire
    setLoading(true);
    try {
      const { data } = await authService.verifyOtp(email, code);
      if (data.is_new_user) {
        const safeRefresh = data.refresh_token || '';
        router.replace({ pathname: '/(auth)/enter-details', params: { access: data.access_token, refresh: safeRefresh } });
      } else {
        const safeRefresh = data.refresh_token || '';
        await storage.setTokens(data.access_token, safeRefresh);
        const meRes = await authService.me();
        await login(data.access_token, safeRefresh, meRes.data.user);
        router.replace('/(tabs)/home');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      Alert.alert('Error', msg);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    await authService.sendOtp(email);
    setTimer(60);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              style={[styles.box, digit && styles.boxFilled]}
              value={digit}
              onChangeText={(v) => handleChange(v, i)}
              keyboardType="number-pad"
              maxLength={1}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit && i > 0) {
                  inputs.current[i - 1]?.focus();
                }
              }}
            />
          ))}
        </View>

        {timer > 0 ? (
          <Text style={styles.timer}>Resend OTP in {timer}s</Text>
        ) : (
          <Pressable onPress={resend}>
            <Text style={styles.resend}>Resend OTP</Text>
          </Pressable>
        )}

        <Button
          label="Verify"
          onPress={() => verify(otp.join(''))}
          variant="primaryGreen"
          disabled={otp.some((d) => !d)}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing['2xl'] },
  title: { ...typography.h1, color: colors.neutral.black, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.neutral.gray600, marginBottom: spacing['3xl'] },
  otpRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing['2xl'], justifyContent: 'center' },
  box: {
    width: 46, height: 52, borderWidth: 1.5, borderColor: colors.neutral.gray200,
    borderRadius: radii.md, textAlign: 'center', fontSize: 22, fontWeight: '700' as const,
    color: colors.neutral.black, backgroundColor: colors.neutral.gray100,
  },
  boxFilled: { borderColor: colors.primary.green600, backgroundColor: colors.neutral.white },
  timer: { ...typography.bodySm, color: colors.neutral.gray400, textAlign: 'center', marginBottom: spacing.lg },
  resend: { ...typography.bodySm, color: colors.primary.green600, textAlign: 'center', marginBottom: spacing.lg, fontWeight: '600' },
});
