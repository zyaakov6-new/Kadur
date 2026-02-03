import { useState, useCallback } from 'react';

// Stub implementation for Expo Go compatibility
// Replace with actual implementation for production builds

interface UseNotificationsReturn {
  expoPushToken: string | null;
  notification: null;
  requestPermission: () => Promise<boolean>;
  sendLocalNotification: (
    title: string,
    body: string,
    data?: object
  ) => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    // Stub - notifications not available in Expo Go
    console.log('[Notifications] Push notifications not available in Expo Go');
    return false;
  }, []);

  const sendLocalNotification = useCallback(
    async (title: string, body: string, data?: object) => {
      // Stub - notifications not available in Expo Go
      console.log('[Notifications] Local notification:', { title, body, data });
    },
    []
  );

  return {
    expoPushToken,
    notification: null,
    requestPermission,
    sendLocalNotification,
  };
}

// Stub function
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: object
) {
  console.log('[Notifications] sendPushNotification stub:', { expoPushToken, title, body, data });
}
