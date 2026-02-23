import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LogOut, MapPin, Calendar, Shield } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { getPositionLabel, getPositionEmoji } from '@/utils/positions';
import * as Storage from '@/services/storage';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const gamesQuery = useQuery({
    queryKey: ['games'],
    queryFn: () => Storage.getGames(),
  });

  const participantsQuery = useQuery({
    queryKey: ['allParticipants'],
    queryFn: async () => {
      const games = await Storage.getGames();
      const allP: { gameId: string; userId: string }[] = [];
      for (const g of games) {
        const p = await Storage.getParticipants(g.id);
        allP.push(...p.map((x) => ({ gameId: x.gameId, userId: x.userId })));
      }
      return allP;
    },
  });

  const myGamesCount =
    participantsQuery.data?.filter((p) => p.userId === user?.id).length ?? 0;
  const createdGamesCount =
    gamesQuery.data?.filter((g) => g.creatorId === user?.id).length ?? 0;

  const handleSignOut = () => {
    Alert.alert('התנתקות', 'האם אתה בטוח שברצונך להתנתק?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'התנתק',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          signOut.mutate();
        },
      },
    ]);
  };

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
    : '?';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.cityBadge}>
            <MapPin size={13} color={Colors.primary} />
            <Text style={styles.cityText}>{user.city}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>עמדה</Text>
            <Text style={styles.infoValue}>
              {getPositionEmoji(user.position)} {getPositionLabel(user.position)}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>גיל</Text>
            <Text style={styles.infoValue}>{user.age}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>חשבון</Text>
            <Text style={styles.infoValue}>
              {user.provider === 'phone'
                ? user.phoneNumber ?? 'טלפון'
                : user.provider === 'email'
                  ? user.email ?? 'אימייל'
                  : user.provider === 'google'
                    ? 'Google'
                    : 'Apple'}
            </Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{myGamesCount}</Text>
            <Text style={styles.statLabel}>משחקים שהשתתפתי</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{createdGamesCount}</Text>
            <Text style={styles.statLabel}>משחקים שיצרתי</Text>
          </View>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={handleSignOut}
          testID="logout-btn"
        >
          <LogOut size={18} color={Colors.error} />
          <Text style={styles.logoutText}>התנתקות</Text>
        </Pressable>

        <Text style={styles.version}>Kadur v1.0 — MVP</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.textInverse,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    writingDirection: 'rtl',
    marginBottom: 6,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  cityText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
    writingDirection: 'rtl',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    writingDirection: 'rtl',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    writingDirection: 'rtl',
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    writingDirection: 'rtl',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.borderLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: Colors.error + '30',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.error,
    writingDirection: 'rtl',
  },
  version: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 24,
  },
});
