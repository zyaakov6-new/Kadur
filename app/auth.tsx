import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Phone, Mail, ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

type AuthStep = 'welcome' | 'phone' | 'phone-otp' | 'email';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [step, setStep] = useState<AuthStep>('welcome');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = (nextStep: AuthStep) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handlePhoneSubmit = () => {
    if (phoneNumber.length < 9) {
      Alert.alert('שגיאה', 'נא להזין מספר טלפון תקין');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition('phone-otp');
  };

  const handleOtpSubmit = () => {
    if (otpCode.length < 4) {
      Alert.alert('שגיאה', 'נא להזין קוד אימות בן 4 ספרות');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    signIn.mutate({ provider: 'phone', phoneNumber });
  };

  const handleEmailSubmit = () => {
    if (!email.includes('@') || password.length < 4) {
      Alert.alert('שגיאה', 'נא להזין אימייל וסיסמה תקינים');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    signIn.mutate({ provider: 'email', email });
  };

  const handleGoogleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    signIn.mutate({ provider: 'google', email: 'user@gmail.com' });
  };

  const handleAppleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    signIn.mutate({ provider: 'apple', email: 'user@icloud.com' });
  };

  const isSubmitting = signIn.isPending;

  const renderWelcome = () => (
    <View style={styles.methodsContainer}>
      <Pressable
        style={styles.authButton}
        onPress={() => animateTransition('phone')}
        testID="auth-phone-btn"
      >
        <Phone size={20} color={Colors.text} />
        <Text style={styles.authButtonText}>כניסה עם מספר טלפון</Text>
      </Pressable>

      <Pressable
        style={[styles.authButton, styles.googleButton]}
        onPress={handleGoogleSignIn}
        testID="auth-google-btn"
      >
        <Text style={styles.googleIcon}>G</Text>
        <Text style={styles.authButtonText}>כניסה עם Google</Text>
      </Pressable>

      <Pressable
        style={[styles.authButton, styles.appleButton]}
        onPress={handleAppleSignIn}
        testID="auth-apple-btn"
      >
        <Text style={styles.appleIcon}></Text>
        <Text style={[styles.authButtonText, styles.appleButtonText]}>
          כניסה עם Apple
        </Text>
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>או</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable
        style={styles.authButton}
        onPress={() => animateTransition('email')}
        testID="auth-email-btn"
      >
        <Mail size={20} color={Colors.text} />
        <Text style={styles.authButtonText}>כניסה עם אימייל</Text>
      </Pressable>
    </View>
  );

  const renderPhone = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>מספר טלפון</Text>
      <Text style={styles.formSubtitle}>נשלח לך קוד אימות ב-SMS</Text>
      <TextInput
        style={styles.input}
        placeholder="050-0000000"
        placeholderTextColor={Colors.textTertiary}
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        autoFocus
        textAlign="right"
        testID="phone-input"
      />
      <Pressable
        style={[styles.submitButton, phoneNumber.length < 9 && styles.submitButtonDisabled]}
        onPress={handlePhoneSubmit}
        disabled={phoneNumber.length < 9}
        testID="phone-submit-btn"
      >
        <Text style={styles.submitButtonText}>שלח קוד</Text>
      </Pressable>
    </View>
  );

  const renderOtp = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>קוד אימות</Text>
      <Text style={styles.formSubtitle}>
        הזן את הקוד שנשלח אל {phoneNumber}
      </Text>
      <TextInput
        style={[styles.input, styles.otpInput]}
        placeholder="0000"
        placeholderTextColor={Colors.textTertiary}
        keyboardType="number-pad"
        maxLength={6}
        value={otpCode}
        onChangeText={setOtpCode}
        autoFocus
        textAlign="center"
        testID="otp-input"
      />
      <Text style={styles.otpHint}>
        💡 לצורך הדגמה, הזן כל קוד בן 4+ ספרות
      </Text>
      <Pressable
        style={[styles.submitButton, otpCode.length < 4 && styles.submitButtonDisabled]}
        onPress={handleOtpSubmit}
        disabled={otpCode.length < 4 || isSubmitting}
        testID="otp-submit-btn"
      >
        {isSubmitting ? (
          <ActivityIndicator color={Colors.textInverse} />
        ) : (
          <Text style={styles.submitButtonText}>אימות</Text>
        )}
      </Pressable>
    </View>
  );

  const renderEmail = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>כניסה עם אימייל</Text>
      <TextInput
        style={styles.input}
        placeholder="your@email.com"
        placeholderTextColor={Colors.textTertiary}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        autoFocus
        textAlign="right"
        testID="email-input"
      />
      <TextInput
        style={styles.input}
        placeholder="סיסמה"
        placeholderTextColor={Colors.textTertiary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        textAlign="right"
        testID="password-input"
      />
      <Pressable
        style={[
          styles.submitButton,
          (!email.includes('@') || password.length < 4) &&
            styles.submitButtonDisabled,
        ]}
        onPress={handleEmailSubmit}
        disabled={!email.includes('@') || password.length < 4 || isSubmitting}
        testID="email-submit-btn"
      >
        {isSubmitting ? (
          <ActivityIndicator color={Colors.textInverse} />
        ) : (
          <Text style={styles.submitButtonText}>כניסה</Text>
        )}
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <View style={styles.fieldPattern}>
              <View style={styles.fieldCenterLine} />
              <View style={styles.fieldCircle} />
            </View>
            <Text style={styles.logoEmoji}>⚽</Text>
            <Text style={styles.logoText}>כדור</Text>
            <Text style={styles.tagline}>מצא משחקי כדורגל בירושלים</Text>
          </View>

          <View style={styles.bottomSection}>
            {step !== 'welcome' && (
              <Pressable
                style={styles.backButton}
                onPress={() => animateTransition('welcome')}
                testID="back-btn"
              >
                <ChevronLeft size={20} color={Colors.textSecondary} />
                <Text style={styles.backText}>חזרה</Text>
              </Pressable>
            )}

            <Animated.View style={{ opacity: fadeAnim }}>
              {step === 'welcome' && renderWelcome()}
              {step === 'phone' && renderPhone()}
              {step === 'phone-otp' && renderOtp()}
              {step === 'email' && renderEmail()}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    backgroundColor: Colors.primary,
    paddingTop: 40,
    paddingBottom: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fieldPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldCenterLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  fieldCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logoEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800' as const,
    color: Colors.textInverse,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    writingDirection: 'rtl',
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
    gap: 4,
  },
  backText: {
    fontSize: 14,
    color: Colors.textSecondary,
    writingDirection: 'rtl',
  },
  methodsContainer: {
    gap: 12,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    writingDirection: 'rtl',
  },
  googleButton: {
    borderColor: '#4285F4',
    borderWidth: 1.5,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  appleIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  appleButtonText: {
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginHorizontal: 16,
  },
  formContainer: {
    gap: 14,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    writingDirection: 'rtl',
  },
  otpInput: {
    fontSize: 28,
    letterSpacing: 12,
    fontWeight: '700' as const,
  },
  otpHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textInverse,
  },
});
