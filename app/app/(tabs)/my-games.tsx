import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Calendar, Clock } from 'lucide-react-native';
import { useThemeStore, useGamesStore, useAuthStore } from '@/store';
import { useAnalytics } from '@/hooks/useAnalytics';
import { GameCard } from '@/components/game';
import { Loading, EmptyState, Button, CardSkeletonList } from '@/components/ui';
import { GameWithOrganizer } from '@/types/database';
import { Colors, FontSizes, Spacing, Shadows, BorderRadius } from '@/constants';

type TabType = 'organized' | 'joined' | 'past';

export default function MyGamesScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { profile, session } = useAuthStore();
  const {
    myOrganizedGames,
    myJoinedGames,
    isLoading,
    isRefreshing,
    fetchMyGames,
  } = useGamesStore();
  const { logScreenView } = useAnalytics();

  const [activeTab, setActiveTab] = useState<TabType>('organized');

  useEffect(() => {
    logScreenView('my_games');
  }, []);

  useEffect(() => {
    if (profile?.id) {
      fetchMyGames(profile.id);
    }
  }, [profile?.id]);

  const handleRefresh = useCallback(() => {
    if (profile?.id) {
      fetchMyGames(profile.id);
    }
  }, [profile?.id, fetchMyGames]);

  const handleGamePress = useCallback(
    (game: GameWithOrganizer) => {
      router.push(`/game/${game.id}`);
    },
    [router]
  );

  const handleCreateGame = useCallback(() => {
    router.push('/game/create');
  }, [router]);

  // Filter games based on tab
  const getGamesForTab = (): GameWithOrganizer[] => {
    const today = new Date().toISOString().split('T')[0];

    switch (activeTab) {
      case 'organized':
        return myOrganizedGames.filter((g) => g.date >= today);
      case 'joined':
        return myJoinedGames.filter((g) => g.date >= today);
      case 'past':
        return [...myOrganizedGames, ...myJoinedGames].filter(
          (g) => g.date < today
        );
      default:
        return [];
    }
  };

  const games = getGamesForTab();

  // Not logged in state
  if (!session) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['top']}
      >
        <EmptyState
          icon={<Calendar size={64} color={theme.colors.muted} />}
          title="התחבר כדי לראות את המשחקים שלך"
          description="לאחר ההתחברות תוכל לראות את המשחקים שאתה מארגן ומשתתף בהם"
          actionLabel="התחבר"
          onAction={() => router.push('/(auth)/login')}
        />
      </SafeAreaView>
    );
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'organized', label: 'אני מארגן' },
    { key: 'joined', label: 'אני משתתף' },
    { key: 'past', label: 'עבר' },
  ];

  const getEmptyStateForTab = () => {
    switch (activeTab) {
      case 'organized':
        return {
          icon: <Plus size={64} color={theme.colors.muted} />,
          title: 'עדיין לא ארגנת משחקים',
          description: 'צור משחק חדש וזמן חברים לשחק!',
          actionLabel: 'צור משחק',
          onAction: handleCreateGame,
        };
      case 'joined':
        return {
          icon: <Calendar size={64} color={theme.colors.muted} />,
          title: 'עדיין לא הצטרפת למשחקים',
          description: 'חפש משחקים באזורך והצטרף!',
          actionLabel: 'חפש משחקים',
          onAction: () => router.push('/'),
        };
      case 'past':
        return {
          icon: <Clock size={64} color={theme.colors.muted} />,
          title: 'אין משחקים קודמים',
          description: 'המשחקים שהשתתפת בהם יופיעו כאן',
        };
      default:
        return {
          icon: <Calendar size={64} color={theme.colors.muted} />,
          title: 'אין משחקים',
        };
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          המשחקים שלי
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.colors.card }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
              activeTab === tab.key && { borderBottomColor: Colors.primary[500] },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab.key
                      ? Colors.primary[500]
                      : theme.colors.muted,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {isLoading && games.length === 0 ? (
        <View style={styles.loadingContainer}>
          <CardSkeletonList count={3} />
        </View>
      ) : games.length === 0 ? (
        <EmptyState {...getEmptyStateForTab()} />
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GameCard
              game={item}
              onPress={() => handleGamePress(item)}
              showDistance={false}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary[500]}
            />
          }
        />
      )}

      {/* FAB - Create Game (only on organized tab) */}
      {activeTab === 'organized' && (
        <TouchableOpacity
          style={[styles.fab, Shadows.lg]}
          onPress={handleCreateGame}
          activeOpacity={0.8}
        >
          <Plus size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    textAlign: 'right',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
