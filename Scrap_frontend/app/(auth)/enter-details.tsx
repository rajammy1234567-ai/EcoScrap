import { useState } from 'react';
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Header } from '../../src/components/shared/Header';
import { useAuth } from '../../src/context/AuthContext';
import { authService } from '../../src/services/auth';
import { storage } from '../../src/services/storage';
import { colors, spacing, typography } from '../../src/theme';

export default function EnterDetailsScreen() {
  const { access, refresh } = useLocalSearchParams<{ access: string; refresh: string }>();
  const router = useRouter();
  const { login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [referral, setReferral] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }
    setLoading(true);
    try {
      // Set token first so the register call is authenticated (default refresh to empty string if missing)
      const safeRefresh = refresh || '';
      await storage.setTokens(access, safeRefresh);
      const { data } = await authService.register(firstName.trim(), lastName.trim(), referral || undefined);
      const meRes = await authService.me();
      await login(access, safeRefresh, meRes.data.user);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || 'Could not save details. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        rightAction={<Button label="Skip" onPress={() => router.replace('/(tabs)/home')} variant="skipPill" />}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Enter your details</Text>

        <View style={styles.row}>
          <View style={styles.half}>
            <Input
              label="First Name"
              required
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View style={styles.half}>
            <Input
              label="Last Name"
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        {!showReferral ? (
          <Pressable onPress={() => setShowReferral(true)}>
            <Text style={styles.referralLink}>Have a Referral Code? Apply a Referral code</Text>
          </Pressable>
        ) : (
          <Input
            label="Referral Code"
            placeholder="Enter referral code"
            value={referral}
            onChangeText={setReferral}
            autoCapitalize="characters"
          />
        )}

        <View style={styles.cta}>
          <Button label="Continue" onPress={handleContinue} variant="primaryGreen" loading={loading} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing['2xl'] },
  title: { ...typography.h1, color: colors.neutral.black, marginBottom: spacing['2xl'] },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  referralLink: { ...typography.link, color: colors.primary.green600, marginBottom: spacing['2xl'] },
  cta: { marginTop: 'auto', paddingBottom: spacing.lg },
});
