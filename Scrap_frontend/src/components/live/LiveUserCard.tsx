import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LiveSession } from '../../types/live';
import { colors, radii, spacing, typography, shadows } from '../../theme';

interface Props {
  session: LiveSession;
  onPress: () => void;
}

export function LiveUserCard({ session, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={session.thumbnail} style={styles.thumb} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>{session.name}</Text>
        <Text style={styles.viewers}>{session.viewers} watching</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 130,
    height: 180,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.neutral.black,
    ...shadows.md,
  },
  thumb: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginBottom: spacing.xs,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral.white,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: colors.neutral.white,
    letterSpacing: 0.5,
  },
  name: {
    ...typography.caption,
    fontWeight: '700' as const,
    color: colors.neutral.white,
  },
  viewers: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
});