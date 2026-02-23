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
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import * as Storage from '@/services/storage';
import { getDateChips, getTimeSlots } from '@/utils/date';
import { simulateGameCreatedNotification } from '@/services/notifications';

const PLAYER_OPTIONS = [10, 12, 14, 16, 20, 22];

export default function CreateGameScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedTimeIdx, setSelectedTimeIdx] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(14);
  const [price, setPrice] = useState('');

  const buttonScale = useRef(new Animated.Value(1)).current;

  const dateChips = getDateChips();
  const timeSlots = getTimeSlots();

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');
      if (!title.trim()) throw new Error('Missing title');
      if (selectedTimeIdx === null) throw new Error('Missing time');
      if (!address.trim()) throw new Error('Missing address');

      const dateBase = new Date(dateChips[selectedDateIdx].timestamp);
      const time = timeSlots[selectedTimeIdx];
      dateBase.setHours(time.hours, time.minutes, 0, 0);

      const game = await Storage.createGame({
        title: title.trim(),
        city: user.city || 'ירושלים',
        creatorId: user.id,
        date: dateBase.getTime(),
        locationAddress: address.trim(),
        maxPlayers,
        pricePerPlayer: parseInt(price) || 0,
        status: 'open',
      });

      await Storage.addParticipant({
        userId: user.id,
        gameId: game.id,
        joinedAt: Date.now(),
        role: 'organizer',
        isFromWaitlist: false,
        userName: user.name,
        userPosition: user.position,
      });

      simulateGameCreatedNotification(game.title);
      return game;
    },
    onSuccess: (game) => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['participants', game.id] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
      setTimeout(() => {
        router.push(`/game/${game.id}`);
      }, 300);
    },
    onError: (error) => {
      Alert.alert('שגיאה', 'נא למלא את כל השדות');
      console.log('[CreateGame] Error:', error);
    },
  });

  const isValid =
    title.trim().length > 0 &&
    selectedTimeIdx !== null &&
    address.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) {
      Alert.alert('שגיאה', 'נא למלא את כל השדות הנדרשים');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createMutation.mutate();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.closeButton}
          onPress={() => router.back()}
          testID="close-btn"
        >
          <X size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>משחק חדש</Text>
        <View style={styles.closeButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>כותרת המשחק</Text>
            <TextInput
              style={styles.input}
              placeholder='למשל: "משחק ערב בבקעה"'
              placeholderTextColor={Colors.textTertiary}
              value={title}
              onChangeText={setTitle}
              textAlign="right"
              testID="title-input"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>תאריך</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {dateChips.map((chip, idx) => (
                <Pressable
                  key={idx}
                  style={[
                    styles.chip,
                    selectedDateIdx === idx && styles.chipSelected,
                  ]}
                  onPress={() => {
                    setSelectedDateIdx(idx);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedDateIdx === idx && styles.chipTextSelected,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>שעה</Text>
            <View style={styles.timeGrid}>
              {timeSlots.map((slot, idx) => (
                <Pressable
                  key={idx}
                  style={[
                    styles.timeChip,
                    selectedTimeIdx === idx && styles.chipSelected,
                  ]}
                  onPress={() => {
                    setSelectedTimeIdx(idx);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedTimeIdx === idx && styles.chipTextSelected,
                    ]}
                  >
                    {slot.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>כתובת / מיקום</Text>
            <View style={styles.addressInputWrap}>
              <MapPin size={18} color={Colors.textTertiary} style={styles.addressIcon} />
              <TextInput
                style={styles.addressInput}
                placeholder="למשל: מגרש בקעה, רחוב אמציה"
                placeholderTextColor={Colors.textTertiary}
                value={address}
                onChangeText={setAddress}
                textAlign="right"
                testID="address-input"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>מקסימום שחקנים</Text>
            <View style={styles.playerGrid}>
              {PLAYER_OPTIONS.map((num) => (
                <Pressable
                  key={num}
                  style={[
                    styles.playerChip,
                    maxPlayers === num && styles.chipSelected,
                  ]}
                  onPress={() => {
                    setMaxPlayers(num);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      maxPlayers === num && styles.chipTextSelected,
                    ]}
                  >
                    {num}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>מחיר לשחקן (₪)</Text>
            <TextInput
              style={styles.input}
              placeholder="0 = חינם"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="number-pad"
              value={price}
              onChangeText={setPrice}
              textAlign="right"
              testID="price-input"
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            onPressIn={() => {
              Animated.spring(buttonScale, {
                toValue: 0.96,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(buttonScale, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
              }).start();
            }}
            disabled={!isValid || createMutation.isPending}
            testID="create-submit-btn"
          >
            <Animated.View
              style={[
                styles.submitButton,
                !isValid && styles.submitButtonDisabled,
                { transform: [{ scale: buttonScale }] },
              ]}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color={Colors.textInverse} />
              ) : (
                <Text style={styles.submitButtonText}>יצירת משחק ⚽</Text>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: Colors.background,
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    writingDirection: 'rtl',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: 10,
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
  chipsScroll: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  chipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    writingDirection: 'rtl',
  },
  chipTextSelected: {
    color: Colors.primary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  addressInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 14,
  },
  addressIcon: {
    marginRight: 8,
  },
  addressInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    writingDirection: 'rtl',
  },
  playerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerChip: {
    width: 56,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
