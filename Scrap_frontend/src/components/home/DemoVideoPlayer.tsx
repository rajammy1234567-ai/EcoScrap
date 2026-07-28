import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../theme';

const { width: W } = Dimensions.get('window');
const VIDEO_H = Math.round(((W - spacing.lg * 2) * 9) / 16);

type Props = {
  url: string;
  title?: string;
};

/**
 * Autoplay muted demo video with mute / play-pause.
 * Uses expo-av when available; web uses HTML <video>.
 */
export function DemoVideoPlayer({ url, title = 'How Eco Scrap works' }: Props) {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [nativeReady, setNativeReady] = useState(false);
  const videoRef = useRef<any>(null);
  const webRef = useRef<HTMLVideoElement | null>(null);
  const [VideoComp, setVideoComp] = useState<any>(null);
  const [ResizeMode, setResizeMode] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cancelled = false;
    (async () => {
      try {
        const av = await import('expo-av');
        if (!cancelled) {
          setVideoComp(() => av.Video);
          setResizeMode(av.ResizeMode);
          setNativeReady(true);
        }
      } catch {
        // expo-av not installed — native falls back to nothing interactive
        setNativeReady(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && webRef.current) {
      webRef.current.muted = muted;
      if (playing) webRef.current.play().catch(() => {});
      else webRef.current.pause();
    }
  }, [muted, playing]);

  const toggleMute = () => setMuted((m) => !m);
  const togglePlay = async () => {
    const next = !playing;
    setPlaying(next);
    if (Platform.OS !== 'web' && videoRef.current) {
      try {
        if (next) await videoRef.current.playAsync();
        else await videoRef.current.pauseAsync();
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.player}>
        {Platform.OS === 'web' ? (
          // @ts-expect-error web-only element
          <video
            ref={webRef}
            src={url}
            autoPlay
            loop
            muted={muted}
            playsInline
            style={{
              width: '100%',
              height: VIDEO_H,
              objectFit: 'cover',
              borderRadius: 16,
              backgroundColor: '#000',
            }}
          />
        ) : nativeReady && VideoComp ? (
          <VideoComp
            ref={videoRef}
            source={{ uri: url }}
            style={styles.video}
            resizeMode={ResizeMode?.Cover || 'cover'}
            shouldPlay={playing}
            isLooping
            isMuted={muted}
            useNativeControls={false}
          />
        ) : (
          <View style={[styles.video, styles.fallback]}>
            <Feather name="play-circle" size={40} color="#fff" />
            <Text style={styles.fallbackText}>Loading video…</Text>
          </View>
        )}

        <View style={styles.controls}>
          <Pressable style={styles.ctrlBtn} onPress={togglePlay} hitSlop={8}>
            <Feather
              name={playing ? 'pause' : 'play'}
              size={18}
              color="#fff"
            />
          </Pressable>
          <Pressable style={styles.ctrlBtn} onPress={toggleMute} hitSlop={8}>
            <Feather
              name={muted ? 'volume-x' : 'volume-2'}
              size={18}
              color="#fff"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.bodySmMedium,
    fontWeight: '700',
    color: colors.neutral.black,
    marginBottom: spacing.sm,
  },
  player: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: '#000',
    ...shadows.sm,
  },
  video: {
    width: '100%',
    height: VIDEO_H,
    backgroundColor: '#000',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fallbackText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  controls: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    gap: 8,
  },
  ctrlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
