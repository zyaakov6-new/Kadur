import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Phone,
  MapPin,
  Shield,
  Calendar,
  LogOut,
  ChevronLeft,
  Edit2,
  Moon,
  Sun,
  Smartphone,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useThemeStore, useAuthStore } from '@/store';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Avatar, Button, Input, Card } from '@/components/ui';
import {
  PLAYER_POSITIONS,
  CITIES,
  PlayerPosition,
  City,
} from '@/types/database';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants';
import { ThemeMode } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode } = useThemeStore();
  const { profile, session, updateProfile, signOut } = useAuthStore();
  const { logScreenView, logEvent } = useAnalytics();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [position, setPosition] = useState(profile?.position || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');

  useEffect(() => {
    logScreenView('profile');
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setPosition(profile.position || '');
      setAge(profile.age?.toString() || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('שגיאה', 'יש להזין שם');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        city: city || null,
        position: position || null,
        age: age ? parseInt(age) : null,
      });
      logEvent('profile_updated');
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert('שגיאה', 'לא הצלחנו לעדכן את הפרופיל');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('התנתקות', 'האם אתה בטוח שברצונך להתנתק?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'התנתק',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // TODO: Upload to Supabase Storage
      console.log('Selected image:', result.assets[0].uri);
    }
  };

  // Not logged in state
  if (!session) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['top']}
      >
        <View style={styles.notLoggedIn}>
          <User size={80} color={theme.colors.muted} />
          <Text style={[styles.notLoggedInTitle, { color: theme.colors.text }]}>
            היי שחקן!
          </Text>
          <Text
            style={[styles.notLoggedInText, { color: theme.colors.textSecondary }]}
          >
            התחבר כדי לנהל את הפרופיל שלך ולהצטרף למשחקים
          </Text>
          <Button
            title="התחבר"
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const themeModes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'בהיר', icon: <Sun size={20} color={theme.colors.text} /> },
    { value: 'dark', label: 'כהה', icon: <Moon size={20} color={theme.colors.text} /> },
    { value: 'system', label: 'מערכת', icon: <Smartphone size={20} color={theme.colors.text} /> },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>פרופיל</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Edit2 size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickImage} disabled={!isEditing}>
              <Avatar
                source={profile?.profile_photo_url}
                name={profile?.name}
                size="xl"
                showBorder
              />
              {isEditing && (
                <View style={styles.editAvatarBadge}>
                  <Edit2 size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
            {!isEditing && (
              <>
                <Text style={[styles.profileName, { color: theme.colors.text }]}>
                  {profile?.name}
                </Text>
                <Text style={[styles.gamesPlayed, { color: theme.colors.muted }]}>
                  {profile?.games_played || 0} משחקים
                </Text>
              </>
            )}
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <Input
                label="שם"
                value={name}
                onChangeText={setName}
                placeholder="השם שלך"
                leftIcon={<User size={20} color={theme.colors.muted} />}
              />

              <Input
                label="טלפון"
                value={phone}
                onChangeText={setPhone}
                placeholder="050-1234567"
                keyboardType="phone-pad"
                leftIcon={<Phone size={20} color={theme.colors.muted} />}
              />

              <View style={styles.selectContainer}>
                <Text style={[styles.selectLabel, { color: theme.colors.text }]}>
                  עיר
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipRow}>
                    {CITIES.slice(0, 8).map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.chip,
                          {
                            backgroundColor:
                              city === c ? Colors.primary[500] : theme.colors.card,
                            borderColor:
                              city === c ? Colors.primary[500] : theme.colors.border,
                          },
                        ]}
                        onPress={() => setCity(c)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: city === c ? '#FFFFFF' : theme.colors.text },
                          ]}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.selectContainer}>
                <Text style={[styles.selectLabel, { color: theme.colors.text }]}>
                  עמדה
                </Text>
                <View style={styles.chipRow}>
                  {PLAYER_POSITIONS.map((p) => (
                    <TouchableOpacity
                      key={p.value}
                      style={[
                        styles.chip,
                        {
                          backgroundColor:
                            position === p.value
                              ? Colors.football[400]
                              : theme.colors.card,
                          borderColor:
                            position === p.value
                              ? Colors.football[400]
                              : theme.colors.border,
                        },
                      ]}
                      onPress={() => setPosition(p.value)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color:
                              position === p.value ? '#FFFFFF' : theme.colors.text,
                          },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Input
                label="גיל"
                value={age}
                onChangeText={setAge}
                placeholder="25"
                keyboardType="number-pad"
                leftIcon={<Calendar size={20} color={theme.colors.muted} />}
              />

              <View style={styles.editActions}>
                <Button
                  title="ביטול"
                  variant="ghost"
                  onPress={() => setIsEditing(false)}
                  style={styles.editButton}
                />
                <Button
                  title="שמור"
                  onPress={handleSave}
                  isLoading={isSaving}
                  style={styles.editButton}
                />
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <ProfileRow
                icon={<Phone size={20} color={theme.colors.muted} />}
                label="טלפון"
                value={profile?.phone || 'לא צוין'}
              />
              <ProfileRow
                icon={<MapPin size={20} color={theme.colors.muted} />}
                label="עיר"
                value={profile?.city || 'לא צוין'}
              />
              <ProfileRow
                icon={<Shield size={20} color={theme.colors.muted} />}
                label="עמדה"
                value={profile?.position || 'לא צוין'}
              />
              <ProfileRow
                icon={<Calendar size={20} color={theme.colors.muted} />}
                label="גיל"
                value={profile?.age?.toString() || 'לא צוין'}
              />
            </View>
          )}
        </Card>

        {/* Theme Settings */}
        <Card variant="elevated" style={styles.settingsCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            מראה
          </Text>
          <View style={styles.themeOptions}>
            {themeModes.map((mode) => (
              <TouchableOpacity
                key={mode.value}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      themeMode === mode.value
                        ? Colors.primary[500] + '20'
                        : theme.colors.card,
                    borderColor:
                      themeMode === mode.value
                        ? Colors.primary[500]
                        : theme.colors.border,
                  },
                ]}
                onPress={() => setThemeMode(mode.value)}
              >
                {mode.icon}
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color:
                        themeMode === mode.value
                          ? Colors.primary[500]
                          : theme.colors.text,
                    },
                  ]}
                >
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.card }]}
          onPress={handleSignOut}
        >
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>התנתק</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Profile row component
interface ProfileRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function ProfileRow({ icon, label, value }: ProfileRowProps) {
  const { theme } = useThemeStore();

  return (
    <View style={styles.profileRow}>
      {icon}
      <View style={styles.profileRowText}>
        <Text style={[styles.profileRowLabel, { color: theme.colors.muted }]}>
          {label}
        </Text>
        <Text style={[styles.profileRowValue, { color: theme.colors.text }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
  },
  profileCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary[500],
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  gamesPlayed: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  profileInfo: {
    gap: Spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileRowText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  profileRowLabel: {
    fontSize: FontSizes.sm,
    textAlign: 'right',
  },
  profileRowValue: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    textAlign: 'right',
  },
  editForm: {
    marginTop: Spacing.md,
  },
  selectContainer: {
    marginBottom: Spacing.lg,
  },
  selectLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  editButton: {
    minWidth: 100,
  },
  settingsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'right',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  themeOptionText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  logoutText: {
    color: Colors.error,
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  notLoggedIn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  notLoggedInTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  notLoggedInText: {
    fontSize: FontSizes.base,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  loginButton: {
    minWidth: 160,
  },
  bottomPadding: {
    height: 100,
  },
});
