import React from 'react';
import { Pressable, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

interface Props {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/** Google-style "Continue with Google" button */
export function GoogleContinueButton({ onPress, loading, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.neutral.gray800} />
      ) : (
        <>
          <View style={styles.gIcon}>
            <Text style={styles.gLetter}>G</Text>
          </View>
          <Text style={styles.label}>Continue with Google</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.neutral.white,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  pressed: {
    backgroundColor: colors.neutral.gray100,
  },
  disabled: {
    opacity: 0.5,
  },
  gIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  gLetter: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#4285F4',
  },
  label: {
    ...typography.buttonLg,
    color: colors.neutral.gray800,
    fontWeight: '600' as const,
  },
});
