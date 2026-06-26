import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SectionList, TextInput,
  Pressable, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { scrapService } from '../../src/services/scrap';
import { ScrapIcon } from '../../src/components/ui/ScrapIcon';
import { SectionHeader } from '../../src/components/layout/SectionHeader';
import { useTabBarInset } from '../../src/hooks/useTabBarInset';
import { colors, spacing, typography, radii, shadows, layout } from '../../src/theme';

const FALLBACK = [
  { title: 'IT-E Waste', data: [
    { name: 'CRT Monitor', rate_per_kg: 150, unit: 'Unit' },
    { name: 'Printer / Scanner / LCD TV / LED TV', rate_per_kg: 20, unit: 'Kg' },
    { name: 'CRT TV', rate_per_kg: 200, unit: 'Unit' },
    { name: 'Laptop', rate_per_kg: 500, unit: 'Unit' },
    { name: 'Computer CPU', rate_per_kg: 400, unit: 'Unit' },
  ]},
  { title: 'Paper', data: [
    { name: 'Newspaper', rate_per_kg: 14, unit: 'Kg' },
    { name: 'Cardboard', rate_per_kg: 7, unit: 'Kg' },
    { name: 'Books / Magazines', rate_per_kg: 10, unit: 'Kg' },
  ]},
  { title: 'Metal', data: [
    { name: 'Iron / Steel', rate_per_kg: 28, unit: 'Kg' },
    { name: 'Copper Wire', rate_per_kg: 450, unit: 'Kg' },
    { name: 'Aluminium', rate_per_kg: 120, unit: 'Kg' },
  ]},
  { title: 'Large Appliances', data: [
    { name: 'Refrigerator / Fridge', rate_per_kg: 200, unit: 'Unit' },
    { name: 'Washing Machine', rate_per_kg: 300, unit: 'Unit' },
    { name: 'AC (Air Conditioner)', rate_per_kg: 500, unit: 'Unit' },
    { name: 'Cooker / Gas Stove', rate_per_kg: 50, unit: 'Unit' },
  ]},
  { title: 'Clothes', data: [
    { name: 'Old Clothes / T-Shirts', rate_per_kg: 5, unit: 'Kg' },
  ]},
  { title: 'Glass', data: [
    { name: 'Glass Bottles', rate_per_kg: 2, unit: 'Kg' },
  ]},
];

const FEATURED = [
  { name: 'Copper Wire', rate: 450, unit: 'Kg', tag: 'Highest' },
  { name: 'Laptop', rate: 500, unit: 'Unit', tag: 'Popular' },
  { name: 'Newspaper', rate: 14, unit: 'Kg', tag: 'Daily' },
];

export default function ScrapRatesScreen() {
  const router = useRouter();
  const [allSections, setAllSections] = useState(FALLBACK);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    scrapService.getRateCard()
      .then((r) => {
        const mapped = r.data.categories?.map((c: any) => ({ title: c.name, data: c.items }));
        if (mapped?.length > 0) setAllSections(mapped);
      })
      .catch(() => {});
  }, []);

  const filters = ['ALL', ...allSections.map((s) => s.title)];
  const totalItems = allSections.reduce((n, s) => n + s.data.length, 0);

  const filteredSections = allSections
    .filter((s) => activeFilter === 'ALL' || s.title === activeFilter)
    .map((s) => ({
      ...s,
      data: search
        ? s.data.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()))
        : s.data,
    }))
    .filter((s) => s.data.length > 0);

  const bottomInset = useTabBarInset();

  const ListHeader = useCallback(() => (
    <View style={styles.listHeader}>
      <View style={styles.featuredCard}>
        <SectionHeader title="Featured rates" subtitle="Best prices right now" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredRow}
        >
          {FEATURED.map((f) => (
            <View key={f.name} style={styles.featuredTile}>
              <View style={styles.featuredTag}>
                <Text style={styles.featuredTagText}>{f.tag}</Text>
              </View>
              <ScrapIcon name={f.name} variant="compact" size={16} />
              <Text style={styles.featuredName} numberOfLines={1}>{f.name}</Text>
              <Text style={styles.featuredRate}>
                ₹{f.rate}<Text style={styles.featuredUnit}>/{f.unit}</Text>
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.searchRow}>
        <Feather name="search" size={18} color={colors.neutral.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search newspaper, laptop, copper..."
          placeholderTextColor={colors.neutral.gray400}
          value={search}
          onChangeText={setSearch}
        />
        {!!search && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Feather name="x-circle" size={18} color={colors.neutral.gray400} />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {filters.map((f) => (
          <Pressable
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterLabel, activeFilter === f && styles.filterLabelActive]}>
              {f}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  ), [search, filters, activeFilter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={[...layout.headerGradient]} style={styles.header}>
        <Text style={styles.headerTitle}>Scrap Rates</Text>
        <Text style={styles.headerSub}>{totalItems}+ items · Live market prices</Text>

        <Pressable
          style={styles.headerCta}
          onPress={() => router.push('/(home)/select-items')}
        >
          <Feather name="plus" size={18} color={colors.neutral.white} />
          <Text style={styles.headerCtaText}>Schedule Pickup</Text>
        </Pressable>
      </LinearGradient>

      <SectionList
        style={styles.list}
        sections={filteredSections}
        keyExtractor={(item) => item.name}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomInset },
          filteredSections.length === 0 && styles.emptyListContent,
        ]}
        stickySectionHeadersEnabled
        ListHeaderComponent={ListHeader}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeadWrap}>
            <Text style={styles.sectionHead}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length} items</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <ScrapIcon name={item.name} variant="filled" size={24} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemHint}>Doorstep pickup available</Text>
            </View>
            <View style={styles.rateBadge}>
              <Text style={styles.itemRate}>₹{item.rate_per_kg}</Text>
              <Text style={styles.itemUnit}>/{item.unit ?? 'Kg'}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.noResults}>
            <Feather name="search" size={32} color={colors.neutral.gray400} />
            <Text style={styles.noResultsText}>
              {search ? `No items found for "${search}"` : 'No rates available'}
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.neutral.white,
  },
  headerSub: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  headerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral.black,
    borderRadius: radii.lg,
    height: 48,
    marginTop: spacing.lg,
  },
  headerCtaText: {
    ...typography.bodySmMedium,
    fontWeight: '700' as const,
    color: colors.neutral.white,
  },
  list: {
    flex: 1,
    marginTop: -spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  listHeader: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  featuredCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  featuredRow: { gap: spacing.sm },
  featuredTile: {
    width: 120,
    backgroundColor: colors.primary.green50,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary.green100,
    alignItems: 'center',
    gap: 4,
  },
  featuredTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.green600,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  featuredTagText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: colors.neutral.white,
    textTransform: 'uppercase',
  },
  featuredName: {
    ...typography.caption,
    fontWeight: '600' as const,
    color: colors.neutral.black,
    textAlign: 'center',
  },
  featuredRate: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: colors.primary.green700,
  },
  featuredUnit: { fontSize: 11, fontWeight: '500' as const },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    height: 50,
    ...shadows.sm,
  },
  searchInput: { flex: 1, ...typography.bodySm, color: colors.neutral.black },
  filtersRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  filterChipActive: {
    backgroundColor: colors.neutral.black,
    borderColor: colors.neutral.black,
  },
  filterLabel: { ...typography.caption, fontWeight: '600' as const, color: colors.neutral.gray600 },
  filterLabelActive: { color: colors.neutral.white },
  sectionHeadWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: layout.screenBg,
    paddingVertical: spacing.sm,
    paddingTop: spacing.md,
  },
  sectionHead: {
    ...typography.bodySmMedium,
    fontWeight: '700' as const,
    color: colors.neutral.black,
  },
  sectionCount: { ...typography.caption, color: colors.neutral.gray400 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    marginBottom: spacing.sm,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { ...typography.bodySmMedium, color: colors.neutral.black, lineHeight: 20 },
  itemHint: { ...typography.caption, color: colors.neutral.gray400, marginTop: 2 },
  rateBadge: { alignItems: 'flex-end', flexShrink: 0 },
  itemRate: { fontSize: 16, fontWeight: '800' as const, color: colors.primary.green700 },
  itemUnit: { ...typography.caption, color: colors.neutral.gray400 },
  noResults: { alignItems: 'center', paddingTop: spacing['2xl'], gap: spacing.md },
  noResultsText: { ...typography.bodySm, color: colors.neutral.gray600 },
});