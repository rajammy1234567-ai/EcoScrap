/**
 * Google Sign-In config.
 * Replace EXPO_PUBLIC_GOOGLE_* values in `.env` with real Client IDs from
 * Google Cloud Console — no code changes needed after that.
 *
 * Dummy / placeholder IDs keep the "Continue with Google" button working
 * in dev (backend demo Google profile). Real IDs switch on native Google Sign-In.
 */

const DUMMY_MARKERS = [
  'REPLACE_ME',
  'dummy',
  'DUMMY',
  'xxxx',
  'XXXX',
  'your-web-client-id',
  'your-android-client-id',
  'your-ios-client-id',
];

function isPlaceholder(value: string | undefined | null): boolean {
  if (!value || !value.trim()) return true;
  const v = value.trim();
  return DUMMY_MARKERS.some((m) => v.includes(m));
}

/** Web OAuth Client ID — used as webClientId for idToken on Android/iOS */
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ||
  '123456789012-dummywebclientid.apps.googleusercontent.com';

/** Android OAuth Client ID (package + SHA-1) — optional for RN Google Sign-In */
export const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() ||
  '123456789012-dummyandroidclientid.apps.googleusercontent.com';

/** iOS OAuth Client ID — optional until iOS Google login is enabled */
export const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ||
  '123456789012-dummyiosclientid.apps.googleusercontent.com';

/**
 * true = keys are still dummy → use in-app demo Google login
 * false = real keys set → use @react-native-google-signin/google-signin
 */
export const isGoogleConfigDummy =
  isPlaceholder(GOOGLE_WEB_CLIENT_ID) ||
  isPlaceholder(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

export const googleConfig = {
  webClientId: GOOGLE_WEB_CLIENT_ID,
  androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  isDummy: isGoogleConfigDummy,
};
