import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LiveSession } from '../../types/live';
import { colors, radii, spacing, typography } from '../../theme';

interface Props {
  session: LiveSession;
  index: number;
  total: number;
}

export function LiveReelItem({ session, index, total }: Props) {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={[styles.page, { height }]}>
      <Image source={session.thumbnail} style={styles.bg} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.4, 1]}
        style={styles.gradient}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()} hitSlop={12}>
          <Feather name="x" size={24} color={colors.neutral.white} />
        </Pressable>
        <View style={styles.liveChip}>
          <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
          <Text style={styles.liveChipText}>LIVE</Text>
        </View>
        <View style={styles.viewerChip}>
          <Feather name="eye" size={14} color={colors.neutral.white} />
          <Text style={styles.viewerText}>{session.viewers}</Text>
        </View>
      </View>

      {/* Side actions */}
      <View style={styles.sideActions}>
        <View style={styles.sideBtn}>
          <Feather name="heart" size={22} color={colors.neutral.white} />
          <Text style={styles.sideLabel}>Like</Text>
        </View>
        <View style={styles.sideBtn}>
          <Feather name="message-circle" size={22} color={colors.neutral.white} />
          <Text style={styles.sideLabel}>Chat</Text>
        </View>
        <View style={styles.sideBtn}>
          <Feather name="share-2" size={22} color={colors.neutral.white} />
          <Text style={styles.sideLabel}>Share</Text>
        </View>
      </View>

      {/* Bottom info */}
      <View style={styles.bottom}>
        <View style={styles.hostRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{session.name[0]}</Text>
          </View>
          <View style={styles.hostInfo}>
            <Text style={styles.hostName}>{session.name}</Text>
            <Text style={styles.hostMeta}>
              {session.role} · {session.area}
            </Text>
          </View>
          <Pressable style={styles.followBtn}>
            <Text style={styles.followText}>Follow</Text>
          </Pressable>
        </View>

        <Text style={styles.activity}>{session.activity}</Text>

        <View style={styles.tagRow}>
          {session.tags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.cta}
          onPress={() => router.push('/(home)/select-items')}
        >
          <Feather name="plus-circle" size={18} color={colors.neutral.white} />
          <Text style={styles.ctaText}>Schedule Pickup</Text>
        </Pressable>

        {index < total - 1 && (
          <View style={styles.swipeHint}>
            <Feather name="chevrons-up" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.swipeText}>Swipe up for next live</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', backgroundColor: '#000' },
  bg: { ...StyleSheet.absoluteFillObject },
  gradient: { ...StyleSheet.absoluteFillObject },
  topBar: {
    position: 'absolute',
    top: 52,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    zIndex: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF3B30',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.white,
  },
  liveChipText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: colors.neutral.white,
  },
  viewerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  viewerText: {
    ...typography.caption,
    color: colors.neutral.white,
    fontWeight: '600' as const,
  },
  sideActions: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 200,
    gap: spacing.lg,
    alignItems: 'center',
  },
  sideBtn: { alignItems: 'center', gap: 4 },
  sideLabel: {
    fontSize: 10,
    color: colors.neutral.white,
    fontWeight: '600' as const,
  },
  bottom: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 48,
    gap: spacing.sm,
  },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.green600,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.neutral.white,
  },
  hostInfo: { flex: 1 },
  hostName: {
    ...typography.bodySmMedium,
    fontWeight: '700' as const,
    color: colors.neutral.white,
  },
  hostMeta: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
  },
  followBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.neutral.white,
  },
  followText: {
    ...typography.caption,
    color: colors.neutral.white,
    fontWeight: '700' as const,
  },
  activity: {
    ...typography.body,
    color: colors.neutral.white,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  tagText: {
    fontSize: 11,
    color: colors.neutral.white,
    fontWeight: '600' as const,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.green600,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  ctaText: {
    ...typography.bodySmMedium,
    fontWeight: '700' as const,
    color: colors.neutral.white,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  swipeText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.6)',
  },
});