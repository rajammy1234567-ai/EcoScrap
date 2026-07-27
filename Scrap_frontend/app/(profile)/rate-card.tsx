import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/shared/Header';
import { scrapService } from '../../src/services/scrap';
import { colors, spacing, typography } from '../../src/theme';

const FALLBACK_SECTIONS = [
  {
    title: 'Paper',
    data: [
      { name: 'Newspaper', rate_per_kg: 14, unit: 'kg' },
      { name: 'Cardboard / Box', rate_per_kg: 10, unit: 'kg' },
      { name: 'Books / Notebooks', rate_per_kg: 12, unit: 'kg' },
      { name: 'Office Paper', rate_per_kg: 14, unit: 'kg' },
    ],
  },
  {
    title: 'Plastic',
    data: [
      { name: 'PET Bottles (Cold Drink)', rate_per_kg: 9, unit: 'kg' },
      { name: 'Hard Plastic', rate_per_kg: 8, unit: 'kg' },
      { name: 'Plastic Drums', rate_per_kg: 6, unit: 'kg' },
      { name: 'Milk Pouch', rate_per_kg: 6, unit: 'kg' },
    ],
  },
  {
    title: 'Metal',
    data: [
      { name: 'Iron / Steel', rate_per_kg: 17, unit: 'kg' },
      { name: 'Copper', rate_per_kg: 420, unit: 'kg' },
      { name: 'Aluminium', rate_per_kg: 80, unit: 'kg' },
      { name: 'Brass', rate_per_kg: 250, unit: 'kg' },
    ],
  },
  {
    title: 'E-Waste',
    data: [
      { name: 'Laptop', rate_per_kg: 300, unit: 'kg' },
      { name: 'Mobile Phone', rate_per_kg: 400, unit: 'kg' },
      { name: 'CPU / Desktop', rate_per_kg: 20, unit: 'kg' },
      { name: 'Battery (UPS)', rate_per_kg: 30, unit: 'kg' },
    ],
  },
  {
    title: 'Large Appliances',
    data: [
      { name: 'Refrigerator / Fridge', rate_per_kg: 1000, unit: 'unit' },
      { name: 'Washing Machine', rate_per_kg: 800, unit: 'unit' },
      { name: 'AC (Air Conditioner)', rate_per_kg: 2000, unit: 'unit' },
    ],
  },
  {
    title: 'Clothes',
    data: [
      { name: 'Cotton Clothes', rate_per_kg: 15, unit: 'kg' },
      { name: 'Mixed Clothes', rate_per_kg: 10, unit: 'kg' },
    ],
  },
  {
    title: 'Glass',
    data: [
      { name: 'Glass Bottles', rate_per_kg: 1, unit: 'kg' },
      { name: 'Glassware', rate_per_kg: 1, unit: 'kg' },
    ],
  },
];

export default function RateCardScreen() {
  const [sections, setSections] = useState(FALLBACK_SECTIONS);

  useEffect(() => {
    scrapService.getRateCard()
      .then((r) => {
        const live = r.data.categories.map((c: any) => ({ title: c.name, data: c.items }));
        if (live.length > 0) setSections(live);
      })
      .catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Rate Card" />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.rate}>₹{item.rate_per_kg}/{item.unit}</Text>
          </View>
        )}
        ListFooterComponent={
          <Text style={styles.disclaimer}>* Rates are indicative and may vary based on actual condition and weight at pickup.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  sectionHeaderWrap: { backgroundColor: colors.neutral.white, paddingTop: spacing.lg, paddingBottom: spacing.sm, borderBottomWidth: 2, borderBottomColor: colors.primary.green600 },
  sectionHeader: { ...typography.h3, color: colors.primary.green700 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.neutral.gray100 },
  itemName: { ...typography.bodySm, color: colors.neutral.black, flex: 1 },
  rate: { ...typography.bodySmMedium, color: colors.primary.green600 },
  disclaimer: { ...typography.caption, color: colors.neutral.gray400, textAlign: 'center', marginTop: 24, paddingHorizontal: 16 },
});
