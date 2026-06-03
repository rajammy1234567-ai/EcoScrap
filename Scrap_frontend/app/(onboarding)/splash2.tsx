import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Header } from '../../src/components/shared/Header';
import { colors, radii, spacing, typography } from '../../src/theme';

const CATEGORIES = [
  { name: 'Paper', emoji: '📰', desc: 'Newspapers, cardboard, books' },
  { name: 'Plastic', emoji: '♻️', desc: 'Bottles, containers, PVC' },
  { name: 'Metal', emoji: '🔧', desc: 'Iron, copper, steel, aluminium' },
  { name: 'E-Waste', emoji: '💻', desc: 'Laptops, phones, appliances' },
  { name: 'Clothes', emoji: '👕', desc: 'Old garments, fabric, jute' },
  { name: 'Glass', emoji: '🍾', desc: 'Bottles, glassware' },
];

export default function Splash2Screen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <Header showBack title="" />
      <View style={styles.header}>
        <Text style={styles.title}>We accept all scrap</Text>
        <Text style={styles.subtitle}>Schedule a free pickup from your doorstep and earn cash instantly</Text>
      </View>

      <FlatList
        data={CATEGORIES}
        numColumns={2}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.grid}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.catName}>{item.name}</Text>
            <Text style={styles.catDesc}>{item.desc}</Text>
          </View>
        )}
      />

      <View style={styles.cta}>
        <Button
          label="Continue"
          onPress={() => router.push('/(onboarding)/permissions')}
          variant="primaryGreen"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  title: { ...typography.h1, color: colors.neutral.black },
  subtitle: { ...typography.body, color: colors.neutral.gray600, marginTop: spacing.sm },
  grid: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  card: {
    flex: 1,
    margin: spacing.sm,
    backgroundColor: colors.primary.green50,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'flex-start',
    minHeight: 110,
  },
  emoji: { fontSize: 32, marginBottom: spacing.sm },
  catName: { ...typography.bodySmMedium, color: colors.neutral.black, marginBottom: 2 },
  catDesc: { ...typography.caption, color: colors.neutral.gray600 },
  cta: { padding: spacing.xl, paddingTop: spacing.md },
});
