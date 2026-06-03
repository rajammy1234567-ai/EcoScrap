import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  HAS_ONBOARDED: 'has_onboarded',
  HAS_LOCATION: 'has_location',
};

export const storage = {
  setTokens: async (access: string, refresh: string) => {
    await AsyncStorage.multiSet([
      [KEYS.ACCESS_TOKEN, access],
      [KEYS.REFRESH_TOKEN, refresh],
    ]);
  },
  getAccessToken: () => AsyncStorage.getItem(KEYS.ACCESS_TOKEN),
  getRefreshToken: () => AsyncStorage.getItem(KEYS.REFRESH_TOKEN),
  clearTokens: async () => {
    await AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN]);
  },
  setUser: (user: object) => AsyncStorage.setItem(KEYS.USER, JSON.stringify(user)),
  getUser: async () => {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },
  clearUser: () => AsyncStorage.removeItem(KEYS.USER),
  setOnboarded: () => AsyncStorage.setItem(KEYS.HAS_ONBOARDED, 'true'),
  hasOnboarded: async () => (await AsyncStorage.getItem(KEYS.HAS_ONBOARDED)) === 'true',
  setHasLocation: () => AsyncStorage.setItem(KEYS.HAS_LOCATION, 'true'),
  hasLocation: async () => (await AsyncStorage.getItem(KEYS.HAS_LOCATION)) === 'true',
  clearAll: () => AsyncStorage.clear(),
};
