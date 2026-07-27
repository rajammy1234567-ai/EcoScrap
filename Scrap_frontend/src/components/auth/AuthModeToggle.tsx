import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

export type AuthMode = 'email' | 'phone';

interface Props {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
}

export function AuthModeToggle({ mode, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.tab, mode === 'email' && styles.tabActive]}
        onPress={() => onChange('email')}
      >
        <Text style={[styles.tabText, mode === 'email' && styles.tabTextActive]}>
          Email
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tab, mode === 'phone' && styles.tabActive]}
        onPress={() => onChange('phone')}
      >
        <Text style={[styles.tabText, mode === 'phone' && styles.tabTextActive]}>
          Phone
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.gray100,
    borderRadius: radii.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.neutral.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    ...typography.bodySmMedium,
    color: colors.neutral.gray600,
    fontWeight: '600' as const,
  },
  tabTextActive: {
    color: colors.primary.green700,
    fontWeight: '700' as const,
  },
});
