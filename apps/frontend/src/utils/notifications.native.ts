import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import axios from 'axios';
import { API_URL } from '@/src/config/api';

export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function registerPushToken(idToken: string): Promise<void> {
  if (!Device.isDevice) return;
  const { status } = await Notifications.getPermissionsAsync();
  const finalStatus =
    status === 'granted'
      ? status
      : (await Notifications.requestPermissionsAsync()).status;
  if (finalStatus !== 'granted') return;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
  await axios.patch(
    `${API_URL}/user/me/push-token`,
    { expoPushToken },
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
}
