import { Platform } from 'react-native';
import { api } from './api';

let handlerConfigured = false;

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
    handlerConfigured = true;
  } catch {
    // ignore
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  // expo-notifications does not support web
  if (Platform.OS === 'web') return false;

  const Notifications = await import('expo-notifications');
  await setupNotificationHandler();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Pickup Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'default',
    });
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/** Request permission, get Expo push token, and save on backend. */
export async function registerPushToken(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    const Notifications = await import('expo-notifications');
    const Constants = await import('expo-constants');

    const projectId =
      Constants.default?.expoConfig?.extra?.eas?.projectId ||
      Constants.default?.easConfig?.projectId ||
      '912fc64c-4223-4244-9352-4efe6f3a130a';

    const tokenResult = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const pushToken = tokenResult?.data;
    if (!pushToken) return null;

    await api.put('/api/auth/push-token', { pushToken });
    return pushToken;
  } catch {
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
