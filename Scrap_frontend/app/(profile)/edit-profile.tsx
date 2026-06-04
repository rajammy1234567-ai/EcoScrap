import { useState } from 'react';
import {
  View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform,
  ScrollView, TextInput, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { userService } from '../../src/services/user';
import { colors, radii, spacing, typography } from '../../src/theme';

function IconInput({
  icon, label, value, onChange, editable = true,
  keyboardType = 'default', required = false, placeholder = '',
}: {
  icon: string; label: string; value: string;
  onChange?: (v: string) => void; editable?: boolean;
  keyboardType?: any; required?: boolean; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}{!!required && ' *'}</Text>
      <View style={[styles.fieldBox, !!focused && styles.fieldFocused, !editable && styles.fieldDisabled]}>
        <Feather name={icon as any} size={18} color={colors.neutral.gray400} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChange}
          editable={editable}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral.gray400}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser, logout } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim()) {
      if (Platform.OS === 'web') { window.alert('First name is required'); return; }
      Alert.alert('Error', 'First name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await userService.updateProfile({
        first_name: firstName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setUser(res.data.user);
      router.back();
    } catch {
      if (Platform.OS === 'web') { window.alert('Could not save changes. Please try again.'); }
      else { Alert.alert('Error', 'Could not save changes. Please try again.'); }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Sign out from this device?')) logout();
      return;
    }
    Alert.alert('Sign Out', 'Sign out from this device?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      window.alert('Delete account feature coming soon.');
      return;
    }
    Alert.alert('Delete Account', 'This feature is coming soon.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.neutral.black} />
        </Pressable>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <IconInput
            icon="user"
            label="Full Name"
            required
            value={firstName}
            onChange={setFirstName}
            placeholder="Enter your name"
          />

          <IconInput
            icon="mail"
            label="Email Address"
            value={email}
            onChange={setEmail}
            placeholder="Enter your email address"
            keyboardType="email-address"
          />

          <IconInput
            icon="phone"
            label="Phone Number"
            value={phone}
            onChange={setPhone}
            editable={true}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          {/* Destructive actions */}
          <View style={styles.destructiveSection}>
            <Pressable style={styles.destructiveCard} onPress={handleSignOut}>
              <Feather name="log-out" size={20} color={colors.functional.error} style={styles.destructiveIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.destructiveLabel}>Sign Out</Text>
                <Text style={styles.destructiveSub}>Sign out from this device</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.functional.error} />
            </Pressable>

            <Pressable style={[styles.destructiveCard, { marginTop: spacing.lg }]} onPress={handleDeleteAccount}>
              <Feather name="x-square" size={20} color={colors.functional.error} style={styles.destructiveIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.destructiveLabel}>Delete Account</Text>
                <Text style={styles.destructiveSub}>Delete your account permanently</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.functional.error} />
            </Pressable>
          </View>

        </ScrollView>

        {/* Save Changes */}
        <View style={styles.ctaWrap}>
          <Pressable
            style={[styles.saveBtn, loading && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },

  header: {
    flexDirection: 'row', alignItems: 'center',
    height: 56, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.neutral.gray100,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, ...typography.h3, color: colors.neutral.black, textAlign: 'center' },

  content: { padding: spacing.xl, paddingBottom: 40 },

  fieldWrap: { marginBottom: spacing.xl },
  fieldLabel: { ...typography.bodySmMedium, color: colors.neutral.black, marginBottom: spacing.sm },
  fieldBox: {
    flexDirection: 'row', alignItems: 'center',
    height: 54, borderRadius: radii.lg,
    borderWidth: 1.5, borderColor: colors.neutral.gray200,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.neutral.white,
  },
  fieldFocused: { borderColor: colors.primary.green600 },
  fieldDisabled: { backgroundColor: colors.neutral.gray100 },
  fieldInput: { flex: 1, ...typography.body, color: colors.neutral.black },

  helperText: {
    ...typography.caption, color: colors.neutral.gray400,
    marginTop: -spacing.lg, marginBottom: spacing.xl,
    paddingLeft: spacing.sm,
  },

  destructiveSection: { marginTop: spacing.lg },
  destructiveCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.lg, borderRadius: radii.lg,
    borderWidth: 1.5, borderColor: colors.functional.errorBg,
    backgroundColor: colors.neutral.white,
  },
  destructiveIcon: { marginRight: spacing.lg },
  destructiveLabel: { ...typography.bodySmMedium, color: colors.functional.error, fontWeight: '600' as const },
  destructiveSub: { ...typography.caption, color: colors.functional.error, marginTop: 2 },

  ctaWrap: {
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 32 : spacing.xl,
    borderTopWidth: 1, borderTopColor: colors.neutral.gray100,
  },
  saveBtn: {
    height: 52, borderRadius: radii.lg,
    borderWidth: 1.5, borderColor: colors.neutral.gray200,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.neutral.white,
  },
  saveBtnText: { ...typography.buttonLg, color: colors.neutral.gray600 },
});
