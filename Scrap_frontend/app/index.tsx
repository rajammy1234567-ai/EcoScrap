import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../src/theme';

// Root index — shown briefly while _layout.tsx evaluates onboarding/auth state
// and redirects to the correct screen.
export default function IndexScreen() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary.green600} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
});
