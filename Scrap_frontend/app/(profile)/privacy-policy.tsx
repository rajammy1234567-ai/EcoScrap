import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { Header } from '../../src/components/shared/Header';
import { colors } from '../../src/theme';

const PRIVACY_URL = 'https://thekabadiwala.com/privacy';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  useEffect(() => {
    WebBrowser.openBrowserAsync(PRIVACY_URL).then(() => router.back());
  }, []);
  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Privacy Policy" />
      <View style={styles.center}><ActivityIndicator color={colors.primary.green600} /></View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
