import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows, layout } from '../../theme';

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  heroImage: ImageSourcePropType;
  onBack?: () => void;
  onSkip?: () => void;
  skipLabel?: string;
  scroll?: boolean;
  footer?: React.ReactNode;
}

export function AuthScreenShell({
  children,
  title,
  subtitle,
  heroImage,
  onBack,
  onSkip,
  skipLabel = 'Skip',
  scroll = false,
  footer,
}: Props) {
  const Body = scroll ? ScrollView : View;
  const bodyProps = scroll
    ? { contentContainerStyle: styles.scrollContent, showsVerticalScrollIndicator: false as const }
    : { style: styles.formStatic };

  return (
    <View style={styles.root}>
      <Image source={heroImage} style={styles.heroBg} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(27,94,32,0.55)', 'rgba(27,94,32,0.85)']}
        style={styles.heroOverlay}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          {onBack ? (
            <Pressable style={styles.roundBtn} onPress={onBack} hitSlop={8}>
              <Feather name="arrow-left" size={20} color={colors.neutral.white} />
            </Pressable>
          ) : (
            <View style={styles.roundBtnPlaceholder} />
          )}
          <View style={styles.brandChip}>
            <Text style={styles.brandText}>Eco Scrap</Text>
          </View>
          {onSkip ? (
            <Pressable style={styles.skipBtn} onPress={onSkip}>
              <Text style={styles.skipText}>{skipLabel}</Text>
            </Pressable>
          ) : (
            <View style={styles.roundBtnPlaceholder} />
          )}
        </View>

        <View style={styles.heroCopy}>
          <View style={styles.trustRow}>
            <Feather name="star" size={12} color="#FFD54F" />
            <Text style={styles.trustText}>4.8 · 5 Lakh+ users</Text>
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.sheetWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          <Text style={styles.sheetSub}>{subtitle}</Text>

          <Body {...bodyProps}>
            {children}
          </Body>

          {footer}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: layout.headerGradient[0] },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    height: '48%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
  },
  safe: { flex: 0 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnPlaceholder: { width: 40 },
  brandChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  brandText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.neutral.white,
    letterSpacing: 0.3,
  },
  skipBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  skipText: {
    ...typography.caption,
    color: colors.neutral.white,
    fontWeight: '600' as const,
  },
  heroCopy: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600' as const,
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    flex: 1,
    marginTop: '22%',
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: radii.xl + 8,
    borderTopRightRadius: radii.xl + 8,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    ...shadows.lg,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral.gray200,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.neutral.black,
    letterSpacing: -0.5,
  },
  sheetSub: {
    ...typography.bodySm,
    color: colors.neutral.gray600,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  scrollContent: { paddingBottom: spacing['2xl'] },
  formStatic: { flex: 1 },
});