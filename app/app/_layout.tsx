import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore, useThemeStore } from '@/store';
import { Colors } from '@/constants';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialize: initAuth, isInitialized: authInitialized } = useAuthStore();
  const { initialize: initTheme, theme } = useThemeStore();

  useEffect(() => {
    // Initialize stores
    initTheme();
    initAuth();
  }, []);

  useEffect(() => {
    // Hide splash screen when auth is initialized
    if (authInitialized) {
      SplashScreen.hideAsync();
    }
  }, [authInitialized]);

  if (!authInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="game/[id]"
            options={{
              presentation: 'card',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="game/create"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="chat/[gameId]"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
