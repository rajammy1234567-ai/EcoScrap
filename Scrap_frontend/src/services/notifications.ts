import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { api } from './api';
import { storage } from './storage';

let handlerConfigured = false;
let channelsConfigured = false;
let listenersConfigured = false;
let navigationHandler: ((payload: Record<string, any>) => void) | null = null;

function normalizePayload(data?: Record<string, any>): Record<string, any> {
  return (data || {}) as Record<string, any>;
}

function resolveNavigationTarget(payload: Record<string, any>) {
  const route = payload?.route || payload?.screen || payload?.target;
  const id = payload?.id || payload?.pickupId || payload?.scrapId || payload?.notificationId;

  if (route === 'notifications') {
    return { pathname: '/(profile)/notifications' as const };
  }

  if (route === 'requests' || payload?.type?.includes('pickup') || payload?.type === 'pickup_update') {
    return {
      pathname: '/(requests)/detail' as const,
      params: { id: id || '' },
    };
  }

  return { pathname: '/(tabs)/home' as const };
}

function handleNotificationNavigation(payload: Record<string, any> = {}) {
  if (navigationHandler) {
    navigationHandler(payload);
    return;
  }

  const target = resolveNavigationTarget(payload);
  try {
    router.push(target as any);
  } catch {
    Linking.openURL(Linking.createURL('/'));
  }
}

export function setNotificationNavigationHandler(handler: (payload: Record<string, any>) => void) {
  navigationHandler = handler;
}

/** Show alerts when app is open (required once at startup). */
export async function setupNotificationHandler(): Promise<void> {
  if (Platform.OS === 'web' || handlerConfigured) return;
  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (!listenersConfigured) {
      Notifications.addNotificationReceivedListener((notification) => {
        const payload = normalizePayload(notification.request.content.data as Record<string, any>);
        if (__DEV__) console.log('[push] foreground notification', payload);
      });

      Notifications.addNotificationResponseReceivedListener((response) => {
        const payload = normalizePayload(response.notification.request.content.data as Record<string, any>);
        handleNotificationNavigation(payload);
      });

      listenersConfigured = true;
    }

    const lastResponse = await Notifications.getLastNotificationResponseAsync();
    if (lastResponse) {
      const payload = normalizePayload(lastResponse.notification.request.content.data as Record<string, any>);
      handleNotificationNavigation(payload);
    }

    handlerConfigured = true;
  } catch {
    // ignore
  }
}

async function ensureAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android' || channelsConfigured) return;
  const Notifications = await import('expo-notifications');

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Pickup Alerts',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2E7D32',
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });

  await Notifications.setNotificationChannelAsync('pickup_nearby', {
    name: 'Nearby Pickups',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2E7D32',
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });

  await Notifications.setNotificationChannelAsync('pickup_update', {
    name: 'Pickup Updates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 100, 200],
    lightColor: '#2E7D32',
    sound: 'default',
    showBadge: true,
  });

  channelsConfigured = true;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const Notifications = await import('expo-notifications');
  await setupNotificationHandler();
  await ensureAndroidChannels();

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Request permission, get an Expo push token (FCM-backed on Android via google-services.json),
 * and save it to the backend when it changes.
 */
export async function registerPushToken(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const granted = await requestNotificationPermission();
    if (!granted) {
      if (__DEV__) console.warn('[push] permission not granted');
      return null;
    }

    const Notifications = await import('expo-notifications');
    const Constants = await import('expo-constants');
    await ensureAndroidChannels();

    const projectId =
      Constants.default?.expoConfig?.extra?.eas?.projectId ||
      Constants.default?.easConfig?.projectId ||
      '912fc64c-4223-4244-9352-4efe6f3a130a';

    const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
    const pushToken = tokenResult?.data;
    if (!pushToken) {
      if (__DEV__) console.warn('[push] no Expo push token returned');
      return null;
    }

    const storedToken = await storage.getPushToken();
    if (storedToken === pushToken) {
      return pushToken;
    }

    if (__DEV__) console.log('[push] token registered', pushToken.slice(0, 28) + '…');

    await api.put('/api/auth/push-token', {
      pushToken,
      fcmToken: pushToken,
      platform: Platform.OS,
    });
    await storage.setPushToken(pushToken);
    return pushToken;
  } catch (err) {
    if (__DEV__) console.warn('[push] register failed', err);
    return null;
  }
}

export interface AppNotification {
  id: string;
  _id?: string;
  title: string;
  body: string;
  type: string;
  reason?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get('/api/v1/notifications', {
      params: {
        ...params,
        unreadOnly: params?.unreadOnly ? 'true' : undefined,
      },
    }),

  markRead: (id: string) => api.put(`/api/v1/notifications/${id}/read`),

  markAllRead: () => api.put('/api/v1/notifications/read-all'),
};
