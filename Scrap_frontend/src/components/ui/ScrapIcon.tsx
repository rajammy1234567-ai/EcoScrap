import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii } from '../../theme';
import { getScrapIcon, ScrapIconConfig } from '../../utils/scrapIcons';

interface Props {
  name?: string;
  icon?: ScrapIconConfig;
  size?: number;
  color?: string;
  variant?: 'default' | 'compact' | 'filled' | 'outline' | 'hero';
  active?: boolean;
  style?: ViewStyle;
}

export function ScrapIcon({
  name,
  icon: iconProp,
  size = 24,
  color,
  variant = 'default',
  active = false,
  style,
}: Props) {
  const config = iconProp ?? (name ? getScrapIcon(name) : getScrapIcon(''));
  const iconColor =
    color ??
    (active
      ? colors.neutral.white
      : variant === 'hero'
        ? colors.primary.green600
        : colors.primary.green700);

  const iconEl =
    config.family === 'material' ? (
      <MaterialCommunityIcons name={config.name as any} size={size} color={iconColor} />
    ) : (
      <Feather name={config.name as any} size={size} color={iconColor} />
    );

  if (variant === 'default') return iconEl;

  const containerStyles: ViewStyle[] = [styles.base, style as ViewStyle];

  if (variant === 'compact') {
    containerStyles.push(styles.compact);
    if (active) containerStyles.push(styles.filledActive);
  } else if (variant === 'filled') {
    containerStyles.push(styles.filled);
    if (active) containerStyles.push(styles.filledActive);
  } else if (variant === 'outline') {
    containerStyles.push(styles.outline);
  } else if (variant === 'hero') {
    containerStyles.push(styles.hero);
  }

  return <View style={containerStyles}>{iconEl}</View>;
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.primary.green50,
    borderWidth: 1,
    borderColor: colors.primary.green100,
  },
  filled: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.primary.green50,
    borderWidth: 1,
    borderColor: colors.primary.green100,
  },
  filledActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  outline: {
    width: 72,
    height: 72,
    borderRadius: radii.xl,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.primary.green100,
  },
  hero: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral.white,
    borderWidth: 2,
    borderColor: colors.primary.green100,
    shadowColor: colors.primary.green600,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
});