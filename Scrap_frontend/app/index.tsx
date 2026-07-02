import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, layout, spacing } from '../src/theme';

export default function IndexScreen() {
  return (
    <LinearGradient colors={[...layout.headerGradient]} style={styles.root}>
      <View style={styles.content}>
        <View style={styles.logoRing}>
          <Image
            source={require('../assets/images/app/eco_icon_512.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.brand}>Eco Scrap</Text>
        <Text style={styles.tagline}>Scrap pickup · Instant cash</Text>
        <ActivityIndicator
          size="small"
          color={colors.primary.green200}
          style={styles.loader}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logo: { width: 56, height: 56 },
  brand: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.neutral.white,
    letterSpacing: -0.5,
  },
  tagline: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
  },
  loader: { marginTop: spacing['2xl'] },
});