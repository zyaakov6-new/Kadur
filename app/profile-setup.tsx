import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { PlayerPosition } from '@/types';
import { POSITION_LABELS, POSITION_EMOJI } from '@/utils/positions';

const CITIES = ['ירושלים', 'תל אביב', 'חיפה', 'באר שבע', 'אחר'];
const POSITIONS: PlayerPosition[] = ['attack', 'midfield', 'defense', 'goalkeeper'];

export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [city, setCity] = useState('ירושלים');
  const [age, setAge] = useState('');
  const [position, setPosition] = useState<PlayerPosition>('midfield');
  const [showCityPicker, setShowCityPicker] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

  const isValid = name.trim().length >= 2 && parseInt(age) > 10 && parseInt(age) < 80;

  const handleSubmit = () => {
    if (!isValid) {
      Alert.alert('שגיאה', 'נא למלא את כל השדות');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateProfile.mutate({
      name: name.trim(),
      city,
      age: parseInt(age),
      position,
    });
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.emoji}>🏟️</Text>
          <Text style={styles.title}>הגדרת פרופיל</Text>
          <Text style={styles.subtitle}>
            ספר לנו קצת על עצמך כדי שנמצא לך את המשחקים הכי מתאימים
          </Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>שם מלא</Text>
              <TextInput
                style={styles.input}
                placeholder="איך קוראים לך?"
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={setName}
                textAlign="right"
                testID="name-input"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>עיר</Text>
              <Pressable
                style={styles.input}
                onPress={() => setShowCityPicker(!showCityPicker)}
                testID="city-picker"
              >
                <Text style={styles.inputValue}>{city}</Text>
              </Pressable>
              {showCityPicker && (
                <View style={styles.pickerOptions}>
                  {CITIES.map((c) => (
                    <Pressable
                      key={c}
                      style={[
                        styles.pickerOption,
                        city === c && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setCity(c);
                        setShowCityPicker(false);
                        Haptics.selectionAsync();
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          city === c && styles.pickerOptionTextSelected,
                        ]}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>גיל</Text>
              <TextInput
                style={styles.input}
                placeholder="למשל: 25"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
                maxLength={2}
                textAlign="right"
                testID="age-input"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>עמדה מועדפת</Text>
              <View style={styles.positionGrid}>
                {POSITIONS.map((pos) => (
                  <Pressable
                    key={pos}
                    style={[
                      styles.positionChip,
                      position === pos && styles.positionChipSelected,
                    ]}
                    onPress={() => {
                      setPosition(pos);
                      Haptics.selectionAsync();
                    }}
                    testID={`position-${pos}`}
                  >
                    <Text style={styles.positionEmoji}>
                      {POSITION_EMOJI[pos]}
                    </Text>
                    <Text
                      style={[
                        styles.positionChipText,
                        position === pos && styles.positionChipTextSelected,
                      ]}
                    >
                      {POSITION_LABELS[pos]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleSubmit}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!isValid || updateProfile.isPending}
            testID="profile-submit-btn"
          >
            <Animated.View
              style={[
                styles.submitButton,
                !isValid && styles.submitButtonDisabled,
                { transform: [{ scale: buttonScale }] },
              ]}
            >
              {updateProfile.isPending ? (
                <ActivityIndicator color={Colors.textInverse} />
              ) : (
                <Text style={styles.submitButtonText}>בואו נתחיל! ⚽</Text>
              )}
            </Animated.View>
          </Pressable>
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
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    writingDirection: 'rtl',
    textAlign: 'right',
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
  inputValue: {
    fontSize: 16,
    color: Colors.text,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  pickerOptions: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.primaryLight,
  },
  pickerOptionText: {
    fontSize: 15,
    color: Colors.text,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  pickerOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  positionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  positionChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  positionEmoji: {
    fontSize: 16,
  },
  positionChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    writingDirection: 'rtl',
  },
  positionChipTextSelected: {
    color: Colors.primary,
    fontWeight: '700' as const,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textInverse,
    writingDirection: 'rtl',
  },
});
