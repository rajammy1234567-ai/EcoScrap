import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Header } from '../../src/components/shared/Header';
import { userService } from '../../src/services/user';
import { colors, spacing, typography } from '../../src/theme';

export default function AddPaymentScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = type === 'upi'
        ? { type: 'upi', upi_id: upiId }
        : { type: 'bank_transfer', bank_name: bankName, account_number: accountNumber, ifsc_code: ifsc };
      await userService.addPaymentMethod(payload);
      router.back();
    } catch {
      Alert.alert('Error', 'Could not add payment method.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title={`Add ${type === 'upi' ? 'UPI' : 'Bank Account'}`} />
      <View style={styles.content}>
        {type === 'upi' ? (
          <Input label="UPI ID" placeholder="example@paytm" value={upiId} onChangeText={setUpiId} autoCapitalize="none" />
        ) : (
          <>
            <Input label="Bank Name" placeholder="State Bank of India" value={bankName} onChangeText={setBankName} />
            <Input label="Account Number" placeholder="123456789012" value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" />
            <Input label="IFSC Code" placeholder="SBIN0001234" value={ifsc} onChangeText={setIfsc} autoCapitalize="characters" />
          </>
        )}
        <View style={styles.cta}>
          <Button label="Save" onPress={handleSave} variant="primaryGreen" loading={loading} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  content: { flex: 1, padding: spacing.xl },
  cta: { marginTop: 'auto' },
});
