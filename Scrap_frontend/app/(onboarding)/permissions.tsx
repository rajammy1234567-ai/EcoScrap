import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { Header } from '../../src/components/shared/Header';
import { storage } from '../../src/services/storage';
import { requestNotificationPermission } from '../../src/services/notifications';
import { colors, radii, spacing, typography } from '../../src/theme';

const PERMISSIONS = [
  { icon: 'bell', title: 'Pickup Notifications', desc: 'Get real-time status updates on your scrap pickups' },
  { icon: 'map-pin', title: 'Location Access', desc: 'Find scrap collectors nearest to your address' },
  { icon: 'camera', title: 'Camera & Photos', desc: 'Attach scrap photos to get a better price estimate' },
];

export default function PermissionsScreen() {
  const router = useRouter();

  const handleAllow = async () => {
    await requestNotificationPermission();
    await storage.setOnboarded();
    router.replace('/(auth)/enter-mobile');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header showBack title="" />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.heroEmoji}>🔔</Text>
        </View>
        <Text style={styles.title}>Quick permissions</Text>
        <Text style={styles.subtitle}>For the best experience, we need a few permissions</Text>

        <View style={styles.list}>
          {PERMISSIONS.map((p) => (
            <View key={p.title} style={styles.item}>
              <View style={styles.iconBox}>
                <Feather name={p.icon as any} size={22} color={colors.primary.green600} />
              </View>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{p.title}</Text>
                <Text style={styles.itemDesc}>{p.desc}</Text>
              </View>
              <Feather name="check-circle" size={20} color={colors.primary.green600} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.cta}>
        <Button label="Allow & Continue" onPress={handleAllow} variant="primaryGreen" />
        <Button label="Maybe Later" onPress={handleAllow} variant="text" style={styles.laterBtn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing['2xl'], alignItems: 'center' },
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary.green50, alignItems: 'center', justifyContent: 'center', marginBottom: spacing['2xl'] },
  heroEmoji: { fontSize: 48 },
  title: { ...typography.h1, color: colors.neutral.black, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.neutral.gray600, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing['3xl'] },
  list: { width: '100%', gap: spacing.lg },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, backgroundColor: colors.primary.green50, borderRadius: radii.lg, padding: spacing.lg },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.neutral.white, alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1 },
  itemTitle: { ...typography.bodySmMedium, color: colors.neutral.black },
  itemDesc: { ...typography.caption, color: colors.neutral.gray600, marginTop: 2 },
  cta: { padding: spacing.xl, gap: spacing.md },
  laterBtn: { alignSelf: 'center' },
});
