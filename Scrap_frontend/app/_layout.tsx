import { useEffect, useState, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { storage } from "../src/services/storage";
import { useRouter, useSegments } from "expo-router";
import { syncLocationToServer } from "../src/services/location";
import {
  registerPushToken,
  setNotificationNavigationHandler,
  setupNotificationHandler,
} from "../src/services/notifications";

/** Sync GPS + push token while user is logged in (customers & scrapers). */
function LocationAndPushSync() {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const lastSync = useRef(0);

  useEffect(() => {
    setupNotificationHandler().catch(() => null);
    setNotificationNavigationHandler((payload) => {
      const route = payload?.route || payload?.screen || payload?.target;
      const id =
        payload?.id ||
        payload?.pickupId ||
        payload?.scrapId ||
        payload?.notificationId;

      if (route === "notifications") {
        router.push("/(profile)/notifications");
        return;
      }

      if (
        route === "requests" ||
        payload?.type?.includes("pickup") ||
        payload?.type === "pickup_update"
      ) {
        if (id) {
          router.push({ pathname: "/(requests)/detail", params: { id } });
        } else {
          router.push("/(tabs)/requests");
        }
        return;
      }

      router.push("/(tabs)/home");
    });
  }, []);

  const runSync = async () => {
    if (!isAuthenticated || !token) return;
    const now = Date.now();
    // throttle: at most once every 2 minutes
    if (now - lastSync.current < 2 * 60 * 1000) return;
    lastSync.current = now;
    await Promise.all([
      syncLocationToServer().catch(() => null),
      registerPushToken().catch(() => null),
    ]);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    // immediate sync on login
    lastSync.current = 0;
    runSync();

    // refresh every 5 minutes while app is open
    const interval = setInterval(runSync, 5 * 60 * 1000);

    const onAppState = (state: AppStateStatus) => {
      if (state === "active") {
        lastSync.current = 0;
        runSync();
      }
    };
    const sub = AppState.addEventListener("change", onAppState);

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [isAuthenticated, token]);

  return null;
}

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    storage.hasOnboarded().then(setHasOnboarded);
  }, []);

  // Re-read hasOnboarded from storage whenever route changes (catches
  // the case where permissions/splash sets it then navigates away)
  useEffect(() => {
    storage.hasOnboarded().then(setHasOnboarded);
  }, [segments]);

  useEffect(() => {
    if (isLoading || hasOnboarded === null) return;

    const seg = segments[0] as string | undefined;
    const inOnboarding = seg === "(onboarding)";
    const inAuth = seg === "(auth)";
    const atIndex = !seg || seg === "index";

    // Don't redirect if already in auth flow (user came from onboarding)
    if (!hasOnboarded && !inOnboarding && !inAuth && atIndex) {
      router.replace("/(onboarding)/splash1");
    } else if (hasOnboarded && atIndex) {
      router.replace("/(tabs)/home");
    } else if (isAuthenticated && (inAuth || inOnboarding)) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, isLoading, hasOnboarded, segments]);

  return (
    <>
      <LocationAndPushSync />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(location)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(home)" />
        <Stack.Screen name="(requests)" />
        <Stack.Screen name="(profile)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootLayoutNav />
    </AuthProvider>
  );
}
