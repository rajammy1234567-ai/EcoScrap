import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../theme';

interface Props {
  title?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showBack?: boolean;
}

export function Header({ title, onBack, rightAction, showBack = true }: Props) {
  const router = useRouter();
  const handleBack = onBack || (() => router.back());

  return (
    <View style={styles.header}>
      {showBack ? (
        <Pressable style={styles.backBtn} onPress={handleBack} hitSlop={10}>
          <Feather name="arrow-left" size={24} color={colors.neutral.black} />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.right}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.neutral.white,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -10 },
  placeholder: { width: 44 },
  title: { flex: 1, ...typography.h3, color: colors.neutral.black, textAlign: 'center' },
  right: { width: 44, alignItems: 'flex-end' },
});
