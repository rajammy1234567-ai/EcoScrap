import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

interface Props {
  current: number;
  total: number;
  labels?: string[];
}

export function StepProgress({ current, total, labels }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[styles.segment, i < current && styles.segmentDone, i === current - 1 && styles.segmentCurrent]}
          />
        ))}
      </View>
      <View style={styles.meta}>
        <Text style={styles.step}>Step {current} of {total}</Text>
        {labels?.[current - 1] ? (
          <Text style={styles.label}>{labels[current - 1]}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  track: { flexDirection: 'row', gap: 6, marginBottom: spacing.sm },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral.gray200,
  },
  segmentDone: { backgroundColor: colors.primary.green600 },
  segmentCurrent: { backgroundColor: colors.primary.green500 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  step: { ...typography.caption, color: colors.neutral.gray600, fontWeight: '600' as const },
  label: { ...typography.caption, color: colors.primary.green600, fontWeight: '600' as const },
});