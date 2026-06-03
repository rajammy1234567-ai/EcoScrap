import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from './Button';
import { colors, spacing, typography } from '../../theme';

interface Props {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
  icon?: string;
}

export function EmptyState({ title = 'Oops!', subtitle, ctaLabel, onCta, icon = 'inbox' }: Props) {
  return (
    <View style={styles.container}>
      <Feather name={icon as any} size={64} color={colors.neutral.gray200} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {ctaLabel && onCta && (
        <Button label={ctaLabel} onPress={onCta} variant="primaryGreen" style={styles.cta} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['2xl'] },
  title: { ...typography.h2, color: colors.neutral.black, marginTop: spacing.lg, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.neutral.gray600, textAlign: 'center', marginBottom: spacing['2xl'] },
  cta: { alignSelf: 'stretch' },
});
