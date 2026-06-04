import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Header } from "../../src/components/shared/Header";
import { Button } from "../../src/components/ui/Button";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { useAuth } from "../../src/context/AuthContext";
import { userService } from "../../src/services/user";
import { Address } from "../../src/types";
import { colors, spacing, typography } from "../../src/theme";

export default function AddressesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);

  const load = () => {
    if (!isAuthenticated) return;
    userService
      .getAddresses()
      .then((r) => setAddresses(r.data.addresses))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, [isAuthenticated]);

  useFocusEffect(() => {
    load();
  });

  const handleDelete = (id: string) => {
    Alert.alert("Delete Address", "Remove this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await userService.deleteAddress(id);
          load();
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="Addresses" />
        <EmptyState
          title="Login required"
          subtitle="Please login to manage your addresses"
          ctaLabel="Login"
          onCta={() => router.push("/(auth)/enter-mobile")}
          icon="map-pin"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Addresses" />
      <FlatList
        data={addresses}
        keyExtractor={(a) => a.id}
        contentContainerStyle={[
          styles.list,
          addresses.length === 0 && styles.emptyList,
        ]}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Feather
              name={item.type === "office" ? "briefcase" : "home"}
              size={20}
              color={colors.neutral.gray600}
            />
            <View style={styles.addrContent}>
              <Text style={styles.addrType}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
              <Text style={styles.addrText}>
                {[item.flat_number, item.locality, item.city]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
              {item.is_default && (
                <Text style={styles.defaultBadge}>Default</Text>
              )}
            </View>
            <Pressable onPress={() => handleDelete(item.id)} hitSlop={10}>
              <Feather
                name="trash-2"
                size={18}
                color={colors.functional.error}
              />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No addresses"
            subtitle="Add your first address"
            ctaLabel="Add Address"
            onCta={() => router.push("/(location)/add-address")}
            icon="map-pin"
          />
        }
        ListHeaderComponent={
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push("/(location)/add-address")}
          >
            <Feather name="plus" size={18} color={colors.primary.green600} />
            <Text style={styles.addBtnText}>Add Address</Text>
          </Pressable>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  list: { padding: spacing.xl },
  emptyList: { flex: 1 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  addBtnText: { ...typography.bodySmMedium, color: colors.primary.green600 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  addrContent: { flex: 1 },
  addrType: {
    ...typography.bodySmMedium,
    color: colors.neutral.black,
    marginBottom: 2,
  },
  addrText: { ...typography.caption, color: colors.neutral.gray600 },
  defaultBadge: {
    ...typography.caption,
    color: colors.primary.green600,
    fontWeight: "600",
    marginTop: 4,
  },
});
