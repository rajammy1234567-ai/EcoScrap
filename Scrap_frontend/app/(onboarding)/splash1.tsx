import { View, Text, StyleSheet, Image, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { storage } from '../../src/services/storage';
import { AppImages } from '../../src/assets/images';
import { colors, radii, spacing, typography, shadows } from '../../src/theme';

const { height: H } = Dimensions.get('window');

const FEATURES = [
  { icon: 'home', title: 'Doorstep pickup', sub: 'We come to you' },
  { icon: 'dollar-sign', title: 'Instant cash', sub: 'Paid on the spot' },
  { icon: 'shield', title: 'Fair pricing', sub: 'Digital weighing' },
] as const;

export default function Splash1Screen() {
  const router = useRouter();

  const handleGetStarted = () => router.push('/(onboarding)/splash2');

  const handleSkip = async () => {
    await storage.setOnboarded();
    router.replace('/(auth)/enter-mobile');
  };

  return (
    <View style={styles.root}>
      <Image source={AppImages.heroOnboarding} style={styles.heroImage} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(27,94,32,0.75)', 'rgba(27,94,32,0.95)']}
        locations={[0, 0.55, 1]}
        style={styles.heroGradient}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <View style={styles.brandBadge}>
            <Feather name="refresh-cw" size={14} color={colors.primary.green200} />
            <Text style={styles.brand}>TheKabadiwala</Text>
          </View>
          <Pressable style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.heroTextBlock}>
          <View style={styles.ratingPill}>
            <Feather name="star" size={12} color="#FFD54F" />
            <Text style={styles.ratingText}>4.8 rated · 5 Lakh+ users</Text>
          </View>
          <Text style={styles.heroTitle}>
            Turn your scrap{'\n'}into instant cash
          </Text>
          <Text style={styles.heroSub}>
            Free pickup from your doorstep. Accurate weighing. Best market rates.
          </Text>
        </View>

        <View style={styles.sheet}>
          <View style={styles.featureRow}>
            {FEATURES.map((f) => (
              <View key={f.icon} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Feather name={f.icon} size={18} color={colors.primary.green600} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
            ))}
          </View>

          <Button
            label="Get Started"
            onPress={handleGetStarted}
            variant="primaryDark"
            style={styles.cta}
          />
          <Text style={styles.footnote}>Trusted by Urban Company, Tata, Godrej & more</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary.green700 },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    height: H * 0.58,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    height: H * 0.58,
  },
  safe: { flex: 1, justifyContent: 'space-between' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  brand: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.neutral.white,
  },
  skipBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  skipText: {
    ...typography.caption,
    color: colors.neutral.white,
    fontWeight: '600' as const,
  },
  heroTextBlock: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    marginBottom: spacing.md,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.95)',
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: colors.neutral.white,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heroSub: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.md,
    lineHeight: 22,
  },
  sheet: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
    ...shadows.lg,
  },
  featureRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  featureCard: {
    flex: 1,
    backgroundColor: colors.neutral.gray100,
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  featureTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.neutral.black,
    textAlign: 'center',
  },
  featureSub: {
    fontSize: 9,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginTop: 2,
  },
  cta: { ...shadows.md },
  footnote: {
    ...typography.caption,
    color: colors.neutral.gray400,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});