import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Mail, Lock, Chrome } from 'lucide-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { useThemeStore, useAuthStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button, Input } from '@/components/ui';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { initialize } = useAuthStore();
  const { logEvent } = useAnalytics();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('שגיאה', 'יש למלא אימייל וסיסמה');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      logEvent('login', { method: 'email' });
      await initialize();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('שגיאה', error.message || 'לא הצלחנו להתחבר');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'kadur://auth/callback',
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          'kadur://auth/callback'
        );

        if (result.type === 'success') {
          const url = result.url;
          // Extract tokens from URL and set session
          // This is handled by the auth state listener
          logEvent('login', { method: 'google' });
          await initialize();
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      Alert.alert('שגיאה', error.message || 'לא הצלחנו להתחבר עם Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setIsAppleLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) throw error;

        logEvent('login', { method: 'apple' });
        await initialize();
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED') {
        Alert.alert('שגיאה', error.message || 'לא הצלחנו להתחבר עם Apple');
      }
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={[styles.logo, { color: theme.colors.text }]}>
              קדור ⚽
            </Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              ברוכים הבאים
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              התחבר כדי להצטרף למשחקים ולארגן משחקים חדשים
            </Text>
          </View>

          {/* Social login */}
          <View style={styles.socialSection}>
            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={
                  theme.mode === 'dark'
                    ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                    : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={BorderRadius.button}
                style={styles.appleButton}
                onPress={handleAppleLogin}
              />
            )}

            <Button
              title="התחבר עם Google"
              variant="outline"
              onPress={handleGoogleLogin}
              isLoading={isGoogleLoading}
              leftIcon={<Chrome size={20} color={theme.colors.text} />}
              fullWidth
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[styles.dividerLine, { backgroundColor: theme.colors.border }]}
            />
            <Text style={[styles.dividerText, { color: theme.colors.muted }]}>
              או
            </Text>
            <View
              style={[styles.dividerLine, { backgroundColor: theme.colors.border }]}
            />
          </View>

          {/* Email form */}
          <View style={styles.formSection}>
            <Input
              label="אימייל"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={theme.colors.muted} />}
            />

            <Input
              label="סיסמה"
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              isPassword
              leftIcon={<Lock size={20} color={theme.colors.muted} />}
            />

            <Button
              title="התחבר"
              onPress={handleEmailLogin}
              isLoading={isLoading}
              fullWidth
            />
          </View>

          {/* Sign up link */}
          <View style={styles.signupSection}>
            <Text style={[styles.signupText, { color: theme.colors.textSecondary }]}>
              אין לך חשבון?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={[styles.signupLink, { color: Colors.primary[500] }]}>
                הירשם עכשיו
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.base,
    textAlign: 'center',
  },
  socialSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  appleButton: {
    height: 48,
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSizes.sm,
  },
  formSection: {
    marginBottom: Spacing.xl,
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    fontSize: FontSizes.base,
  },
  signupLink: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
});
