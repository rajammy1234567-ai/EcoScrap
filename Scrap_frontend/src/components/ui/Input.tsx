import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../../theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  phonePrefix?: boolean;
  leftIcon?: string;
}

export function Input({ label, error, required, phonePrefix, leftIcon, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.asterisk}> *</Text>}
        </Text>
      )}
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          error ? styles.fieldError : undefined,
        ]}
      >
        {leftIcon && (
          <Feather
            name={leftIcon as any}
            size={18}
            color={focused ? colors.primary.green600 : colors.neutral.gray400}
            style={styles.leftIcon}
          />
        )}
        {phonePrefix && (
          <View style={styles.prefixBox}>
            <Text style={styles.prefix}>+91</Text>
            <View style={styles.divider} />
          </View>
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.neutral.gray400}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { ...typography.bodySmMedium, color: colors.neutral.black, marginBottom: spacing.sm },
  asterisk: { color: colors.neutral.black },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    backgroundColor: colors.neutral.gray100,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
  },
  fieldFocused: {
    borderColor: colors.primary.green600,
    backgroundColor: colors.neutral.white,
  },
  leftIcon: { marginRight: spacing.sm },
  fieldError: { borderColor: colors.functional.error, backgroundColor: colors.neutral.white },
  prefixBox: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.md },
  prefix: { ...typography.body, color: colors.neutral.black, fontWeight: '500' },
  divider: { width: 1, height: 24, backgroundColor: colors.neutral.gray200, marginLeft: spacing.md },
  input: { flex: 1, ...typography.body, color: colors.neutral.black, padding: 0 },
  errorText: { ...typography.caption, color: colors.functional.error, marginTop: 4 },
});
