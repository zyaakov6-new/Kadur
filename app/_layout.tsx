import '@/utils/web-polyfills';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nManager, Platform } from 'react-native';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { seedIfNeeded } from '@/services/storage';

SplashScreen.preventAutoHideAsync();

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, isLoading, isProfileComplete } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    seedIfNeeded();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuth = segments[0] === 'auth';
    const inProfileSetup = segments[0] === 'profile-setup';

    if (!user && !inAuth) {
      router.replace('/auth');
    } else if (user && !isProfileComplete && !inProfileSetup) {
      router.replace('/profile-setup');
    } else if (user && isProfileComplete && (inAuth || inProfileSetup)) {
      router.replace('/');
    }

    if (!isReady) {
      setIsReady(true);
      SplashScreen.hideAsync();
    }
  }, [user, isLoading, isProfileComplete, segments]);

  if (!isReady && isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" options={{ gestureEnabled: false }} />
      <Stack.Screen name="profile-setup" options={{ gestureEnabled: false }} />
      <Stack.Screen
        name="create-game"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="game" />
      <Stack.Screen
        name="+not-found"
        options={{ headerShown: true, title: 'לא נמצא' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
