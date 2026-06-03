import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SectionList, TextInput,
  Pressable, Image, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { scrapService } from '../../src/services/scrap';
import { colors, spacing, typography, radii } from '../../src/theme';

// ─── 3D icon map ─────────────────────────────────────────────────────────────
const ICONS: Record<string, any> = {
  newspaper:   require('../../assets/images/brands/Untitled design/newspaper.png'),
  cardboard:   require('../../assets/images/brands/Untitled design/cardboard.png'),
  metal:       require('../../assets/images/brands/Untitled design/metal.png'),
  laptop:      require('../../assets/images/brands/Untitled design/laptop.png'),
  tv:          require('../../assets/images/brands/Untitled design/tv.png'),
  'old tv':    require('../../assets/images/brands/Untitled design/old_tv.png'),
  'crt tv':    require('../../assets/images/brands/Untitled design/old_tv.png'),
  'crt monitor': require('../../assets/images/brands/Untitled design/old_tv.png'),
  fridge:      require('../../assets/images/brands/Untitled design/fridge.png'),
  ac:          require('../../assets/images/brands/Untitled design/ac.png'),
  battery:     require('../../assets/images/brands/Untitled design/battery.png'),
  'washing machine': require('../../assets/images/brands/Untitled design/washing machine.png'),
  cpu:         require('../../assets/images/brands/Untitled design/cpu.png'),
  computer:    require('../../assets/images/brands/Untitled design/cpu.png'),
  printer:     require('../../assets/images/brands/Untitled design/printer.png'),
  glass:       require('../../assets/images/brands/Untitled design/glass.png'),
  bike:        require('../../assets/images/brands/Untitled design/bike.png'),
  car:         require('../../assets/images/brands/Untitled design/car.png'),
  cooker:      require('../../assets/images/brands/Untitled design/cooker.png'),
  pipe:        require('../../assets/images/brands/Untitled design/pipe.png'),
  radio:       require('../../assets/images/brands/Untitled design/radio.png'),
  shirt:       require('../../assets/images/brands/Untitled design/tshirt.png'),
  clothes:     require('../../assets/images/brands/Untitled design/tshirt.png'),
  gym:         require('../../assets/images/brands/Untitled design/gym_equipments.png'),
  scooter:     require('../../assets/images/brands/Untitled design/scooter.png'),
  tablet:      require('../../assets/images/brands/Untitled design/tab.png'),
};

function getIcon(name: string): any | null {
  const lower = name.toLowerCase();
  for (const key of Object.keys(ICONS)) {
    if (lower.includes(key)) return ICONS[key];
  }
  return null;
}

// ─── Fallback data ────────────────────────────────────────────────────────────
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

  const filters = ['ALL', ...allSections.map(s => s.title)];

  const filteredSections = allSections
    .filter(s => activeFilter === 'ALL' || s.title === activeFilter)
    .map(s => ({
      ...s,
      data: search
        ? s.data.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()))
        : s.data,
    }))
    .filter(s => s.data.length > 0);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <Text style={styles.header}>SCRAP RATES</Text>

      {/* Schedule Pickup CTA */}
      <View style={styles.ctaRow}>
        <Pressable style={styles.ctaBtn} onPress={() => router.push('/(home)/select-items')}>
          <Text style={styles.ctaBtnText}>Schedule Pickup</Text>
          <Text style={styles.ctaBtnPlus}> +</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={colors.neutral.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for items"
          placeholderTextColor={colors.neutral.gray400}
          value={search}
          onChangeText={setSearch}
        />
        {!!search && (
          <Pressable onPress={() => setSearch('')}>
            <Feather name="x" size={16} color={colors.neutral.gray400} />
          </Pressable>
        )}
      </View>

      {/* Filter chips */}
      <View style={styles.filtersWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {filters.map(f => (
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

      {/* List */}
      <SectionList
        sections={filteredSections}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHead}>{section.title.toUpperCase()}</Text>
        )}
        renderItem={({ item }) => {
          const icon = getIcon(item.name);
          return (
            <View style={styles.itemCard}>
              <View style={styles.itemIconBox}>
                {icon ? (
                  <Image source={icon} style={styles.itemIcon} resizeMode="contain" />
                ) : (
                  <Feather name="box" size={32} color={colors.neutral.gray400} />
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemRate}>
                  ₹{item.rate_per_kg}/{item.unit ?? 'Kg'}
                </Text>
              </View>
            </View>
          );
        }}
        SectionSeparatorComponent={() => <View style={{ height: 4 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.gray100 },
  header: {
    fontSize: 18, fontWeight: '700' as const, letterSpacing: 2,
    color: colors.neutral.black, textAlign: 'center',
    paddingTop: spacing.lg, paddingBottom: spacing.sm,
    backgroundColor: colors.neutral.white,
  },
  ctaRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.neutral.white },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.neutral.black, borderRadius: 50, height: 48,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '700' as const, color: colors.neutral.white },
  ctaBtnPlus: { fontSize: 18, fontWeight: '700' as const, color: colors.neutral.white },

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginHorizontal: spacing.xl, marginVertical: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg, paddingHorizontal: spacing.lg, height: 44,
    borderWidth: 1, borderColor: colors.neutral.gray200,
  },
  searchInput: { flex: 1, ...typography.bodySm, color: colors.neutral.black },

  filtersWrapper: { zIndex: 10, backgroundColor: colors.neutral.gray100 },
  filtersRow: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.md },
  filterChip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radii.pill, borderWidth: 1.5, borderColor: colors.neutral.gray200,
    backgroundColor: colors.neutral.white,
  },
  filterChipActive: {
    backgroundColor: colors.primary.green600, borderColor: colors.primary.green600,
  },
  filterLabel: { ...typography.bodySmMedium, color: colors.neutral.gray600 },
  filterLabelActive: { color: colors.neutral.white },

  list: { paddingHorizontal: spacing.xl, paddingBottom: 100 },
  sectionHead: {
    ...typography.caption, color: colors.neutral.gray400,
    fontWeight: '600' as const, letterSpacing: 1.5,
    paddingVertical: spacing.sm, marginTop: spacing.md,
  },
  itemCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg, marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1, borderColor: colors.neutral.gray100,
  },
  itemIconBox: {
    width: 72, height: 72, borderRadius: radii.md,
    backgroundColor: colors.neutral.gray100,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.lg,
  },
  itemIcon: { width: 56, height: 56 },
  itemInfo: { flex: 1 },
  itemName: { ...typography.bodySmMedium, color: colors.neutral.black, lineHeight: 20 },
  itemRate: { ...typography.bodySmMedium, color: colors.primary.green600, marginTop: 4, fontSize: 15 },
});
