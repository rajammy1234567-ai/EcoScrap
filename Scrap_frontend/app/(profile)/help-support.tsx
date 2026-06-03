import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Header } from '../../src/components/shared/Header';
import { colors, spacing, typography, radii } from '../../src/theme';

const SUPPORT_PHONE = '+919876543210';
const WHATSAPP_URL = `https://wa.me/${SUPPORT_PHONE.replace('+', '')}?text=Hi%2C%20I%20need%20help%20with%20TheKabadiwala`;

function ContactRow({ icon, label, subtitle, onPress }: {
  icon: string; label: string; subtitle: string; onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.iconBox}>
        <Feather name={icon as any} size={20} color={colors.primary.green600} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.neutral.gray400} />
    </Pressable>
  );
}

export default function HelpSupportScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Help & Support" />
      <View style={styles.content}>
        <Text style={styles.heading}>How can we help?</Text>
        <Text style={styles.sub}>Our team is available Mon–Sat, 9 AM – 6 PM</Text>
        <ContactRow icon="phone" label="Call Us" subtitle={SUPPORT_PHONE} onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE}`)} />
        <ContactRow icon="message-circle" label="WhatsApp" subtitle="Chat with us on WhatsApp" onPress={() => Linking.openURL(WHATSAPP_URL)} />
        <ContactRow icon="mail" label="Email" subtitle="support@thekabadiwala.com" onPress={() => Linking.openURL('mailto:support@thekabadiwala.com')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  content: { padding: spacing.xl },
  heading: { ...typography.h3, color: colors.neutral.black, marginBottom: spacing.sm },
  sub: { ...typography.bodySm, color: colors.neutral.gray600, marginBottom: spacing['2xl'] },
  row: {
    flexDirection: 'row', alignItems: 'center', height: 64,
    borderRadius: radii.lg, borderWidth: 1, borderColor: colors.neutral.gray200,
    paddingHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.neutral.white,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: radii.md,
    backgroundColor: colors.primary.green50,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.lg,
  },
  rowLabel: { ...typography.bodySmMedium, color: colors.neutral.black },
  rowSub: { ...typography.caption, color: colors.neutral.gray600, marginTop: 2 },
});
