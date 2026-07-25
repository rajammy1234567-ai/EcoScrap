import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { storage } from '../src/services/storage';
import { useRouter, useSegments } from 'expo-router';

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
    const inOnboarding = seg === '(onboarding)';
    const inAuth = seg === '(auth)';
    const atIndex = !seg || seg === 'index';

    // Don't redirect if already in auth flow (user came from onboarding)
    if (!hasOnboarded && !inOnboarding && !inAuth && atIndex) {
      router.replace('/(onboarding)/splash1');
    } else if (hasOnboarded && atIndex) {
      router.replace('/(tabs)/home');
    } else if (isAuthenticated && (inAuth || inOnboarding)) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading, hasOnboarded, segments]);

  return (
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
