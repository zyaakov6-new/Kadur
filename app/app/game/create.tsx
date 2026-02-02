import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Globe,
  Lock,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import { useThemeStore, useGamesStore, useAuthStore } from '@/store';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button, Input, Card } from '@/components/ui';
import { GAME_FORMATS, GameFormat } from '@/types/database';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants';

export default function CreateGameScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { profile } = useAuthStore();
  const { createGame } = useGamesStore();
  const { logGameCreated } = useAnalytics();

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [format, setFormat] = useState<GameFormat>('7x7');
  const [locationText, setLocationText] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('14');
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'יש להזין כותרת למשחק';
    }
    if (!locationText.trim()) {
      newErrors.location = 'יש להזין מיקום';
    }
    if (!maxPlayers || parseInt(maxPlayers) < 2) {
      newErrors.maxPlayers = 'מספר שחקנים מינימלי הוא 2';
    }
    if (parseInt(maxPlayers) > 50) {
      newErrors.maxPlayers = 'מספר שחקנים מקסימלי הוא 50';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!profile?.id) {
      Alert.alert('שגיאה', 'יש להתחבר כדי ליצור משחק');
      return;
    }

    try {
      setIsSubmitting(true);

      const game = await createGame({
        organizer_id: profile.id,
        title: title.trim(),
        game_date: format(date, 'yyyy-MM-dd'),
        start_time: format(time, 'HH:mm:ss'),
        format,
        location_text: locationText.trim(),
        // TODO: Add geocoding for lat/lng
        max_players: parseInt(maxPlayers),
        notes: notes.trim() || null,
        is_public: isPublic,
      });

      logGameCreated(game.id, format, locationText);

      Alert.alert('המשחק נוצר!', 'המשחק נוצר בהצלחה', [
        { text: 'מעולה', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('שגיאה', error.message || 'לא הצלחנו ליצור את המשחק');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatOptions = GAME_FORMATS.map((f) => ({
    ...f,
    maxDefault: f.value === '5x5' ? 10 : f.value === '7x7' ? 14 : 22,
  }));

  const handleFormatChange = (newFormat: GameFormat) => {
    setFormat(newFormat);
    const option = formatOptions.find((f) => f.value === newFormat);
    if (option) {
      setMaxPlayers(option.maxDefault.toString());
    }
  };

  // Quick date options
  const dateOptions = [
    { label: 'היום', date: new Date() },
    { label: 'מחר', date: addDays(new Date(), 1) },
    { label: 'שישי', date: getNextDayOfWeek(5) },
    { label: 'שבת', date: getNextDayOfWeek(6) },
  ];

  function getNextDayOfWeek(dayOfWeek: number): Date {
    const today = new Date();
    const daysUntil = (dayOfWeek - today.getDay() + 7) % 7 || 7;
    return addDays(today, daysUntil);
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            משחק חדש
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Input
            label="כותרת המשחק"
            value={title}
            onChangeText={setTitle}
            placeholder='לדוגמה: "7x7 ערב פתח תקווה"'
            error={errors.title}
          />

          {/* Format */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>פורמט</Text>
            <View style={styles.formatRow}>
              {formatOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.formatButton,
                    {
                      backgroundColor:
                        format === option.value
                          ? Colors.primary[500]
                          : theme.colors.card,
                      borderColor:
                        format === option.value
                          ? Colors.primary[500]
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => handleFormatChange(option.value)}
                >
                  <Text
                    style={[
                      styles.formatText,
                      {
                        color:
                          format === option.value ? '#FFFFFF' : theme.colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>תאריך</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dateRow}>
                {dateOptions.map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.dateChip,
                      {
                        backgroundColor:
                          format(date, 'yyyy-MM-dd') ===
                          format(option.date, 'yyyy-MM-dd')
                            ? Colors.primary[500]
                            : theme.colors.card,
                        borderColor:
                          format(date, 'yyyy-MM-dd') ===
                          format(option.date, 'yyyy-MM-dd')
                            ? Colors.primary[500]
                            : theme.colors.border,
                      },
                    ]}
                    onPress={() => setDate(option.date)}
                  >
                    <Text
                      style={[
                        styles.dateChipText,
                        {
                          color:
                            format(date, 'yyyy-MM-dd') ===
                            format(option.date, 'yyyy-MM-dd')
                              ? '#FFFFFF'
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.dateChip,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={16} color={theme.colors.text} />
                  <Text
                    style={[styles.dateChipText, { color: theme.colors.text }]}
                  >
                    בחר תאריך
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Text style={[styles.selectedDate, { color: theme.colors.muted }]}>
              {format(date, 'EEEE, d בMMMM yyyy', { locale: he })}
            </Text>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              minimumDate={new Date()}
              maximumDate={addDays(new Date(), 30)}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          {/* Time */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>שעה</Text>
            <TouchableOpacity
              style={[
                styles.timeButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={20} color={Colors.primary[500]} />
              <Text style={[styles.timeText, { color: theme.colors.text }]}>
                {format(time, 'HH:mm')}
              </Text>
            </TouchableOpacity>
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour={true}
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) setTime(selectedTime);
              }}
            />
          )}

          {/* Location */}
          <Input
            label="מיקום"
            value={locationText}
            onChangeText={setLocationText}
            placeholder='לדוגמה: "מגרש ספורט פארק פתח תקווה"'
            error={errors.location}
            leftIcon={<MapPin size={20} color={theme.colors.muted} />}
          />

          {/* Max players */}
          <Input
            label="מספר שחקנים מקסימלי"
            value={maxPlayers}
            onChangeText={setMaxPlayers}
            placeholder="14"
            keyboardType="number-pad"
            error={errors.maxPlayers}
            leftIcon={<Users size={20} color={theme.colors.muted} />}
          />

          {/* Notes */}
          <Input
            label="הערות (אופציונלי)"
            value={notes}
            onChangeText={setNotes}
            placeholder="מידע נוסף למשתתפים..."
            multiline
            numberOfLines={3}
            leftIcon={<FileText size={20} color={theme.colors.muted} />}
          />

          {/* Public/Private toggle */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              סוג משחק
            </Text>
            <View style={styles.visibilityRow}>
              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  {
                    backgroundColor: isPublic
                      ? Colors.primary[500]
                      : theme.colors.card,
                    borderColor: isPublic
                      ? Colors.primary[500]
                      : theme.colors.border,
                  },
                ]}
                onPress={() => setIsPublic(true)}
              >
                <Globe
                  size={20}
                  color={isPublic ? '#FFFFFF' : theme.colors.text}
                />
                <Text
                  style={[
                    styles.visibilityText,
                    { color: isPublic ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  פתוח לכולם
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  {
                    backgroundColor: !isPublic
                      ? Colors.warning
                      : theme.colors.card,
                    borderColor: !isPublic
                      ? Colors.warning
                      : theme.colors.border,
                  },
                ]}
                onPress={() => setIsPublic(false)}
              >
                <Lock
                  size={20}
                  color={!isPublic ? '#FFFFFF' : theme.colors.text}
                />
                <Text
                  style={[
                    styles.visibilityText,
                    { color: !isPublic ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  פרטי (אישור נדרש)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Submit button */}
        <View
          style={[
            styles.footer,
            { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border },
          ]}
        >
          <Button
            title="צור משחק"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            fullWidth
          />
        </View>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  formatRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  formatButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  formatText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  dateChipText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  selectedDate: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
    textAlign: 'right',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  timeText: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  visibilityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  visibilityText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
});
