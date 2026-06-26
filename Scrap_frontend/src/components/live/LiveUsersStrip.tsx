import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LIVE_SESSIONS } from '../../data/liveSessions';
import { LiveUserCard } from './LiveUserCard';
import { colors, spacing, typography } from '../../theme';

export function LiveUsersStrip() {
  const router = useRouter();

  const openFeed = (startId: string) => {
    router.push({
      pathname: '/(live)/feed',
      params: { startId },
    });
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.header}
        onPress={() => openFeed(LIVE_SESSIONS[0].id)}
      >
        <View style={styles.headerLeft}>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.livePillText}>{LIVE_SESSIONS.length} LIVE</Text>
          </View>
          <Text style={styles.title}>Collectors near you</Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.neutral.gray400} />
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {LIVE_SESSIONS.map((session) => (
          <LiveUserCard
            key={session.id}
            session={session}
            onPress={() => openFeed(session.id)}
          />
        ))}
      </ScrollView>

      <Text style={styles.hint}>Tap a live card · Swipe up/down like reels</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { gap: 4 },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  livePillText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#FF3B30',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.bodySmMedium,
    fontWeight: '700' as const,
    color: colors.neutral.black,
  },
  row: { gap: spacing.md, paddingRight: spacing.sm },
  hint: {
    ...typography.caption,
    color: colors.neutral.gray400,
    textAlign: 'center',
  },
});