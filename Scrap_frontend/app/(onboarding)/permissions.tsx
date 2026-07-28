import { View, Text, StyleSheet, Image, Pressable, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { storage } from '../../src/services/storage';
import { requestNotificationPermission } from '../../src/services/notifications';
import { requestLocationPermission } from '../../src/services/location';
import { AppImages } from '../../src/assets/images';
import { colors, radii, spacing, typography, shadows } from '../../src/theme';
import { useState } from 'react';

const PERMISSIONS = [
  {
    icon: 'bell',
    title: 'Pickup alerts',
    desc: 'Real-time updates when your partner is on the way',
  },
  {
    icon: 'map-pin',
    title: 'Location',
    desc: 'Match scrap collectors within 10 km of you',
  },
  {
    icon: 'camera',
    title: 'Photos',
    desc: 'Share scrap photos for better price estimates',
  },
] as const;

export default function PermissionsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const finish = async (requestPerms: boolean) => {
    setLoading(true);
    try {
      if (requestPerms) {
        const [notifOk, locOk] = await Promise.all([
          requestNotificationPermission(),
          requestLocationPermission(),
        ]);
        if (!locOk && Platform.OS !== 'web') {
          Alert.alert(
            'Location recommended',
            'Enable location so scrapers within 10 km can find your pickups. You can turn it on later in settings.',
          );
        }
        if (!notifOk && Platform.OS !== 'web') {
          // soft skip — user can enable later
        }
      }
      await storage.setOnboarded();
      router.replace('/(auth)/enter-mobile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Image source={AppImages.emptyPickup} style={styles.heroImg} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(27,94,32,0.88)']}
        style={styles.heroFade}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
            <Feather name="arrow-left" size={20} color={colors.neutral.white} />
          </Pressable>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>Step 3 of 3</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <View style={styles.iconCircle}>
            <Feather name="shield" size={28} color={colors.primary.green600} />
          </View>
          <Text style={styles.title}>Almost there</Text>
          <Text style={styles.subtitle}>
            Enable location & alerts so nearby scrapers (within 10 km) get your pickup requests
          </Text>
        </View>

        <View style={styles.list}>
          {PERMISSIONS.map((p) => (
            <View key={p.title} style={styles.item}>
              <View style={styles.itemIcon}>
                <Feather name={p.icon} size={20} color={colors.primary.green600} />
              </View>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{p.title}</Text>
                <Text style={styles.itemDesc}>{p.desc}</Text>
              </View>
              <Feather name="check" size={16} color={colors.primary.green600} />
            </View>
          ))}
        </View>

        <View style={styles.cta}>
          <Button
            label="Allow & Continue"
            onPress={() => finish(true)}
            variant="primaryDark"
            style={styles.primaryBtn}
            loading={loading}
          />
          <Pressable onPress={() => finish(false)} style={styles.laterBtn} disabled={loading}>
            <Text style={styles.laterText}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary.green700 },
  heroImg: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  heroFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
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
  sheet: {
    flex: 1,
    marginTop: 140,
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    ...shadows.lg,
  },
  sheetHeader: { alignItems: 'center', paddingTop: spacing['2xl'] },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.green50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary.green100,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.neutral.black,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  list: { marginTop: spacing['2xl'], gap: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.neutral.gray100,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  itemText: { flex: 1 },
  itemTitle: {
    ...typography.bodySmMedium,
    fontWeight: '700' as const,
    color: colors.neutral.black,
  },
  itemDesc: {
    ...typography.caption,
    color: colors.neutral.gray600,
    marginTop: 2,
    lineHeight: 16,
  },
  cta: {
    marginTop: 'auto',
    paddingBottom: spacing['2xl'],
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  primaryBtn: { ...shadows.md },
  laterBtn: { alignSelf: 'center', padding: spacing.sm },
  laterText: {
    ...typography.bodySm,
    color: colors.neutral.gray400,
    fontWeight: '600' as const,
  },
});
