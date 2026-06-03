import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Header } from '../../src/components/shared/Header';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useAuth } from '../../src/context/AuthContext';
import { userService } from '../../src/services/user';
import { PaymentMethod } from '../../src/types';
import { colors, spacing, typography } from '../../src/theme';

export default function PaymentsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  const load = () => {
    if (!isAuthenticated) return;
    userService.getPaymentMethods().then((r) => setMethods(r.data.methods)).catch(() => {});
  };
  useEffect(() => { load(); }, [isAuthenticated]);

  const handleDelete = (id: string) => {
    Alert.alert('Remove', 'Remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await userService.deletePaymentMethod(id); load(); } },
    ]);
  };

  const upi = methods.filter((m) => m.type === 'upi');
  const bank = methods.filter((m) => m.type === 'bank_transfer');

  const Section = ({ title, icon, items, type }: { title: string; icon: string; items: PaymentMethod[]; type: string }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Feather name={icon as any} size={20} color={colors.neutral.gray600} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable onPress={() => router.push({ pathname: '/(profile)/add-payment', params: { type } })}>
          <Text style={styles.addLink}>+ Add</Text>
        </Pressable>
      </View>
      {items.map((m) => (
        <View key={m.id} style={styles.methodRow}>
          <Text style={styles.methodText}>{m.upi_id || `${m.bank_name} ••••${m.account_number?.slice(-4)}`}</Text>
          <Pressable onPress={() => handleDelete(m.id)} hitSlop={10}>
            <Feather name="trash-2" size={16} color={colors.functional.error} />
          </Pressable>
        </View>
      ))}
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="Payment method" />
        <EmptyState
          title="Login required"
          subtitle="Please login to manage your payment methods"
          ctaLabel="Login"
          onCta={() => router.push('/(auth)/enter-mobile')}
          icon="credit-card"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Payment method" />
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="UPI" icon="credit-card" items={upi} type="upi" />
        <Section title="Bank Transfer" icon="book" items={bank} type="bank_transfer" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  content: { padding: spacing.xl },
  section: { marginBottom: spacing['3xl'] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  sectionTitle: { flex: 1, ...typography.h3, color: colors.neutral.black },
  addLink: { ...typography.bodySmMedium, color: colors.primary.green600 },
  methodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.neutral.gray200 },
  methodText: { ...typography.bodySm, color: colors.neutral.black },
});
