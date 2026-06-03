import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 40,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    backgroundColor: colors.neutral.white,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary.green700,
    borderColor: colors.primary.green700,
  },
  label: {
    ...typography.bodySm,
    color: colors.neutral.gray600,
  },
  labelSelected: {
    ...typography.bodySmMedium,
    color: colors.neutral.white,
  },
});
