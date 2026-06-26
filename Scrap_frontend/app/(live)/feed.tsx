import { useMemo, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { getSessionsFromIndex } from '../../src/data/liveSessions';
import { LiveReelItem } from '../../src/components/live/LiveReelItem';
import { LiveSession } from '../../src/types/live';

export default function LiveFeedScreen() {
  const { startId } = useLocalSearchParams<{ startId?: string }>();
  const { height } = useWindowDimensions();
  const sessions = useMemo(() => getSessionsFromIndex(startId), [startId]);

  const renderItem = useCallback(
    ({ item, index }: { item: LiveSession; index: number }) => (
      <LiveReelItem session={item} index={index} total={sessions.length} />
    ),
    [sessions.length],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
    [height],
  );

  return (
    <>
      <StatusBar style="light" />
      <FlatList
        data={sessions}
        keyExtractor={(s) => s.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        bounces={false}
        overScrollMode="never"
        getItemLayout={getItemLayout}
        style={styles.list}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: '#000' },
});