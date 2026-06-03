import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii, shadows, spacing, typography } from '../../theme';

const CATEGORY_ICONS: Record<string, string> = {
  Paper: 'file-text',
  Plastic: 'package',
  Metal: 'tool',
  'E-Waste': 'monitor',
  Clothes: 'shopping-bag',
  Glass: 'aperture',
  More: 'grid',
};

interface Props {
  name: string;
  selected?: boolean;
  onPress: () => void;
}

export function CategoryCard({ name, selected, onPress }: Props) {
  const icon = (CATEGORY_ICONS[name] || 'box') as any;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.iconBox}>
        <Feather name={icon} size={32} color={selected ? colors.primary.green600 : colors.neutral.gray600} />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.md,
  },
  cardSelected: { borderColor: colors.primary.green600 },
  iconBox: { marginBottom: spacing.sm },
  label: { ...typography.bodySmMedium, color: colors.neutral.black, textAlign: 'center' },
  labelSelected: { color: colors.primary.green600 },
});
