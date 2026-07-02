import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header } from '../../src/components/shared/Header';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useAuth } from '../../src/context/AuthContext';
import { userService } from '../../src/services/user';
import { colors, radii, spacing, typography, shadows } from '../../src/theme';

const STEPS = [
  'Share your referral code with friends',
  'Friend signs up using your code',
  'You earn ₹30 when they complete their first pickup!',
];

export default function ReferralScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [info, setInfo] = useState<{ referral_code: string; total_earnings: number; referral_count: number } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    userService.getReferral().then((r) => setInfo(r.data)).catch(() => {});
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="Referral" />
        <EmptyState
          title="Login required"
          subtitle="Login to see your referral code and earnings"
          ctaLabel="Login"
          onCta={() => router.push('/(auth)/enter-mobile')}
          icon="gift"
        />
      </SafeAreaView>
    );
  }

  const handleCopy = async () => {
    if (info?.referral_code) {
      await Clipboard.setStringAsync(info.referral_code);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    }
  };

  const handleShare = async () => {
    await Share.share({ message: `Use my referral code ${info?.referral_code} on Eco Scrap app and earn money by selling scrap!` });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Referral" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Your Earnings</Text>
          <Text style={styles.earnings}>₹{info?.total_earnings ?? 0}</Text>
          <Text style={styles.earningsSub}>{info?.referral_count ?? 0} referral{info?.referral_count !== 1 ? 's' : ''}</Text>
        </View>

        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <Pressable style={styles.codeBox} onPress={handleCopy}>
          <Text style={styles.code}>{info?.referral_code || '------'}</Text>
          <Feather name="copy" size={20} color={colors.primary.green600} />
        </Pressable>

        <Text style={styles.howTitle}>How it works?</Text>
        {STEPS.map((step, i) => (
          <View key={i} style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.cta}>
        <Button label="Refer Now" onPress={handleShare} variant="primaryGreen" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  content: { padding: spacing.xl },
  earningsCard: { backgroundColor: colors.primary.green600, borderRadius: radii.lg, padding: spacing['2xl'], alignItems: 'center', marginBottom: spacing['2xl'] },
  earningsLabel: { ...typography.bodySm, color: 'rgba(255,255,255,0.8)' },
  earnings: { ...typography.h1, color: colors.neutral.white, fontWeight: '700' },
  earningsSub: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
  codeLabel: { ...typography.bodySmMedium, color: colors.neutral.black, marginBottom: spacing.sm },
  codeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.neutral.gray100, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing['3xl'], borderWidth: 1.5, borderColor: colors.primary.green600, borderStyle: 'dashed' },
  code: { ...typography.h3, color: colors.primary.green600, letterSpacing: 4, fontWeight: '700' },
  howTitle: { ...typography.h3, color: colors.neutral.black, marginBottom: spacing.lg },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.lg },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary.green600, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { ...typography.caption, color: colors.neutral.white, fontWeight: '700' },
  stepText: { flex: 1, ...typography.bodySm, color: colors.neutral.black },
  cta: { padding: spacing.xl },
});
