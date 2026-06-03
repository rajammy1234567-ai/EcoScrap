import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { colors, radii, typography } from '../../theme';

type Variant = 'primaryDark' | 'primaryGreen' | 'secondary' | 'text' | 'skipPill';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primaryDark', disabled, loading, style }: Props) {
  const s = styles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        baseStyle.btn,
        s.btn,
        pressed && s.pressed,
        disabled && s.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'text' ? colors.primary.green600 : colors.neutral.white} />
      ) : (
        <Text style={[baseStyle.label, s.label, disabled && s.labelDisabled]}>{label}</Text>
      )}
    </Pressable>
  );
}

const baseStyle = StyleSheet.create({
  btn: { height: 52, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  label: { ...typography.buttonLg },
});

const styles: Record<Variant, any> = {
  primaryDark: StyleSheet.create({
    btn: { backgroundColor: colors.neutral.black, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
    label: { color: colors.neutral.white },
    pressed: { backgroundColor: colors.neutral.gray800 },
    disabled: { opacity: 0.4 },
    labelDisabled: {},
  }),
  primaryGreen: StyleSheet.create({
    btn: { backgroundColor: colors.primary.green600 },
    label: { color: colors.neutral.white },
    pressed: { backgroundColor: colors.primary.green700 },
    disabled: { backgroundColor: colors.primary.green100 },
    labelDisabled: { opacity: 0.6 },
  }),
  secondary: StyleSheet.create({
    btn: { height: 48, backgroundColor: colors.neutral.white, borderWidth: 1, borderColor: colors.neutral.gray200 },
    label: { color: colors.neutral.black, ...typography.buttonSm },
    pressed: { backgroundColor: colors.neutral.gray100 },
    disabled: { opacity: 0.4 },
    labelDisabled: {},
  }),
  text: StyleSheet.create({
    btn: { height: 36, backgroundColor: 'transparent', paddingHorizontal: 0 },
    label: { color: colors.primary.green600, ...typography.link },
    pressed: { opacity: 0.6 },
    disabled: { opacity: 0.4 },
    labelDisabled: {},
  }),
  skipPill: StyleSheet.create({
    btn: { height: 36, backgroundColor: colors.neutral.black, borderRadius: radii.pill, paddingHorizontal: 16 },
    label: { color: colors.neutral.white, ...typography.buttonSm },
    pressed: { opacity: 0.8 },
    disabled: { opacity: 0.4 },
    labelDisabled: {},
  }),
};
