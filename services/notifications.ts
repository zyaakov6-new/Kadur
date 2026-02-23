// TODO: Replace with expo-notifications + Firebase Cloud Functions
// This file stubs push notification logic for the MVP.
// When migrating to Firebase:
// 1. Install expo-notifications
// 2. Request permissions and get Expo push token
// 3. Store pushToken on user document in Firestore
// 4. Create Cloud Functions that send notifications via Expo Push API

import { Platform } from 'react-native';

export async function registerForPushNotifications(): Promise<string | null> {
  console.log('[Notifications] Stub: registerForPushNotifications called');
  // TODO: Implement with expo-notifications:
  // const { status } = await Notifications.requestPermissionsAsync();
  // if (status !== 'granted') return null;
  // const token = await Notifications.getExpoPushTokenAsync();
  // return token.data;
  return 'ExponentPushToken[stub-token]';
}

export function simulateGameCreatedNotification(gameTitle: string): void {
  console.log(`[Notification] Game created: ${gameTitle}`);
  // TODO: Cloud Function → notify users in same city
}

export function simulatePlayerJoinedNotification(
  playerName: string,
  gameTitle: string,
): void {
  console.log(`[Notification] ${playerName} joined: ${gameTitle}`);
  // TODO: Cloud Function → notify organizer
}

export function simulateNewMessageNotification(
  senderName: string,
  gameTitle: string,
): void {
  console.log(`[Notification] New message from ${senderName} in: ${gameTitle}`);
  // TODO: Cloud Function → notify all participants except sender
}

export function simulateGameFullNotification(gameTitle: string): void {
  console.log(`[Notification] Game is full: ${gameTitle}`);
  // TODO: Cloud Function → notify organizer
}
