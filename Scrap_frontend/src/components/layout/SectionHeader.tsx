import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

interface Props {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable style={styles.action} onPress={onAction} hitSlop={8}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Feather name="chevron-right" size={14} color={colors.primary.green600} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  textCol: { flex: 1 },
  title: {
    ...typography.bodySmMedium,
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.neutral.black,
  },
  subtitle: {
    ...typography.caption,
    color: colors.neutral.gray600,
    marginTop: 2,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionText: {
    ...typography.caption,
    color: colors.primary.green600,
    fontWeight: '600' as const,
  },
});