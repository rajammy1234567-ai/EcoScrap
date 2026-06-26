import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radii, spacing, typography, shadows } from '../../theme';

interface Tab<T extends string> {
  key: T;
  label: string;
  count?: number;
}

interface Props<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (key: T) => void;
}

export function SegmentedControl<T extends string>({ tabs, active, onChange }: Props<T>) {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab.key)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            {tab.count != null && tab.count > 0 ? (
              <View style={[styles.badge, isActive && styles.badgeActive]}>
                <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                  {tab.count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.gray100,
    borderRadius: radii.lg,
    padding: 4,
    gap: 4,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  tabActive: {
    backgroundColor: colors.neutral.white,
    ...shadows.sm,
  },
  label: {
    ...typography.caption,
    fontWeight: '600' as const,
    color: colors.neutral.gray600,
  },
  labelActive: { color: colors.neutral.black },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.neutral.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeActive: { backgroundColor: colors.primary.green600 },
  badgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.neutral.gray600,
  },
  badgeTextActive: { color: colors.neutral.white },
});