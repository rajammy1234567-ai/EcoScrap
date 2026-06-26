import { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, FlatList, Dimensions, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { userService } from '../../src/services/user';
import { pickupService } from '../../src/services/pickup';
import { SectionHeader } from '../../src/components/layout/SectionHeader';
import { LiveUsersStrip } from '../../src/components/live/LiveUsersStrip';
import { ScrapIcon } from '../../src/components/ui/ScrapIcon';
import { ONBOARDING_CATEGORIES } from '../../src/utils/scrapIcons';
import { Address, Pickup } from '../../src/types';
import { AppImages } from '../../src/assets/images';
import { useTabBarInset } from '../../src/hooks/useTabBarInset';
import { colors, spacing, typography, radii, shadows, layout } from '../../src/theme';

const { width: W } = Dimensions.get('window');
const CARD_PAD = spacing.lg;
const PROMO_W = W - CARD_PAD * 2;

const PROMO_BANNERS = [
  {
    id: 'accuracy',
    image: AppImages.bannerAccuracy,
    title: '100% weight accuracy',
    sub: 'Digital scale · Verified pricing',
  },
  {
    id: 'doorstep',
    image: AppImages.bannerDoorstep,
    title: 'Free doorstep pickup',
    sub: 'Book in 30 seconds',
  },
] as const;

const QUICK_ACTIONS = [
  { id: 'rates', icon: 'tag', label: 'Scrap Rates', route: '/(tabs)/scrap-rates' },
  { id: 'pickups', icon: 'package', label: 'My Pickups', route: '/(tabs)/requests' },
  { id: 'help', icon: 'headphones', label: 'Help', route: '/(profile)/help-support' },
  { id: 'refer', icon: 'gift', label: 'Refer', route: '/(profile)/referral' },
] as const;

const TOP_RATES = [
  { name: 'Newspaper', rate: '₹14/kg', icon: 'Paper' },
  { name: 'Copper Wire', rate: '₹450/kg', icon: 'Metal' },
  { name: 'Laptop', rate: '₹500/unit', icon: 'E-Waste' },
];

const HOW_IT_WORKS = [
  { step: '1', icon: 'calendar', title: 'Schedule', sub: 'Pick time & scrap type' },
  { step: '2', icon: 'truck', title: 'Pickup', sub: 'Partner comes to you' },
  { step: '3', icon: 'dollar-sign', title: 'Get Paid', sub: 'Instant cash on spot' },
];

const BRANDS = [
  { id: '1', logo: require('../../assets/images/brands/urban-company.png') },
  { id: '4', logo: require('../../assets/images/brands/godrej.png') },
  { id: '5', logo: require('../../assets/images/brands/tata.png') },
  { id: '6', logo: require('../../assets/images/brands/reliance.png') },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(first?: string | null, last?: string | null): string {
  return ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase() || 'U';
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [activePickup, setActivePickup] = useState<Pickup | null>(null);
  const [activePromo, setActivePromo] = useState(0);
  const promoRef = useRef<FlatList>(null);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setDefaultAddress(null);
      setActivePickup(null);
      return;
    }
    try {
      const [addrRes, pickupRes] = await Promise.all([
        userService.getAddresses(),
        pickupService.list({ status: 'pending', limit: 1 }),
      ]);
      const addrs: Address[] = addrRes.data.addresses ?? [];
      setDefaultAddress(addrs.find((a) => a.is_default) ?? addrs[0] ?? null);
      const pickups: Pickup[] = pickupRes.data.pickups ?? [];
      setActivePickup(pickups[0] ?? null);
    } catch {
      /* keep UI usable offline */
    }
  }, [isAuthenticated]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const addressLine = defaultAddress
    ? [defaultAddress.flat_number, defaultAddress.locality, defaultAddress.city]
        .filter(Boolean)
        .join(', ')
    : null;

  const name = user?.first_name ?? 'there';
  const bottomInset = useTabBarInset();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset }]}
      >
        {/* ── Dark header (Uber-style) ── */}
        <LinearGradient
          colors={[...layout.headerGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.topRow}>
            <View>
              <Text style={styles.brand}>TheKabadiwala</Text>
              <Text style={styles.greeting}>{getGreeting()}, {name}</Text>
            </View>
            <View style={styles.topActions}>
              <Pressable style={styles.iconBtn} hitSlop={8}>
                <Feather name="bell" size={20} color="rgba(255,255,255,0.9)" />
              </Pressable>
              <Pressable
                style={styles.avatar}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Text style={styles.avatarText}>
                  {getInitials(user?.first_name, user?.last_name)}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Location bar */}
          <Pressable
            style={styles.locationBar}
            onPress={() => router.push('/(location)/add-address')}
          >
            <View style={styles.locationDot} />
            <View style={styles.locationText}>
              <Text style={styles.locationLabel}>PICKUP FROM</Text>
              <Text style={styles.locationValue} numberOfLines={1}>
                {addressLine ?? 'Add your pickup address'}
              </Text>
            </View>
            <Feather name="chevron-down" size={20} color={colors.neutral.gray600} />
          </Pressable>

          {/* Trust strip */}
          <View style={styles.trustStrip}>
            <View style={styles.trustItem}>
              <Feather name="star" size={12} color="#FFD54F" />
              <Text style={styles.trustText}>4.8 rating</Text>
            </View>
            <View style={styles.trustDot} />
            <View style={styles.trustItem}>
              <Feather name="users" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.trustText}>5L+ users</Text>
            </View>
            <View style={styles.trustDot} />
            <View style={styles.trustItem}>
              <Feather name="shield" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.trustText}>Verified weight</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Body content on gray bg ── */}
        <View style={styles.body}>
          {/* Primary CTA — overlaps header */}
          <Pressable
            style={styles.heroCta}
            onPress={() => router.push('/(home)/select-items')}
          >
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>Schedule Pickup</Text>
              <Text style={styles.heroSub}>Free doorstep · Instant cash payment</Text>
              <View style={styles.heroTags}>
                <View style={styles.heroTag}>
                  <Feather name="zap" size={10} color={colors.primary.green600} />
                  <Text style={styles.heroTagText}>30 sec booking</Text>
                </View>
                <View style={styles.heroTag}>
                  <Feather name="clock" size={10} color={colors.primary.green600} />
                  <Text style={styles.heroTagText}>Same day slots</Text>
                </View>
              </View>
            </View>
            <Image
              source={AppImages.bannerDoorstep}
              style={styles.heroThumb}
              resizeMode="cover"
            />
          </Pressable>

          {/* Promo banners */}
          <View style={styles.promoSection}>
            <FlatList
              ref={promoRef}
              data={PROMO_BANNERS}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(b) => b.id}
              snapToInterval={PROMO_W + spacing.sm}
              decelerationRate="fast"
              onScroll={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (PROMO_W + spacing.sm));
                setActivePromo(idx);
              }}
              scrollEventThrottle={16}
              contentContainerStyle={{ gap: spacing.sm }}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.promoCard, { width: PROMO_W }]}
                  onPress={() => router.push('/(home)/select-items')}
                >
                  <Image source={item.image} style={styles.promoImage} resizeMode="cover" />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.75)']}
                    style={styles.promoOverlay}
                  >
                    <Text style={styles.promoTitle}>{item.title}</Text>
                    <Text style={styles.promoSub}>{item.sub}</Text>
                  </LinearGradient>
                </Pressable>
              )}
            />
            <View style={styles.promoDots}>
              {PROMO_BANNERS.map((_, i) => (
                <View key={i} style={[styles.promoDot, i === activePromo && styles.promoDotActive]} />
              ))}
            </View>
          </View>

          {/* Live collectors — reels-style on tap */}
          <View style={styles.card}>
            <LiveUsersStrip />
          </View>

          {/* Active pickup */}
          {activePickup && (
            <Pressable
              style={styles.activeCard}
              onPress={() =>
                router.push({
                  pathname: '/(requests)/detail',
                  params: { id: activePickup.id, pickupJson: JSON.stringify(activePickup) },
                })
              }
            >
              <View style={styles.activeLeft}>
                <View style={styles.activeBadge}>
                  <View style={styles.activePulse} />
                  <Text style={styles.activeBadgeText}>LIVE</Text>
                </View>
                <Text style={styles.activeTitle}>Pickup scheduled</Text>
                <Text style={styles.activeSub}>
                  {activePickup.scheduled_at
                    ? new Date(activePickup.scheduled_at).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
                      })
                    : 'Partner will contact you soon'}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.primary.green600} />
            </Pressable>
          )}

          {/* Phone warning */}
          {user && !user.phone && (
            <Pressable
              style={styles.alertCard}
              onPress={() => router.push('/(profile)/edit-profile')}
            >
              <Feather name="alert-circle" size={18} color={colors.functional.warning} />
              <Text style={styles.alertText}>Add phone number for pickup updates</Text>
              <Feather name="chevron-right" size={16} color={colors.functional.warning} />
            </Pressable>
          )}

          {/* Quick actions */}
          <View style={styles.card}>
            <SectionHeader title="Quick actions" />
            <View style={styles.quickGrid}>
              {QUICK_ACTIONS.map((a) => (
                <Pressable
                  key={a.id}
                  style={styles.quickTile}
                  onPress={() => router.push(a.route as any)}
                >
                  <View style={styles.quickIcon}>
                    <Feather name={a.icon as any} size={20} color={colors.primary.green600} />
                  </View>
                  <Text style={styles.quickLabel}>{a.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.card}>
            <SectionHeader
              title="What are you selling?"
              actionLabel="All rates"
              onAction={() => router.push('/(tabs)/scrap-rates')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catRow}
            >
              {ONBOARDING_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.name}
                  style={styles.catTile}
                  onPress={() => router.push('/(home)/select-items')}
                >
                  <ScrapIcon icon={cat.icon} variant="filled" size={22} />
                  <Text style={styles.catName}>{cat.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Top rates */}
          <View style={styles.card}>
            <SectionHeader title="Top rates today" subtitle="Updated daily · Best market prices" />
            <View style={styles.ratesRow}>
              {TOP_RATES.map((r) => (
                <Pressable
                  key={r.name}
                  style={styles.rateTile}
                  onPress={() => router.push('/(tabs)/scrap-rates')}
                >
                  <ScrapIcon name={r.icon} variant="compact" size={14} />
                  <Text style={styles.rateName} numberOfLines={1}>{r.name}</Text>
                  <Text style={styles.rateValue}>{r.rate}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* How it works */}
          <View style={styles.card}>
            <SectionHeader title="How it works" />
            <View style={styles.stepsRow}>
              {HOW_IT_WORKS.map((s, i) => (
                <View key={s.step} style={styles.stepTile}>
                  <View style={styles.stepIcon}>
                    <Feather name={s.icon as any} size={18} color={colors.primary.green600} />
                  </View>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepSub}>{s.sub}</Text>
                  {i < HOW_IT_WORKS.length - 1 && <View style={styles.stepLine} />}
                </View>
              ))}
            </View>
          </View>

          {/* Impact */}
          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9']}
            style={styles.impactCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="leaf" size={32} color={colors.primary.green700} />
            <View style={styles.impactText}>
              <Text style={styles.impactNum}>45,39,170 kg</Text>
              <Text style={styles.impactLabel}>recycled through our platform</Text>
            </View>
          </LinearGradient>

          {/* Partners */}
          <View style={styles.card}>
            <SectionHeader title="Trusted by leading brands" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandsRow}>
              {BRANDS.map((b) => (
                <View key={b.id} style={styles.brandChip}>
                  <Image source={b.logo} style={styles.brandLogo} resizeMode="contain" />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: layout.screenBg },
  scroll: {},
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  brand: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.neutral.white,
    marginTop: 2,
  },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary.green700,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.lg,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.green600,
  },
  locationText: { flex: 1 },
  locationLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.neutral.gray400,
    letterSpacing: 1,
  },
  locationValue: {
    ...typography.bodySmMedium,
    color: colors.neutral.black,
    marginTop: 2,
  },
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trustText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500' as const },
  trustDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.4)' },

  body: {
    marginTop: -spacing['2xl'],
    paddingHorizontal: CARD_PAD,
    gap: spacing.md,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  heroLeft: { flex: 1 },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.neutral.black,
  },
  heroSub: {
    ...typography.caption,
    color: colors.neutral.gray600,
    marginTop: 4,
  },
  heroTags: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary.green50,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  heroTagText: { fontSize: 10, fontWeight: '600' as const, color: colors.primary.green700 },
  heroThumb: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    backgroundColor: colors.primary.green50,
  },
  promoSection: { marginBottom: spacing.xs },
  promoCard: {
    height: 140,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  promoImage: { width: '100%', height: '100%' },
  promoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    paddingTop: spacing['3xl'],
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: colors.neutral.white,
  },
  promoSub: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  promoDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  promoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral.gray200,
  },
  promoDotActive: {
    width: 18,
    backgroundColor: colors.primary.green600,
  },

  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.green600,
    ...shadows.md,
  },
  activeLeft: { flex: 1 },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  activePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.green500,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: colors.primary.green600,
    letterSpacing: 1,
  },
  activeTitle: { ...typography.bodySmMedium, fontWeight: '700' as const, color: colors.neutral.black },
  activeSub: { ...typography.caption, color: colors.neutral.gray600, marginTop: 2 },

  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.functional.warningBg,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  alertText: { flex: 1, ...typography.caption, color: colors.functional.warning, fontWeight: '600' as const },

  card: {
    backgroundColor: layout.cardBg,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickTile: {
    width: (W - CARD_PAD * 2 - spacing.lg * 2 - spacing.sm) / 2 - 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral.gray100,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { ...typography.caption, fontWeight: '600' as const, color: colors.neutral.black, flex: 1 },

  catRow: { gap: spacing.sm, paddingRight: spacing.sm },
  catTile: {
    alignItems: 'center',
    width: 76,
    padding: spacing.sm,
    backgroundColor: colors.neutral.gray100,
    borderRadius: radii.lg,
    gap: spacing.xs,
  },
  catName: { ...typography.caption, fontWeight: '600' as const, color: colors.neutral.black, fontSize: 11 },

  ratesRow: { flexDirection: 'row', gap: spacing.sm },
  rateTile: {
    flex: 1,
    backgroundColor: colors.primary.green50,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.primary.green100,
  },
  rateName: { ...typography.caption, fontWeight: '600' as const, color: colors.neutral.black, fontSize: 11 },
  rateValue: { fontSize: 13, fontWeight: '800' as const, color: colors.primary.green700 },

  stepsRow: { flexDirection: 'row' },
  stepTile: { flex: 1, alignItems: 'center', position: 'relative' },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.green50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  stepTitle: { ...typography.caption, fontWeight: '700' as const, color: colors.neutral.black },
  stepSub: { ...typography.caption, color: colors.neutral.gray400, textAlign: 'center', fontSize: 10, marginTop: 2 },
  stepLine: {
    position: 'absolute',
    top: 22,
    right: -20,
    width: 40,
    height: 2,
    backgroundColor: colors.primary.green100,
  },

  impactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  impactText: { flex: 1 },
  impactNum: { fontSize: 18, fontWeight: '800' as const, color: colors.primary.green700 },
  impactLabel: { ...typography.caption, color: colors.primary.green700, marginTop: 2 },

  brandsRow: { gap: spacing.sm },
  brandChip: {
    backgroundColor: colors.neutral.gray100,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  brandLogo: { width: 64, height: 28 },
});