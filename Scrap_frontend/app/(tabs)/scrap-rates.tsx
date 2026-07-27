import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { scrapService } from '../../src/services/scrap';
import { ScrapIcon } from '../../src/components/ui/ScrapIcon';
import { useTabBarInset } from '../../src/hooks/useTabBarInset';
import { colors, spacing, typography, radii, shadows, layout } from '../../src/theme';

type RateItem = {
  name: string;
  rate_per_kg: number;
  unit?: string;
  image_url?: string | null;
};

type RateSection = {
  title: string;
  data: RateItem[];
};

const { width: SCREEN_W } = Dimensions.get('window');
/** Horizontal rate card width */
const CARD_W = Math.min(158, SCREEN_W * 0.42);

const FALLBACK: RateSection[] = [
  {
    title: 'IT-E Waste',
    data: [
      { name: 'CRT Monitor', rate_per_kg: 150, unit: 'Unit' },
      { name: 'Printer / Scanner / LCD TV / LED TV', rate_per_kg: 20, unit: 'Kg' },
      { name: 'CRT TV', rate_per_kg: 200, unit: 'Unit' },
      { name: 'Laptop', rate_per_kg: 500, unit: 'Unit' },
      { name: 'Computer CPU', rate_per_kg: 400, unit: 'Unit' },
    ],
  },
  {
    title: 'Paper',
    data: [
      { name: 'Newspaper', rate_per_kg: 14, unit: 'Kg' },
      { name: 'Cardboard', rate_per_kg: 7, unit: 'Kg' },
      { name: 'Books / Magazines', rate_per_kg: 10, unit: 'Kg' },
    ],
  },
  {
    title: 'Metal',
    data: [
      { name: 'Iron / Steel', rate_per_kg: 17, unit: 'Kg' },
      { name: 'Copper Wire', rate_per_kg: 450, unit: 'Kg' },
      { name: 'Aluminium', rate_per_kg: 120, unit: 'Kg' },
    ],
  },
  {
    title: 'Large Appliances',
    data: [
      { name: 'Refrigerator / Fridge', rate_per_kg: 1000, unit: 'Unit' },
      { name: 'Washing Machine', rate_per_kg: 800, unit: 'Unit' },
      { name: 'AC (Air Conditioner)', rate_per_kg: 2000, unit: 'Unit' },
      { name: 'Cooker / Gas Stove', rate_per_kg: 50, unit: 'Unit' },
    ],
  },
  {
    title: 'Clothes',
    data: [{ name: 'Old Clothes / T-Shirts', rate_per_kg: 5, unit: 'Kg' }],
  },
  {
    title: 'Glass',
    data: [{ name: 'Glass Bottles', rate_per_kg: 2, unit: 'Kg' }],
  },
];

const FEATURED = [
  { name: 'AC (Air Conditioner)', rate: 2000, unit: 'Unit', tag: 'Top' },
  { name: 'Fridge', rate: 1000, unit: 'Unit', tag: 'Hot' },
  { name: 'Washing Machine', rate: 800, unit: 'Unit', tag: 'Deal' },
  { name: 'Iron / Steel', rate: 28, unit: 'Kg', tag: 'Daily' },
];

const TICKER_ITEMS = [
  { label: 'Iron', rate: '₹17/kg' },
  { label: 'AC', rate: '₹2000/u' },
  { label: 'Fridge', rate: '₹1000/u' },
  { label: 'Washer', rate: '₹800/u' },
  { label: 'Copper', rate: '₹450/kg' },
  { label: 'Laptop', rate: '₹500/u' },
  { label: 'Newspaper', rate: '₹14/kg' },
];

const CAT_ICON: Record<string, string> = {
  'IT-E Waste': 'monitor',
  Paper: 'file-text',
  Metal: 'tool',
  'Large Appliances': 'home',
  Clothes: 'shopping-bag',
  Glass: 'droplet',
};

/* ─── Floating / looping header graphics ─── */
function FloatingOrbs() {
  const a = useSharedValue(0);
  const b = useSharedValue(0);
  const c = useSharedValue(0);

  useEffect(() => {
    a.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    b.value = withDelay(
      600,
      withRepeat(
        withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
    c.value = withDelay(
      1200,
      withRepeat(
        withTiming(1, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
  }, [a, b, c]);

  const sA = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(a.value, [0, 1], [0, -14]) },
      { translateX: interpolate(a.value, [0, 1], [0, 8]) },
      { scale: interpolate(a.value, [0, 1], [1, 1.12]) },
    ],
    opacity: interpolate(a.value, [0, 1], [0.25, 0.45]),
  }));
  const sB = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(b.value, [0, 1], [0, 12]) },
      { translateX: interpolate(b.value, [0, 1], [0, -10]) },
    ],
    opacity: interpolate(b.value, [0, 1], [0.18, 0.35]),
  }));
  const sC = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(c.value, [0, 1], [6, -10]) },
      { scale: interpolate(c.value, [0, 1], [0.9, 1.15]) },
    ],
    opacity: interpolate(c.value, [0, 1], [0.2, 0.4]),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.orb, styles.orb1, sA]} />
      <Animated.View style={[styles.orb, styles.orb2, sB]} />
      <Animated.View style={[styles.orb, styles.orb3, sC]} />
    </View>
  );
}

function LivePulse() {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 900, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.8]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.55, 0]),
  }));
  const core = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.08]) }],
  }));

  return (
    <View style={styles.liveWrap}>
      <Animated.View style={[styles.liveRing, ring]} />
      <Animated.View style={[styles.liveDot, core]} />
      <Text style={styles.liveText}>LIVE</Text>
    </View>
  );
}

function AutoTicker() {
  const x = useSharedValue(0);
  const row = [...TICKER_ITEMS, ...TICKER_ITEMS];
  const itemW = 118;
  const totalW = TICKER_ITEMS.length * itemW;

  useEffect(() => {
    x.value = 0;
    x.value = withRepeat(
      withTiming(-totalW, {
        duration: totalW * 28,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [x, totalW]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <View style={styles.tickerClip}>
      <Animated.View style={[styles.tickerRow, style]}>
        {row.map((t, i) => (
          <View key={`${t.label}-${i}`} style={styles.tickerChip}>
            <Feather name="trending-up" size={11} color={colors.primary.green200} />
            <Text style={styles.tickerLabel}>{t.label}</Text>
            <Text style={styles.tickerRate}>{t.rate}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

function FloatingIcons() {
  const r1 = useSharedValue(0);
  const r2 = useSharedValue(0);
  const r3 = useSharedValue(0);

  useEffect(() => {
    r1.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.linear }),
      -1,
      false,
    );
    r2.value = withDelay(
      400,
      withRepeat(
        withTiming(1, { duration: 7500, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    r3.value = withDelay(
      900,
      withRepeat(
        withTiming(1, { duration: 5000, easing: Easing.linear }),
        -1,
        false,
      ),
    );
  }, [r1, r2, r3]);

  const i1 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(r1.value, [0, 0.5, 1], [0, -10, 0]) },
      { rotate: `${interpolate(r1.value, [0, 1], [0, 360])}deg` },
    ],
  }));
  const i2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(r2.value, [0, 0.5, 1], [4, -8, 4]) },
      { rotate: `${interpolate(r2.value, [0, 1], [0, -360])}deg` },
    ],
  }));
  const i3 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(r3.value, [0, 0.5, 1], [-2, 10, -2]) },
      { scale: interpolate(r3.value, [0, 0.5, 1], [1, 1.15, 1]) },
    ],
  }));

  return (
    <View style={styles.floatIcons} pointerEvents="none">
      <Animated.View style={[styles.floatIconBubble, styles.floatPos1, i1]}>
        <Feather name="refresh-cw" size={16} color={colors.neutral.white} />
      </Animated.View>
      <Animated.View style={[styles.floatIconBubble, styles.floatPos2, i2]}>
        <Feather name="dollar-sign" size={14} color={colors.neutral.white} />
      </Animated.View>
      <Animated.View style={[styles.floatIconBubble, styles.floatPos3, i3]}>
        <Feather name="globe" size={14} color={colors.neutral.white} />
      </Animated.View>
    </View>
  );
}

export default function ScrapRatesScreen() {
  const router = useRouter();
  const [allSections, setAllSections] = useState<RateSection[]>(FALLBACK);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    scrapService
      .getRateCard()
      .then((r) => {
        const mapped = r.data.categories?.map((c: any) => ({
          title: c.name,
          data: c.items,
        }));
        if (mapped?.length > 0) setAllSections(mapped);
      })
      .catch(() => {});
  }, []);

  const filters = useMemo(
    () => ['ALL', ...allSections.map((s) => s.title)],
    [allSections],
  );

  const totalItems = useMemo(
    () => allSections.reduce((n, s) => n + s.data.length, 0),
    [allSections],
  );

  const filteredSections = useMemo(
    () =>
      allSections
        .filter((s) => activeFilter === 'ALL' || s.title === activeFilter)
        .map((s) => ({
          ...s,
          data: search
            ? s.data.filter((i) =>
                i.name.toLowerCase().includes(search.toLowerCase()),
              )
            : s.data,
        }))
        .filter((s) => s.data.length > 0),
    [allSections, activeFilter, search],
  );

  const bottomInset = useTabBarInset();

  const ListHeader = useCallback(
    () => (
      <View style={styles.listHeader}>
        {/* Featured — same green theme only */}
        <View style={styles.featuredBlock}>
          <View style={styles.featuredHead}>
            <Text style={styles.featuredTitle}>Featured rates</Text>
            <Text style={styles.featuredSub}>Best prices right now</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredRow}
          >
            {FEATURED.map((f) => (
              <View key={f.name} style={styles.featuredTile}>
                <LinearGradient
                  colors={[colors.primary.green700, colors.primary.green500]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featuredGrad}
                >
                  <View style={styles.featuredTag}>
                    <Text style={styles.featuredTagText}>{f.tag}</Text>
                  </View>
                  <View style={styles.featuredIconBubble}>
                    <ScrapIcon
                      name={f.name}
                      variant="compact"
                      size={18}
                      color={colors.neutral.white}
                    />
                  </View>
                  <Text style={styles.featuredName} numberOfLines={2}>
                    {f.name}
                  </Text>
                  <Text style={styles.featuredRate}>
                    ₹{f.rate}
                    <Text style={styles.featuredUnit}>/{f.unit}</Text>
                  </Text>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Search */}
        <View style={styles.searchCard}>
          <View style={styles.searchIconWrap}>
            <Feather name="search" size={16} color={colors.primary.green600} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search iron, fridge, AC, laptop..."
            placeholderTextColor={colors.neutral.gray400}
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <Pressable onPress={() => setSearch('')} hitSlop={8} style={styles.clearBtn}>
              <Feather name="x" size={16} color={colors.neutral.gray600} />
            </Pressable>
          )}
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {filters.map((f) => {
            const active = activeFilter === f;
            return (
              <Pressable
                key={f}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                {f !== 'ALL' && (
                  <Feather
                    name={(CAT_ICON[f] as any) || 'tag'}
                    size={12}
                    color={active ? colors.neutral.white : colors.primary.green600}
                  />
                )}
                <Text
                  style={[styles.filterLabel, active && styles.filterLabelActive]}
                >
                  {f === 'ALL' ? 'All rates' : f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    ),
    [search, filters, activeFilter],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={[...layout.headerGradient]} style={styles.header}>
        <FloatingOrbs />
        <FloatingIcons />

        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <View style={styles.eyebrowRow}>
              <LivePulse />
              <Text style={styles.headerEyebrow}>MARKET RATES</Text>
            </View>
            <Text style={styles.headerTitle}>Scrap Rates</Text>
            <Text style={styles.headerSub}>
              Transparent pricing · Updated daily
            </Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statNum}>{totalItems}+</Text>
            <Text style={styles.statLabel}>items</Text>
          </View>
        </View>

        {/* Auto-scrolling rate ticker */}
        <AutoTicker />

        <Pressable
          style={styles.headerCta}
          onPress={() => router.push('/(home)/select-items')}
        >
          <View style={styles.headerCtaIcon}>
            <Feather name="truck" size={16} color={colors.primary.green700} />
          </View>
          <Text style={styles.headerCtaText}>Schedule free pickup</Text>
          <Feather name="arrow-right" size={18} color={colors.neutral.white} />
        </Pressable>
      </LinearGradient>

      <FlatList
        style={styles.list}
        data={filteredSections}
        keyExtractor={(section) => section.title}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomInset + spacing.lg },
          filteredSections.length === 0 && styles.emptyListContent,
        ]}
        ListHeaderComponent={ListHeader}
        renderItem={({ item: section }) => (
          <View style={styles.categoryBlock}>
            {/* Category header */}
            <View style={styles.sectionHeadWrap}>
              <View style={styles.sectionLeft}>
                <View style={styles.sectionIcon}>
                  <Feather
                    name={(CAT_ICON[section.title] as any) || 'grid'}
                    size={14}
                    color={colors.primary.green700}
                  />
                </View>
                <View>
                  <Text style={styles.sectionHead}>{section.title}</Text>
                  <Text style={styles.sectionSub}>
                    Swipe to see all rates
                  </Text>
                </View>
              </View>
              <View style={styles.sectionCountPill}>
                <Text style={styles.sectionCount}>{section.data.length}</Text>
              </View>
            </View>

            {/* Horizontal rate cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hCardsRow}
              decelerationRate="fast"
              snapToInterval={CARD_W + spacing.md}
              snapToAlignment="start"
            >
              {section.data.map((rateItem, idx) => (
                <View
                  key={`${section.title}-${rateItem.name}-${idx}`}
                  style={styles.hCard}
                >
                  <LinearGradient
                    colors={[colors.primary.green50, colors.neutral.white]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.hCardInner}
                  >
                    <View style={styles.hCardTop}>
                      {rateItem.image_url ? (
                        <Image
                          source={{ uri: rateItem.image_url }}
                          style={styles.hCardPhoto}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.hCardIcon}>
                          <ScrapIcon
                            name={rateItem.name}
                            variant="filled"
                            size={26}
                          />
                        </View>
                      )}
                      <View style={styles.hCardBadge}>
                        <Text style={styles.hCardBadgeText}>
                          {rateItem.unit ?? 'Kg'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.hCardName} numberOfLines={2}>
                      {rateItem.name}
                    </Text>

                    <View style={styles.hCardPriceRow}>
                      <Text style={styles.hCardCurrency}>₹</Text>
                      <Text style={styles.hCardPrice}>
                        {rateItem.rate_per_kg}
                      </Text>
                    </View>
                    <Text style={styles.hCardPer}>
                      per {rateItem.unit ?? 'Kg'}
                    </Text>

                    <View style={styles.hCardFoot}>
                      <Feather
                        name="truck"
                        size={11}
                        color={colors.primary.green600}
                      />
                      <Text style={styles.hCardFootText}>Free pickup</Text>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.noResults}>
            <View style={styles.noResultsIcon}>
              <Feather name="search" size={28} color={colors.neutral.gray400} />
            </View>
            <Text style={styles.noResultsTitle}>No matches</Text>
            <Text style={styles.noResultsText}>
              {search
                ? `Nothing found for "${search}"`
                : 'No rates available right now'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: layout.screenBg },

  /* Header + motion graphics */
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.neutral.white,
  },
  orb1: { width: 120, height: 120, top: -30, right: -20 },
  orb2: { width: 80, height: 80, bottom: 20, left: -24 },
  orb3: { width: 56, height: 56, top: 40, left: SCREEN_W * 0.4 },

  floatIcons: {
    ...StyleSheet.absoluteFillObject,
  },
  floatIconBubble: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatPos1: { top: 18, right: 72 },
  floatPos2: { top: 70, right: 28 },
  floatPos3: { bottom: 88, right: 56 },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    zIndex: 2,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  liveWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveRing: {
    position: 'absolute',
    left: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#81C784',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A5D6A7',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.8,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.neutral.white,
    letterSpacing: -0.5,
  },
  headerSub: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 4,
  },
  statPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minWidth: 64,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 2,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.neutral.white,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600' as const,
  },

  tickerClip: {
    marginTop: spacing.lg,
    height: 36,
    overflow: 'hidden',
    zIndex: 2,
  },
  tickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
  },
  tickerChip: {
    width: 110,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  tickerLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.85)',
  },
  tickerRate: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: colors.primary.green100,
  },

  headerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: radii.xl,
    height: 52,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 2,
  },
  headerCtaIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCtaText: {
    flex: 1,
    ...typography.bodySmMedium,
    fontWeight: '700' as const,
    color: colors.neutral.white,
  },

  list: {
    flex: 1,
    marginTop: -spacing.xl,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
  },
  emptyListContent: { flexGrow: 1 },
  listHeader: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },

  featuredBlock: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl + 4,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    ...shadows.md,
  },
  featuredHead: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: colors.neutral.black,
  },
  featuredSub: {
    ...typography.caption,
    color: colors.neutral.gray400,
    marginTop: 2,
  },
  featuredRow: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  featuredTile: {
    width: 132,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  featuredGrad: {
    padding: spacing.md,
    minHeight: 148,
    justifyContent: 'space-between',
  },
  featuredTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  featuredTagText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: colors.neutral.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  featuredName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 16,
  },
  featuredRate: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.neutral.white,
    marginTop: 4,
  },
  featuredUnit: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.8)',
  },

  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray100,
    ...shadows.sm,
  },
  searchIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary.green50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    ...typography.bodySm,
    color: colors.neutral.black,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filtersRow: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.neutral.white,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
  },
  filterChipActive: {
    backgroundColor: colors.primary.green700,
    borderColor: colors.primary.green700,
  },
  filterLabel: {
    ...typography.caption,
    fontWeight: '700' as const,
    color: colors.neutral.gray600,
  },
  filterLabelActive: { color: colors.neutral.white },

  categoryBlock: {
    marginBottom: spacing.md,
  },
  sectionHeadWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHead: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: colors.neutral.black,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.neutral.gray400,
    marginTop: 1,
    fontWeight: '500' as const,
  },
  sectionCountPill: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.neutral.gray600,
  },

  /* Horizontal rate cards */
  hCardsRow: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
    paddingRight: spacing.lg,
  },
  hCard: {
    width: CARD_W,
    borderRadius: radii.xl + 2,
    backgroundColor: colors.neutral.white,
    borderWidth: 1.5,
    borderColor: colors.primary.green100,
    ...shadows.md,
    overflow: 'hidden',
  },
  hCardInner: {
    padding: spacing.md,
    minHeight: 188,
    flex: 1,
    justifyContent: 'space-between',
  },
  hCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  hCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary.green100,
    ...shadows.sm,
  },
  hCardPhoto: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.neutral.gray100,
    borderWidth: 1.5,
    borderColor: colors.primary.green100,
  },
  hCardBadge: {
    backgroundColor: colors.primary.green600,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  hCardBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: colors.neutral.white,
    textTransform: 'uppercase' as const,
  },
  hCardName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.neutral.black,
    lineHeight: 18,
    minHeight: 36,
  },
  hCardPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  hCardCurrency: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: colors.primary.green600,
    marginTop: 4,
    marginRight: 1,
  },
  hCardPrice: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.primary.green700,
    letterSpacing: -0.5,
  },
  hCardPer: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.neutral.gray400,
    marginTop: 2,
  },
  hCardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.primary.green100,
  },
  hCardFootText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.primary.green600,
  },

  noResults: {
    alignItems: 'center',
    paddingTop: spacing['4xl'],
    gap: spacing.sm,
  },
  noResultsIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: colors.neutral.black,
  },
  noResultsText: {
    ...typography.bodySm,
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
});
