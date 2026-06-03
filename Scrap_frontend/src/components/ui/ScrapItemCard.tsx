import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScrapItem } from '../../types';
import { colors, radii, spacing, typography } from '../../theme';

interface Props {
  item: ScrapItem;
  selected: boolean;
  onToggle: () => void;
  iconSource?: any;
}

export function ScrapItemCard({ item, selected, onToggle, iconSource }: Props) {
  return (
    <Pressable style={styles.card} onPress={onToggle}>
      <View style={styles.iconBox}>
        {iconSource ? (
          <Image source={iconSource} style={{ width: 48, height: 48 }} resizeMode="contain" />
        ) : (
          <Feather name="box" size={32} color={colors.neutral.gray400} />
        )}
      </View>
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
    borderColor: colors.neutral.gray200,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.neutral.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: { flex: 1 },
  name: { ...typography.bodySmMedium, color: colors.neutral.black, marginBottom: 2 },
  rate: { ...typography.bodySm, color: colors.neutral.gray600 },
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
