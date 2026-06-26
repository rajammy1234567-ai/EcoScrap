import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScrapItem } from '../../types';
import { ScrapIcon } from './ScrapIcon';
import { colors, radii, shadows, spacing, typography } from '../../theme';

interface Props {
  item: ScrapItem;
  selected: boolean;
  onToggle: () => void;
}

export function ScrapItemCard({ item, selected, onToggle }: Props) {
  return (
    <Pressable
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onToggle}
    >
      <ScrapIcon name={item.name} variant="filled" size={26} active={selected} />
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.rate}>₹{item.rate_per_kg}/{item.unit}</Text>
        {item.guidelines && (
          <Text style={styles.guideline}>{item.guidelines}</Text>
        )}
      </View>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <Feather name="check" size={14} color={colors.neutral.white} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.primary.green100,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardSelected: {
    borderColor: colors.primary.green600,
    backgroundColor: colors.primary.green50,
  },
  content: { flex: 1, marginLeft: spacing.md },
  name: { ...typography.bodySmMedium, color: colors.neutral.black, marginBottom: 2 },
  rate: { ...typography.bodySm, color: colors.primary.green600, fontWeight: '600' as const },
  guideline: { ...typography.caption, color: colors.functional.warning, marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: colors.primary.green600, borderColor: colors.primary.green600 },
});