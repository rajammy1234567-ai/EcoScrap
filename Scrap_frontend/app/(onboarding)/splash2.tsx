import { View, Text, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { ScrapIcon } from '../../src/components/ui/ScrapIcon';
import { ONBOARDING_CATEGORIES } from '../../src/utils/scrapIcons';
import { AppImages } from '../../src/assets/images';
import { colors, radii, spacing, typography, shadows, layout } from '../../src/theme';

export default function Splash2Screen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <Image source={AppImages.bannerAccuracy} style={styles.heroImg} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(27,94,32,0.9)']}
        style={styles.heroFade}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
            <Feather name="arrow-left" size={20} color={colors.neutral.white} />
          </Pressable>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>Step 2 of 3</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>We buy all scrap</Text>
          <Text style={styles.heroSub}>
            Paper, metal, e-waste & more — best rates, free pickup
          </Text>
        </View>
      </SafeAreaView>

      <View style={styles.sheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.grid}>
            {ONBOARDING_CATEGORIES.map((cat) => (
              <View key={cat.name} style={styles.card}>
                <ScrapIcon icon={cat.icon} variant="filled" size={26} />
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catDesc} numberOfLines={2}>{cat.desc}</Text>
              </View>
            ))}
          </View>

          <View style={styles.highlight}>
            <Feather name="trending-up" size={18} color={colors.primary.green600} />
            <View style={styles.highlightText}>
              <Text style={styles.highlightTitle}>Live market rates</Text>
              <Text style={styles.highlightSub}>Updated daily · Transparent pricing</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.cta}>
          <Button
            label="Continue"
            onPress={() => router.push('/(onboarding)/permissions')}
            variant="primaryDark"
            style={styles.ctaBtn}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: layout.headerGradient[0] },
  heroImg: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  heroFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  safe: { flex: 0 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.neutral.white,
  },
  heroCopy: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.neutral.white,
  },
  heroSub: {
    ...typography.bodySm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.sm,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: 120,
    ...shadows.lg,
  },
  scroll: { padding: spacing.xl, paddingBottom: spacing.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: colors.neutral.gray100,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary.green100,
  },
  catName: {
    ...typography.bodySmMedium,
    fontWeight: '700' as const,
    color: colors.neutral.black,
    marginTop: spacing.md,
  },
  catDesc: {
    ...typography.caption,
    color: colors.neutral.gray600,
    marginTop: 4,
    lineHeight: 16,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.primary.green50,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.primary.green100,
  },
  highlightText: { flex: 1 },
  highlightTitle: {
    ...typography.bodySmMedium,
    fontWeight: '700' as const,
    color: colors.neutral.black,
  },
  highlightSub: { ...typography.caption, color: colors.neutral.gray600, marginTop: 2 },
  cta: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
  },
  ctaBtn: { ...shadows.md },
});