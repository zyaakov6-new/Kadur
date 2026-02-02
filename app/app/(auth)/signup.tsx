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
import { ArrowRight, User, Mail, Lock } from 'lucide-react-native';
import { useThemeStore, useAuthStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button, Input } from '@/components/ui';
import { Colors, FontSizes, Spacing } from '@/constants';

export default function SignupScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { initialize } = useAuthStore();
  const { logEvent } = useAnalytics();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'יש להזין שם';
    }
    if (!email.trim()) {
      newErrors.email = 'יש להזין אימייל';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'אימייל לא תקין';
    }
    if (!password) {
      newErrors.password = 'יש להזין סיסמה';
    } else if (password.length < 6) {
      newErrors.password = 'סיסמה חייבת להיות לפחות 6 תווים';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'הסיסמאות לא תואמות';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          name: name.trim(),
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't throw - user is still created
        }

        logEvent('signup', { method: 'email' });

        // Check if email confirmation is required
        if (data.session) {
          await initialize();
          router.replace('/(tabs)');
        } else {
          Alert.alert(
            'אימות אימייל',
            'שלחנו לך אימייל לאימות החשבון. לחץ על הקישור באימייל כדי להמשיך.',
            [{ text: 'הבנתי', onPress: () => router.back() }]
          );
        }
      }
    } catch (error: any) {
      Alert.alert('שגיאה', error.message || 'לא הצלחנו ליצור את החשבון');
    } finally {
      setIsLoading(false);
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
            <ArrowRight size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            הרשמה
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              צור חשבון חדש
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              הצטרף לקהילת השחקנים של קדור
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Input
              label="שם מלא"
              value={name}
              onChangeText={setName}
              placeholder="השם שלך"
              autoCapitalize="words"
              error={errors.name}
              leftIcon={<User size={20} color={theme.colors.muted} />}
            />

            <Input
              label="אימייל"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon={<Mail size={20} color={theme.colors.muted} />}
            />

            <Input
              label="סיסמה"
              value={password}
              onChangeText={setPassword}
              placeholder="לפחות 6 תווים"
              isPassword
              error={errors.password}
              leftIcon={<Lock size={20} color={theme.colors.muted} />}
            />

            <Input
              label="אימות סיסמה"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="הזן סיסמה שוב"
              isPassword
              error={errors.confirmPassword}
              leftIcon={<Lock size={20} color={theme.colors.muted} />}
            />

            <Button
              title="צור חשבון"
              onPress={handleSignup}
              isLoading={isLoading}
              fullWidth
              style={styles.submitButton}
            />
          </View>

          {/* Terms */}
          <Text style={[styles.terms, { color: theme.colors.muted }]}>
            בהרשמה אתה מסכים לתנאי השימוש ומדיניות הפרטיות
          </Text>

          {/* Login link */}
          <View style={styles.loginSection}>
            <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
              כבר יש לך חשבון?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.loginLink, { color: Colors.primary[500] }]}>
                התחבר
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  titleSection: {
    marginBottom: Spacing['2xl'],
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.base,
    textAlign: 'right',
  },
  formSection: {
    marginBottom: Spacing.xl,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  terms: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: FontSizes.base,
  },
  loginLink: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
});
