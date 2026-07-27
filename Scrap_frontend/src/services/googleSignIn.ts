import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { googleConfig, isGoogleConfigDummy } from '../config/google';
import { authService } from './auth';

const GOOGLE_PROFILE_KEY = 'eco_google_profile';

export type GoogleAuthProfile = {
  email: string;
  name: string;
  googleId: string;
  idToken?: string;
};

/**
 * Dummy profile used while Google Client IDs are placeholders.
 * Same device reuses the same profile so login stays consistent.
 */
async function getDummyGoogleProfile(
  preferredName?: string,
): Promise<GoogleAuthProfile> {
  const raw = await AsyncStorage.getItem(GOOGLE_PROFILE_KEY);
  if (raw) {
    const saved = JSON.parse(raw) as GoogleAuthProfile;
    if (preferredName?.trim()) {
      return { ...saved, name: preferredName.trim() };
    }
    return saved;
  }

  const stamp = Date.now().toString().slice(-8);
  const profile: GoogleAuthProfile = {
    googleId: `google_dummy_${stamp}`,
    email: `eco.user${stamp}@gmail.com`,
    name: preferredName?.trim() || 'Google User',
    idToken: `dummy-id-token-${stamp}`,
  };
  await AsyncStorage.setItem(GOOGLE_PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

let configured = false;

async function configureNativeGoogleSignIn() {
  if (configured || isGoogleConfigDummy) return;

  // Native module only works in dev/production builds (not Expo Go web)
  const { GoogleSignin } = await import(
    '@react-native-google-signin/google-signin'
  );

  GoogleSignin.configure({
    webClientId: googleConfig.webClientId,
    iosClientId:
      Platform.OS === 'ios' ? googleConfig.iosClientId : undefined,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });
  configured = true;
}

/**
 * Sign in with Google and exchange profile for app JWT via backend.
 * - Dummy keys → demo profile + /api/auth/google (works without Cloud Console)
 * - Real keys → native Google picker, then same backend endpoint
 */
export async function signInWithGoogle(options?: {
  preferredName?: string;
}): Promise<{ token: string; user: any }> {
  let profile: GoogleAuthProfile;

  if (isGoogleConfigDummy) {
    profile = await getDummyGoogleProfile(options?.preferredName);
  } else {
    try {
      await configureNativeGoogleSignIn();
      const { GoogleSignin, statusCodes } = await import(
        '@react-native-google-signin/google-signin'
      );

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();
      if (response.type !== 'success' || !response.data) {
        const err = new Error('Google sign-in was cancelled');
        (err as any).code = 'GOOGLE_CANCELLED';
        throw err;
      }

      const user = response.data.user;
      let idToken = response.data.idToken ?? undefined;
      if (!idToken) {
        try {
          const tokens = await GoogleSignin.getTokens();
          idToken = tokens.idToken;
        } catch {
          // optional
        }
      }

      profile = {
        googleId: user.id,
        email: user.email,
        name:
          user.name ||
          [user.givenName, user.familyName].filter(Boolean).join(' ') ||
          options?.preferredName ||
          'Google User',
        idToken,
      };
    } catch (e: any) {
      // If native module missing (Expo Go) or bad config, fall back to dummy
      // so app remains usable until real build + real keys are ready.
      if (
        e?.code === 'GOOGLE_CANCELLED' ||
        e?.message?.includes('cancelled') ||
        e?.code === 'SIGN_IN_CANCELLED'
      ) {
        throw e;
      }
      console.warn(
        '[GoogleSignIn] Native sign-in failed, using dummy profile:',
        e?.message || e,
      );
      profile = await getDummyGoogleProfile(options?.preferredName);
    }
  }

  const { data } = await authService.googleAuth({
    email: profile.email,
    name: profile.name,
    googleId: profile.googleId,
    idToken: profile.idToken,
  });

  return {
    token: data.token,
    user: data.user,
  };
}

export function getGoogleSetupHint(): string {
  if (isGoogleConfigDummy) {
    return 'Using dummy Google keys (dev). Replace EXPO_PUBLIC_GOOGLE_* in .env with real Client IDs.';
  }
  return 'Using real Google Client IDs from .env';
}
