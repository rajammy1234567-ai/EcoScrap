import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, FlatList, Dimensions, NativeSyntheticEvent,
  NativeScrollEvent, Image, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, typography, radii } from '../../src/theme';

const { width: W } = Dimensions.get('window');
const BANNER_W = W - spacing.xl * 2;

const TRUCK = require('../../assets/images/brands/Gemini_Generated_Image_czpogxczpogxczpo.png');

const BANNERS = [
  {
    id: '1',
    gradient: ['#C8F5C2', '#E8FAE5'] as [string, string],
    title: '100% accuracy\nguarantee',
    sub: '100% weight accuracy with best in\nclass material identification',
    image: TRUCK,
  },
  {
    id: '2',
    gradient: ['#BBF0BB', '#D4F7D4'] as [string, string],
    title: 'Free doorstep\npickup',
    sub: 'Schedule in 30 seconds.\nWe come to you.',
    image: TRUCK,
  },
];

const BRANDS = [
  { id: '1', name: 'Urban\nCompany', color: '#E8320E', bg: '#fff', border: '#E8320E', logo: require('../../assets/images/brands/urban-company.png') },
  { id: '2', name: 'THERMAX', color: '#D32F2F', bg: '#fff', border: '#D32F2F' },
  { id: '3', name: 'JS\nGROUP', color: '#1A6B3C', bg: '#fff', border: '#1A6B3C' },
  { id: '4', name: 'Godrej', color: '#003087', bg: '#fff', border: '#003087', logo: require('../../assets/images/brands/godrej.png') },
  { id: '5', name: 'Tata', color: '#1C4B8C', bg: '#fff', border: '#1C4B8C', logo: require('../../assets/images/brands/tata.png') },
  { id: '6', name: 'Reliance', color: '#0B4EA2', bg: '#fff', border: '#0B4EA2', logo: require('../../assets/images/brands/reliance.png') },
];

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const f = firstName?.[0]?.toUpperCase() ?? '';
  const l = lastName?.[0]?.toUpperCase() ?? '';
  return (f + l) || 'U';
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeBanner, setActiveBanner] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const initials = getInitials(user?.first_name, user?.last_name);
  const greeting = user?.first_name ? `Hi 👋, ${user.first_name}` : 'Hi 👋, Guest';

  // ── Staggered section fade + slide-up animations ──────────────────────────
  // Sections: 0=topBar, 1=addressBanner, 2=carousel, 3=scheduleBtn, 4=impactSection
  const sectionAnims = useRef([0, 1, 2, 3, 4].map(() => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20),
  }))).current;

  // ── Avatar subtle pulse ───────────────────────────────────────────────────
  const avatarScale = useRef(new Animated.Value(1)).current;

  // ── Schedule button press scale ───────────────────────────────────────────
  const scheduleBtnScale = useRef(new Animated.Value(1)).current;

  // ── Carousel banner slide-in from right ───────────────────────────────────
  const bannerTranslateX = useRef(new Animated.Value(40)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  // ── Impact count-up ───────────────────────────────────────────────────────
  const countAnim = useRef(new Animated.Value(0)).current;
  const [displayCount, setDisplayCount] = useState('0');

  useEffect(() => {
    // Staggered section entrances
    Animated.stagger(100, sectionAnims.map((a) =>
      Animated.parallel([
        Animated.timing(a.opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(a.translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    )).start();

    // Avatar pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(avatarScale, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(avatarScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Carousel banner slide-in
    Animated.parallel([
      Animated.timing(bannerTranslateX, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.timing(bannerOpacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start();

    // Impact count-up
    const listener = countAnim.addListener(({ value }) => {
      setDisplayCount(Math.floor(value).toLocaleString('en-IN'));
    });
    Animated.timing(countAnim, {
      toValue: 4539170,
      duration: 1800,
      delay: 600,
      useNativeDriver: false, // must be false for JS-driven interpolated value
    }).start();

    return () => countAnim.removeListener(listener);
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_W);
    setActiveBanner(idx);
  };

  const handleSchedulePressIn = () => {
    Animated.spring(scheduleBtnScale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handleSchedulePressOut = () => {
    Animated.spring(scheduleBtnScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const sectionStyle = (i: number) => ({
    opacity: sectionAnims[i].opacity,
    transform: [{ translateY: sectionAnims[i].translateY }],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Header gradient area (topBar + addressBanner) ── */}
        <LinearGradient
          colors={['#E8F5E9', '#F8FFF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Top Bar */}
          <Animated.View style={[styles.topBar, sectionStyle(0)]}>
            <Text style={styles.greeting}>{greeting}</Text>
            {/* Avatar with pulse + white ring */}
            <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
              <Pressable
                onPress={() => router.push('/(tabs)/profile')}
                style={styles.avatarRing}
              >
                <LinearGradient colors={['#FF6B35', '#E53935']} style={styles.avatarGrad}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>

          {/* Add Address Banner */}
          <Animated.View style={sectionStyle(1)}>
            <Pressable
              style={styles.addressBannerWrapper}
              onPress={() => router.push('/(location)/add-address')}
            >
              <LinearGradient
                colors={['#C8F5C2', '#E8FAE5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addressBannerInner}
              >
                <View style={styles.addressLeft}>
                  <Feather name="map-pin" size={20} color={colors.primary.green600} />
                  <Text style={styles.addressBannerText}>Add Address</Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.primary.green600} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </LinearGradient>

        {/* ── Carousel ── */}
        <Animated.View style={[styles.carouselSection, sectionStyle(2)]}>
          <Animated.View style={{
            opacity: bannerOpacity,
            transform: [{ translateX: bannerTranslateX }],
          }}>
            <FlatList
              ref={flatRef}
              data={BANNERS}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(b) => b.id}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              snapToInterval={BANNER_W + spacing.lg}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}
              renderItem={({ item }) => (
                <LinearGradient
                  colors={item.gradient}
                  style={[styles.bannerCard, { width: BANNER_W }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Text on LEFT */}
                  <View style={styles.bannerContent}>
                    <View style={styles.bannerBadge}>
                      <Feather name="shield" size={14} color={colors.primary.green600} />
                    </View>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    <Text style={styles.bannerSub}>{item.sub}</Text>
                  </View>
                  {/* Image on RIGHT */}
                  <Image source={item.image} style={styles.bannerImage} resizeMode="contain" />
                </LinearGradient>
              )}
            />
          </Animated.View>

          {/* Dots */}
          <View style={styles.dots}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeBanner && styles.dotActive]} />
            ))}
          </View>
        </Animated.View>

        {/* ── Schedule Pickup CTA ── */}
        <Animated.View style={[styles.scheduleRow, sectionStyle(3)]}>
          {/* Soft green glow ring */}
          <View style={styles.scheduleGlowRing}>
            <Animated.View style={{ transform: [{ scale: scheduleBtnScale }] }}>
              <Pressable
                style={styles.scheduleBtn}
                onPress={() => router.push('/(home)/select-items')}
                onPressIn={handleSchedulePressIn}
                onPressOut={handleSchedulePressOut}
              >
                <Text style={styles.scheduleBtnText}>Schedule Pickup</Text>
                <View style={styles.schedulePlus}>
                  <Feather name="plus" size={18} color={colors.neutral.white} />
                </View>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>

        {/* ── Impact Counter ── */}
        <Animated.View style={[styles.impactSection, sectionStyle(4)]}>
          <View style={styles.leafCircle}>
            <MaterialCommunityIcons name="leaf" size={28} color={colors.primary.green600} />
          </View>
          <Text style={styles.impactNumber}>
            {displayCount}{' '}
            <Text style={styles.impactUnit}>kg Recycled</Text>
          </Text>
          <Text style={styles.impactSub}>
            Trusted by leading brands to save the environment
          </Text>
        </Animated.View>

        {/* ── Brand Logos ── */}
        <View style={styles.brandsSection}>
          <Text style={styles.brandsTitle}>Our Partners</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.brandsRow}
          >
            {BRANDS.map((b) => (
              <View
                key={b.id}
                style={[styles.brandChip, { backgroundColor: b.bg, borderWidth: 1.5, borderColor: b.border }]}
              >
                {b.logo ? (
                  <Image source={b.logo} style={{ width: 60, height: 32 }} resizeMode="contain" />
                ) : (
                  <Text style={[styles.brandName, { color: b.color }]}>{b.name}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  scroll: { paddingBottom: 96 },

  // ── Header gradient wrapper ──
  headerGradient: {
    paddingBottom: spacing.lg,
  },

  // ── Top bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.neutral.black,
  },

  // Avatar: white ring border wrapping the gradient pill
  avatarRing: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
  avatarGrad: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },

  // ── Address banner ──
  addressBannerWrapper: {
    marginHorizontal: spacing.xl,
    borderRadius: radii.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  addressBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  addressLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  addressBannerText: { ...typography.bodySmMedium, color: colors.primary.green600 },

  // ── Carousel ──
  carouselSection: { marginTop: spacing.xl, marginBottom: spacing.xl },
  bannerCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 170,
    overflow: 'hidden',
  },
  bannerContent: { flex: 1, paddingRight: spacing.sm },
  bannerBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(46,125,50,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.primary.green700,
    lineHeight: 24,
  },
  bannerSub: {
    ...typography.caption,
    color: colors.neutral.gray600,
    marginTop: 6,
    lineHeight: 16,
  },
  bannerImage: { width: 120, height: 120 },
  dots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.gray200,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary.green600,
    borderRadius: 4,
  },

  // ── Schedule CTA ──
  scheduleRow: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['3xl'],
    alignItems: 'center',
  },
  scheduleGlowRing: {
    borderWidth: 2,
    borderColor: 'rgba(46,125,50,0.3)',
    borderRadius: 50,
    padding: 3,
    alignSelf: 'stretch',
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.black,
    borderRadius: 50,
    height: 56,
    gap: spacing.md,
  },
  scheduleBtnText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.neutral.white,
  },
  schedulePlus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.green600,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Impact counter ──
  impactSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  leafCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary.green50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  impactNumber: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.neutral.black,
    textAlign: 'center',
  },
  impactUnit: { fontSize: 22, fontWeight: '400' as const },
  impactSub: {
    ...typography.bodySm,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // ── Brand logos ──
  brandsSection: { marginBottom: spacing.lg },
  brandsTitle: {
    ...typography.caption,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: 0.4,
  },
  brandsRow: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  brandChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '700' as const,
    textAlign: 'center',
    lineHeight: 16,
  },
});
