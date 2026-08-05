import { Platform } from 'react-native';

// Helper to safely get Notifications module on native platforms
function getNotifications(): typeof import('expo-notifications') | null {
  if (Platform.OS === 'web') return null;
  try {
    return require('expo-notifications');
  } catch (e) {
    return null;
  }
}

const Notifications = getNotifications();

if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Request notification permissions and get Expo push token
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web' || !Notifications) return null;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission denied');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'lifelink-emergency-app',
    })).data;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('emergency-alerts', {
        name: '🚨 Emergency Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 400, 200, 400],
        lightColor: '#FF3B5C',
        sound: 'default',
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      await Notifications.setNotificationChannelAsync('updates', {
        name: 'LifeLink Updates',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    return token;
  } catch (err) {
    console.error('Failed to get push token:', err);
    return null;
  }
}

/**
 * Send an emergency alert push notification to matched donors
 */
export async function sendEmergencyPushAlert(
  donorTokens: string[],
  requestData: {
    id: string;
    bloodType: string;
    hospitalName: string;
    unitsNeeded: number;
    urgency: string;
  }
): Promise<unknown> {
  if (!donorTokens || donorTokens.length === 0) return null;

  const messages = donorTokens.map((token) => ({
    to: token,
    channelId: 'emergency-alerts',
    title: `🚨 EMERGENCY: ${requestData.bloodType} Blood Needed`,
    body: `${requestData.hospitalName} needs ${requestData.unitsNeeded} unit(s) urgently • ${requestData.urgency.toUpperCase()}`,
    sound: 'default',
    priority: 'high',
    data: {
      type: 'EMERGENCY_REQUEST',
      requestId: requestData.id,
      bloodType: requestData.bloodType,
      hospitalName: requestData.hospitalName,
    },
    badge: 1,
  }));

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });
    const result = await response.json();
    console.log('Push notification sent:', result);
    return result;
  } catch (err) {
    console.error('Push notification failed:', err);
    return null;
  }
}

/**
 * Send a status update notification to a hospital
 */
export async function sendDonorResponseNotification(
  hospitalToken: string,
  updateData: {
    donorName: string;
    bloodType: string;
    eta: string;
    requestId: string;
  }
): Promise<void> {
  if (!hospitalToken) return;

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        to: hospitalToken,
        channelId: 'updates',
        title: `✅ Donor Responding: ${updateData.donorName}`,
        body: `${updateData.bloodType} donor is en route — ETA ~${updateData.eta}`,
        data: { type: 'DONOR_RESPONSE', requestId: updateData.requestId },
      }),
    });
  } catch (err) {
    console.error('Hospital notification failed:', err);
  }
}

/**
 * Schedule a local eligibility reminder notification
 */
export async function scheduleEligibilityReminder(daysUntilEligible: number): Promise<void> {
  if (Platform.OS === 'web' || !Notifications) return;
  const triggerSeconds = daysUntilEligible * 86400;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🩸 You Can Donate Again!',
      body: 'Your 56-day rest period is complete. Ready to save another life?',
      sound: 'default',
    },
    trigger: { seconds: triggerSeconds },
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web' || !Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export const registerForPushNotificationsAsync = registerForPushNotifications;
