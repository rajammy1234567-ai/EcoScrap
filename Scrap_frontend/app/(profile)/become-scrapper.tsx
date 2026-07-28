import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../src/context/AuthContext";
import {
  scrapperService,
  ScrapperApplication,
  VehicleType,
} from "../../src/services/scrapper";
import { api } from "../../src/services/api";
import { Button } from "../../src/components/ui/Button";
import { colors, radii, spacing, typography, shadows } from "../../src/theme";

const VEHICLES: { key: VehicleType; label: string }[] = [
  { key: "bike", label: "Bike" },
  { key: "scooter", label: "Scooter" },
  { key: "auto", label: "Auto" },
  { key: "e-rickshaw", label: "E-Rickshaw" },
  { key: "mini-truck", label: "Mini Truck" },
  { key: "truck", label: "Truck" },
  { key: "other", label: "Other" },
];

const MAX_IMAGE_BYTES = 2.2 * 1024 * 1024;

async function pickImageAsDataUri(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    if (Platform.OS === "web") window.alert("Photo library permission needed");
    else Alert.alert("Permission", "Allow photo library access for KYC");
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.55,
    base64: true,
    allowsEditing: true,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  if (!asset.base64) {
    // web sometimes needs fetch
    if (asset.uri) {
      try {
        const res = await fetch(asset.uri);
        const blob = await res.blob();
        if (blob.size > MAX_IMAGE_BYTES) {
          throw new Error("Image too large (max ~2MB). Compress and retry.");
        }
        const reader = new FileReader();
        const dataUri: string = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        return dataUri;
      } catch (e: any) {
        if (Platform.OS === "web") window.alert(e.message || "Could not read image");
        else Alert.alert("Error", e.message || "Could not read image");
        return null;
      }
    }
    return null;
  }
  const mime = asset.mimeType || "image/jpeg";
  if (asset.base64.length * 0.75 > MAX_IMAGE_BYTES) {
    if (Platform.OS === "web") window.alert("Image too large (max ~2MB)");
    else Alert.alert("Error", "Image too large (max ~2MB). Try a smaller photo.");
    return null;
  }
  return `data:${mime};base64,${asset.base64}`;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = "default",
  required,
  multiline,
  maxLength,
  editable = true,
  autoCapitalize = "sentences",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  required?: boolean;
  multiline?: boolean;
  maxLength?: number;
  editable?: boolean;
  autoCapitalize?: any;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? " *" : ""}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMulti,
          focused && styles.inputFocused,
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral.gray400}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        editable={editable}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

function DocPicker({
  label,
  required,
  uri,
  onPick,
  locked,
}: {
  label: string;
  required?: boolean;
  uri: string | null;
  onPick: () => void;
  locked?: boolean;
}) {
  return (
    <Pressable
      style={[styles.docBox, uri && styles.docBoxDone]}
      onPress={locked ? undefined : onPick}
      disabled={locked}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.docPreview} />
      ) : (
        <View style={styles.docEmpty}>
          <Feather name="camera" size={22} color={colors.primary.green600} />
          <Text style={styles.docLabel}>
            {label}
            {required ? " *" : ""}
          </Text>
          <Text style={styles.docHint}>Tap to upload</Text>
        </View>
      )}
      {uri && !locked && (
        <View style={styles.docReplace}>
          <Text style={styles.docReplaceText}>Change</Text>
        </View>
      )}
    </Pressable>
  );
}

function StatusBanner({
  application,
  scrapperStatus,
  signupBonus,
}: {
  application: ScrapperApplication | null;
  scrapperStatus: string;
  signupBonus: number;
}) {
  if (scrapperStatus === "approved" || application?.status === "approved") {
    return (
      <View style={[styles.banner, styles.bannerSuccess]}>
        <Feather name="check-circle" size={22} color={colors.primary.green600} />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>You are an approved Scrapper!</Text>
          <Text style={styles.bannerBody}>
            ₹{signupBonus || application?.signupBonusAmount || 5000} wallet float
            credited. Use Scrapper Jobs to collect & pay customers.
          </Text>
        </View>
      </View>
    );
  }
  if (scrapperStatus === "pending" || application?.status === "pending") {
    return (
      <View style={[styles.banner, styles.bannerWarn]}>
        <Feather name="clock" size={22} color={colors.functional.warning} />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>KYC under review</Text>
          <Text style={styles.bannerBody}>
            Admin is verifying your Aadhaar / PAN documents. You will get a
            notification with the decision.
          </Text>
        </View>
      </View>
    );
  }
  if (scrapperStatus === "rejected" || application?.status === "rejected") {
    return (
      <View style={[styles.banner, styles.bannerError]}>
        <Feather name="x-circle" size={22} color={colors.functional.error} />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Application rejected</Text>
          <Text style={styles.bannerBody}>
            {application?.adminNote
              ? `Reason: ${application.adminNote}`
              : "Update documents and re-apply."}
          </Text>
        </View>
      </View>
    );
  }
  return null;
}

export default function BecomeScrapperScreen() {
  const router = useRouter();
  const { user, setUser, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState<ScrapperApplication | null>(
    null,
  );
  const [scrapperStatus, setScrapperStatus] = useState(
    user?.scrapperStatus || "none",
  );
  const [signupBonus, setSignupBonus] = useState(5000);

  const [fullName, setFullName] = useState(
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "",
  );
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("bike");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [serviceAreas, setServiceAreas] = useState("");
  const [experience, setExperience] = useState("0");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [aadhaarFront, setAadhaarFront] = useState<string | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<string | null>(null);
  const [panCard, setPanCard] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);

  const isApproved =
    scrapperStatus === "approved" || application?.status === "approved";
  const isPending =
    scrapperStatus === "pending" || application?.status === "pending";
  const formLocked = isApproved || isPending;

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await scrapperService.getMyApplication();
        const app = res.data.application as ScrapperApplication | null;
        setApplication(app);
        setScrapperStatus(res.data.scrapperStatus || "none");
        if (res.data.signupBonus) setSignupBonus(res.data.signupBonus);
        if (app) {
          setFullName(app.fullName || fullName);
          setPhone(app.phone || phone);
          setEmail(app.email || email);
          setAadhaar(app.aadhaarNumber || "");
          setPan(app.panNumber || "");
          setVehicleType(app.vehicleType || "bike");
          setVehicleNumber(app.vehicleNumber || "");
          setCity(app.city || "");
          setPincode(app.pincode || "");
          setServiceAreas(app.serviceAreas || "");
          setExperience(String(app.experienceYears ?? 0));
          setAddress(app.address || "");
          setNotes(app.notes || "");
        }
        try {
          const me = await api.get("/api/auth/me");
          if (me.data?.user) setUser(me.data.user);
        } catch {
          /* ignore */
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  const showAlert = (title: string, msg: string) => {
    if (Platform.OS === "web") window.alert(`${title}\n${msg}`);
    else Alert.alert(title, msg);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      showAlert("Login required", "Please login to apply as a scrapper.");
      return;
    }
    if (
      !fullName.trim() ||
      !phone.trim() ||
      !aadhaar.trim() ||
      !pan.trim() ||
      !vehicleNumber.trim() ||
      !city.trim() ||
      !pincode.trim() ||
      !address.trim()
    ) {
      showAlert("Missing fields", "Please fill all required fields marked *");
      return;
    }
    if (aadhaar.replace(/\D/g, "").length !== 12) {
      showAlert("Invalid Aadhaar", "Aadhaar must be 12 digits");
      return;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(pan.trim())) {
      showAlert("Invalid PAN", "PAN format e.g. ABCDE1234F");
      return;
    }
    if (pincode.replace(/\D/g, "").length !== 6) {
      showAlert("Invalid pincode", "Pincode must be 6 digits");
      return;
    }
    if (!aadhaarFront || !aadhaarBack || !panCard) {
      showAlert(
        "KYC required",
        "Upload Aadhaar front, Aadhaar back, and PAN card photos",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await scrapperService.apply({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        aadhaarNumber: aadhaar.replace(/\D/g, ""),
        panNumber: pan.trim().toUpperCase(),
        vehicleType,
        vehicleNumber: vehicleNumber.trim(),
        city: city.trim(),
        pincode: pincode.replace(/\D/g, ""),
        serviceAreas: serviceAreas.trim() || undefined,
        experienceYears: Number(experience) || 0,
        address: address.trim(),
        notes: notes.trim() || undefined,
        aadhaarFront,
        aadhaarBack,
        panCard,
        selfie: selfie || undefined,
      });
      setApplication(res.data.application);
      setScrapperStatus("pending");
      if (user) setUser({ ...user, scrapperStatus: "pending" });
      showAlert(
        "Submitted!",
        "KYC sent to admin. On approval you get ₹" +
          signupBonus +
          " wallet credit. Bank / UPI details add later from Scrapper Wallet.",
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not submit application";
      showAlert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Feather name="arrow-left" size={22} color={colors.neutral.black} />
        </Pressable>
        <Text style={styles.headerTitle}>Become a Scrapper</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <StatusBanner
            application={application}
            scrapperStatus={scrapperStatus}
            signupBonus={signupBonus}
          />

          {isApproved && (
            <View style={styles.approvedActions}>
              <Button
                label="Scrapper Jobs"
                variant="primaryGreen"
                onPress={() => router.push("/(profile)/scrapper-jobs")}
              />
              <Button
                label="My Wallet"
                variant="secondary"
                onPress={() => router.push("/(profile)/scrapper-wallet")}
                style={{ marginTop: spacing.md }}
              />
            </View>
          )}

          {loading ? (
            <ActivityIndicator
              color={colors.primary.green600}
              style={{ marginTop: 40 }}
            />
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {formLocked ? "Submitted Details" : "1. Personal & Vehicle"}
              </Text>

              <Field
                label="Full Name"
                required
                value={fullName}
                onChange={setFullName}
                placeholder="As on Aadhaar"
                editable={!formLocked}
              />
              <Field
                label="Phone"
                required
                value={phone}
                onChange={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!formLocked}
              />
              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!formLocked}
              />
              <Field
                label="Aadhaar Number"
                required
                value={aadhaar}
                onChange={setAadhaar}
                keyboardType="number-pad"
                maxLength={12}
                editable={!formLocked}
              />
              <Field
                label="PAN Number"
                required
                value={pan}
                onChange={(v) => setPan(v.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
                autoCapitalize="characters"
                editable={!formLocked}
              />

              <Text style={styles.fieldLabel}>Vehicle Type *</Text>
              <View style={styles.chipRow}>
                {VEHICLES.map((v) => {
                  const active = vehicleType === v.key;
                  return (
                    <Pressable
                      key={v.key}
                      disabled={formLocked}
                      onPress={() => setVehicleType(v.key)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {v.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Field
                label="Vehicle Number"
                required
                value={vehicleNumber}
                onChange={setVehicleNumber}
                placeholder="MH12AB1234"
                autoCapitalize="characters"
                editable={!formLocked}
              />
              <Field
                label="City"
                required
                value={city}
                onChange={setCity}
                editable={!formLocked}
              />
              <Field
                label="Pincode"
                required
                value={pincode}
                onChange={setPincode}
                keyboardType="number-pad"
                maxLength={6}
                editable={!formLocked}
              />
              <Field
                label="Service Areas"
                value={serviceAreas}
                onChange={setServiceAreas}
                editable={!formLocked}
              />
              <Field
                label="Experience (years)"
                value={experience}
                onChange={setExperience}
                keyboardType="number-pad"
                editable={!formLocked}
              />
              <Field
                label="Full Address"
                required
                value={address}
                onChange={setAddress}
                multiline
                editable={!formLocked}
              />
              <Field
                label="Notes"
                value={notes}
                onChange={setNotes}
                multiline
                editable={!formLocked}
              />

              {!formLocked && (
                <View style={styles.bankLaterNote}>
                  <Feather
                    name="info"
                    size={16}
                    color={colors.primary.green700}
                  />
                  <Text style={styles.bankLaterText}>
                    Bank account / UPI details are not needed now. After admin
                    approves you as a scrapper, add them from{" "}
                    <Text style={{ fontWeight: "700" }}>Scrapper Wallet</Text>.
                  </Text>
                </View>
              )}

              {!formLocked && (
                <>
                  <Text style={styles.sectionTitle}>2. KYC Documents</Text>
                  <Text style={styles.kycHint}>
                    Clear photos of original documents. Max ~2MB each.
                  </Text>
                  <View style={styles.docGrid}>
                    <DocPicker
                      label="Aadhaar Front"
                      required
                      uri={aadhaarFront}
                      onPick={async () => {
                        const u = await pickImageAsDataUri();
                        if (u) setAadhaarFront(u);
                      }}
                    />
                    <DocPicker
                      label="Aadhaar Back"
                      required
                      uri={aadhaarBack}
                      onPick={async () => {
                        const u = await pickImageAsDataUri();
                        if (u) setAadhaarBack(u);
                      }}
                    />
                    <DocPicker
                      label="PAN Card"
                      required
                      uri={panCard}
                      onPick={async () => {
                        const u = await pickImageAsDataUri();
                        if (u) setPanCard(u);
                      }}
                    />
                    <DocPicker
                      label="Selfie (optional)"
                      uri={selfie}
                      onPick={async () => {
                        const u = await pickImageAsDataUri();
                        if (u) setSelfie(u);
                      }}
                    />
                  </View>

                  <Button
                    label={
                      application?.status === "rejected"
                        ? "Re-apply with KYC"
                        : "Submit Application + KYC"
                    }
                    variant="primaryGreen"
                    loading={submitting}
                    onPress={handleSubmit}
                    style={{ marginTop: spacing.lg }}
                  />
                </>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    ...typography.h3,
    color: colors.neutral.black,
    textAlign: "center",
  },
  content: { padding: spacing.xl, paddingBottom: 48 },
  sectionTitle: {
    ...typography.h3,
    color: colors.neutral.black,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  kycHint: {
    ...typography.caption,
    color: colors.neutral.gray400,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  bankLaterNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.primary.green50,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.primary.green100,
  },
  bankLaterText: {
    ...typography.caption,
    color: colors.primary.green700,
    flex: 1,
    lineHeight: 18,
  },
  fieldWrap: { marginBottom: spacing.lg },
  fieldLabel: {
    ...typography.bodySmMedium,
    color: colors.neutral.black,
    marginBottom: spacing.sm,
  },
  input: {
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
    paddingHorizontal: spacing.lg,
    ...typography.body,
    color: colors.neutral.black,
    backgroundColor: colors.neutral.white,
  },
  inputMulti: {
    height: 100,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  inputFocused: { borderColor: colors.primary.green600 },
  inputDisabled: { backgroundColor: colors.neutral.gray100 },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
  },
  chipActive: {
    borderColor: colors.primary.green600,
    backgroundColor: colors.primary.green50,
  },
  chipText: { ...typography.bodySmMedium, color: colors.neutral.gray600 },
  chipTextActive: { color: colors.primary.green700 },
  docGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  docBox: {
    width: "47%",
    aspectRatio: 1.2,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
    borderStyle: "dashed",
    overflow: "hidden",
    backgroundColor: colors.neutral.gray50,
  },
  docBoxDone: { borderStyle: "solid", borderColor: colors.primary.green200 },
  docEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
  },
  docLabel: {
    ...typography.bodySmMedium,
    color: colors.neutral.black,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  docHint: { ...typography.caption, color: colors.neutral.gray400 },
  docPreview: { width: "100%", height: "100%" },
  docReplace: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 4,
  },
  docReplaceText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
  banner: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    marginBottom: spacing.xl,
    alignItems: "flex-start",
    ...shadows.sm,
  },
  bannerSuccess: {
    backgroundColor: colors.primary.green50,
    borderWidth: 1,
    borderColor: colors.primary.green100,
  },
  bannerWarn: {
    backgroundColor: colors.functional.warningBg,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  bannerError: {
    backgroundColor: colors.functional.errorBg,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  bannerInfo: {
    backgroundColor: colors.functional.infoBg,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  bannerTitle: {
    ...typography.bodySmMedium,
    fontWeight: "700",
    color: colors.neutral.black,
    marginBottom: 2,
  },
  bannerBody: { ...typography.caption, color: colors.neutral.gray600 },
  approvedActions: { marginBottom: spacing.xl },
});
