import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { storage } from '../../src/services/storage';
import { colors, radii, spacing, typography } from '../../src/theme';

const FEATURES = [
  { icon: 'home', text: 'Free doorstep pickup' },
  { icon: 'dollar-sign', text: 'Instant cash payment' },
  { icon: 'shield', text: '100% weight accuracy' },
];

export default function Splash1Screen() {
  const router = useRouter();

  const handleGetStarted = async () => {
    router.push('/(onboarding)/splash2');
  };

  const handleSkip = async () => {
    await storage.setOnboarded();
    router.replace('/(auth)/enter-mobile');
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#E8F5E9']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.skipRow}>
          <Button label="Skip" onPress={handleSkip} variant="skipPill" />
        </View>

        {/* Logo */}
        <View style={styles.logoBox}>
          <Image
            source={require('../../assets/images/brands/Gemini_Generated_Image_czpogxczpogxczpo.png')}
            style={styles.logoThumb}
            resizeMode="contain"
          />
          <Text style={styles.appName}>TheKabadiwala</Text>
          <Text style={styles.tagline}>Schedule free doorstep scrap pickups</Text>
        </View>

        {/* Hero */}
        <View style={styles.heroBox}>
          <Image
            source={require('../../assets/images/brands/Gemini_Generated_Image_czpogxczpogxczpo.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>Sell scrap from{'\n'}your doorstep</Text>
          <Text style={styles.heroSub}>Schedule a free pickup, get weighed accurately, and earn instant cash!</Text>
        </View>

        {/* Feature pills */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.icon} style={styles.featurePill}>
              <Feather name={f.icon as any} size={14} color={colors.primary.green600} />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaBox}>
          <Button label="Get Started" onPress={handleGetStarted} variant="primaryGreen" />
          <Text style={styles.asSeenOn}>⭐ 4.8 rated · 5 Lakh+ happy users</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: spacing.xl },
  skipRow: { alignItems: 'flex-end', paddingTop: spacing.lg },
  logoBox: { alignItems: 'center', marginTop: spacing.lg },
  logoThumb: { width: 64, height: 64, marginBottom: spacing.sm },
  appName: { fontSize: 24, fontWeight: '800' as const, color: colors.primary.green700, letterSpacing: -0.5 },
  tagline: { ...typography.caption, color: colors.neutral.gray600, marginTop: 4 },
  heroBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroImage: { width: '100%', height: 240, marginBottom: spacing['2xl'] },
  heroTitle: { fontSize: 30, fontWeight: '800' as const, color: colors.neutral.black, textAlign: 'center', lineHeight: 38 },
  heroSub: { ...typography.body, color: colors.neutral.gray600, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.md },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.lg },
  featurePill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.neutral.white, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.primary.green100 },
  featureText: { ...typography.caption, color: colors.neutral.gray600, fontWeight: '500' as const },
  ctaBox: { paddingBottom: spacing['2xl'], gap: spacing.md },
  asSeenOn: { ...typography.caption, color: colors.neutral.gray400, textAlign: 'center' },
});
