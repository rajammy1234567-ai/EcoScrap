import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Header } from '../../src/components/shared/Header';
import { scrapService } from '../../src/services/scrap';
import { colors, spacing, typography, radii } from '../../src/theme';

const FALLBACK_SECTIONS = [
  {
    title: 'Metal',
    data: [
      { name: 'Iron / Steel', rate_per_kg: 28, unit: 'Kg', image_url: null as string | null },
      { name: 'Copper Wire', rate_per_kg: 450, unit: 'Kg', image_url: null },
      { name: 'Aluminium', rate_per_kg: 200, unit: 'Kg', image_url: null },
      { name: 'Brass', rate_per_kg: 400, unit: 'Kg', image_url: null },
    ],
  },
];

export default function RateCardScreen() {
  const [sections, setSections] = useState(FALLBACK_SECTIONS);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (pull = false) => {
    if (pull) setRefreshing(true);
    try {
      const r = await scrapService.getRateCard();
      const live = (r.data.categories || []).map((c: any) => ({
        title: c.name,
        data: (c.items || []).map((i: any) => ({
          name: i.name,
          rate_per_kg: Number(i.rate_per_kg ?? 0),
          unit: i.unit || 'Kg',
          image_url: i.image_url || null,
        })),
      }));
      if (live.length > 0) setSections(live);
    } catch {
      // keep fallback
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Rate Card" />
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            colors={[colors.primary.green600]}
          />
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbEmpty]} />
            )}
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.rate}>
              ₹{item.rate_per_kg}/{item.unit}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.gray50 },
  list: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  sectionHeaderWrap: {
    backgroundColor: colors.neutral.gray50,
    paddingVertical: spacing.sm,
  },
  sectionHeader: {
    ...typography.bodySmMedium,
    fontWeight: '800' as const,
    color: colors.primary.green700,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary.green50,
  },
  thumbEmpty: {
    borderWidth: 1,
    borderColor: colors.primary.green100,
  },
  itemName: { flex: 1, ...typography.bodySmMedium, color: colors.neutral.black },
  rate: { ...typography.bodySmMedium, color: colors.primary.green600, fontWeight: '800' as const },
});
