import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Input } from "../../src/components/ui/Input";
import { Chip } from "../../src/components/ui/Chip";
import { Button } from "../../src/components/ui/Button";
import { Header } from "../../src/components/shared/Header";
import { userService } from "../../src/services/user";
import {
  locationService,
  getCurrentCoords,
  reverseGeocode,
  syncLocationToServer,
} from "../../src/services/location";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, typography, radii } from "../../src/theme";

const ADDRESS_TYPES = ["home", "office", "other"];

export default function AddAddressScreen() {
  const router = useRouter();
  const [type, setType] = useState("home");
  const [flat, setFlat] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [checkingService, setCheckingService] = useState(false);

  const handleGetCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
      const current = await getCurrentCoords();
      if (!current) {
        Alert.alert(
          "Permission denied",
          "Allow location access to auto-fill address and match scrapers within 10 km.",
        );
        return;
      }

      setCoords(current);
      // Keep backend lastLocation in sync
      locationService
        .updateLocation(current.latitude, current.longitude)
        .catch(() => {});

      const geo = await reverseGeocode(current);
      setLocality(geo.locality);
      setCity(geo.city);
      setPincode(geo.pincode);
      setServiceError(null);
    } catch {
      Alert.alert("Error", "Could not fetch current location.");
    } finally {
      setFetchingLocation(false);
    }
  };

  const handlePincodeBlur = async () => {
    if (!pincode || pincode.length < 6) return;
    setCheckingService(true);
    setServiceError(null);
    try {
      const res = await locationService.checkService(pincode);
      if (!res.data.is_available) {
        setServiceError(
          `Sorry, we don't serve ${pincode} yet. Expanding soon!`,
        );
      }
    } catch {
      // Network error — fail open, allow user to proceed
    } finally {
      setCheckingService(false);
    }
  };

  const handleSave = async () => {
    if (!flat.trim()) {
      Alert.alert("Error", "Please enter flat/house number");
      return;
    }
    setLoading(true);
    try {
      // Prefer coords already captured; otherwise try GPS once more
      let latLng = coords;
      if (!latLng) {
        latLng = await getCurrentCoords();
        if (latLng) setCoords(latLng);
      }

      const { data } = await userService.addAddress({
        type,
        flat_number: flat,
        locality,
        city,
        pincode,
        ...(latLng
          ? { latitude: latLng.latitude, longitude: latLng.longitude }
          : {}),
      });

      if (latLng) {
        await syncLocationToServer().catch(() => {});
      }

      const addresses = data.addresses || [];
      const newAddressId = addresses[addresses.length - 1]?.id;
      router.replace(
        newAddressId
          ? `/(home)/select-items?selectedAddr=${encodeURIComponent(
              newAddressId,
            )}`
          : "/(home)/select-items",
      );
      return;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Could not save address. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Add Address" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Address Type</Text>
        <View style={styles.chips}>
          {ADDRESS_TYPES.map((t) => (
            <Chip
              key={t}
              label={t.charAt(0).toUpperCase() + t.slice(1)}
              selected={type === t}
              onPress={() => setType(t)}
            />
          ))}
        </View>

        <Pressable
          style={styles.locationBtn}
          onPress={handleGetCurrentLocation}
          disabled={fetchingLocation}
        >
          <Feather name="map-pin" size={18} color={colors.primary.green600} />
          <Text style={styles.locationBtnText}>
            {fetchingLocation ? "Fetching location..." : "Use current location"}
          </Text>
        </Pressable>

        <Input
          label="Flat / House no / Floor / Building"
          placeholder="e.g. 4B, 2nd Floor, ABC Towers"
          required
          value={flat}
          onChangeText={setFlat}
        />
        <Input
          label="Locality, Area / Street"
          placeholder="e.g. Sector 15, Near Main Market"
          value={locality}
          onChangeText={setLocality}
        />
        <Input
          label="City"
          placeholder="e.g. Chandigarh"
          value={city}
          onChangeText={setCity}
        />
        <Input
          label="Pincode"
          placeholder="e.g. 160015"
          value={pincode}
          onChangeText={setPincode}
          keyboardType="number-pad"
          maxLength={6}
          onBlur={handlePincodeBlur}
        />
        {serviceError && (
          <View style={styles.serviceError}>
            <Feather
              name="alert-circle"
              size={16}
              color={colors.functional.error}
            />
            <Text style={styles.serviceErrorText}>{serviceError}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.cta}>
        <Button
          label="Save address details"
          onPress={handleSave}
          variant="primaryGreen"
          loading={loading}
          disabled={!!serviceError || checkingService}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  content: { padding: spacing.xl },
  label: {
    ...typography.bodySmMedium,
    color: colors.neutral.black,
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: "row", marginBottom: spacing["2xl"] },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.green50,
    borderRadius: radii.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary.green200,
  },
  locationBtnText: {
    ...typography.bodySmMedium,
    color: colors.primary.green700,
  },
  cta: { padding: spacing.xl },
  serviceError: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.functional.errorBg,
    borderRadius: radii.md,
  },
  serviceErrorText: {
    ...typography.caption,
    color: colors.functional.error,
    flex: 1,
  },
});
