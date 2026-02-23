import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Plus, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { Game } from '@/types';
import * as Storage from '@/services/storage';
import GameCard from '@/components/GameCard';
import EmptyState from '@/components/EmptyState';

type Filter = 'all' | 'today' | 'week';

export default function GamesFeedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>('all');
  const fabScale = useRef(new Animated.Value(1)).current;

  const gamesQuery = useQuery({
    queryKey: ['games'],
    queryFn: () => Storage.getGames(),
    refetchInterval: 5000,
  });

  const games = gamesQuery.data ?? [];

  const filteredGames = games
    .filter((g) => {
      if (g.city !== user?.city && user?.city) return false;
      const now = Date.now();
      if (g.date < now - 3600000 * 2) return false;

      if (filter === 'today') {
        const today = new Date();
        const gameDate = new Date(g.date);
        return (
          gameDate.getDate() === today.getDate() &&
          gameDate.getMonth() === today.getMonth() &&
          gameDate.getFullYear() === today.getFullYear()
        );
      }
      if (filter === 'week') {
        const weekFromNow = now + 7 * 86400000;
        return g.date <= weekFromNow;
      }
      return true;
    })
    .sort((a, b) => a.date - b.date);

  const handleGamePress = useCallback(
    (game: Game) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/game/${game.id}`);
    },
    [router],
  );

  const handleCreateGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/create-game');
  };

  const handleFilterChange = (f: Filter) => {
    setFilter(f);
    Haptics.selectionAsync();
  };

  const renderGameCard = useCallback(
    ({ item }: { item: Game }) => (
      <GameCard game={item} onPress={() => handleGamePress(item)} />
    ),
    [handleGamePress],
  );

  const keyExtractor = useCallback((item: Game) => item.id, []);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'הכל' },
    { key: 'today', label: 'היום' },
    { key: 'week', label: 'השבוע' },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              שלום, {user?.name || 'שחקן'} 👋
            </Text>
            <View style={styles.cityRow}>
              <MapPin size={13} color={Colors.textSecondary} />
              <Text style={styles.cityText}>{user?.city || 'ירושלים'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.filtersRow}>
          {filters.map((f) => (
            <Pressable
              key={f.key}
              style={[
                styles.filterChip,
                filter === f.key && styles.filterChipActive,
              ]}
              onPress={() => handleFilterChange(f.key)}
              testID={`filter-${f.key}`}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === f.key && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredGames}
        renderItem={renderGameCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={gamesQuery.isRefetching}
            onRefresh={() => gamesQuery.refetch()}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="⚽"
            title="אין משחקים כרגע"
            subtitle="אין משחקים מתוכננים לתקופה זו. צור משחק חדש!"
          />
        }
        testID="games-feed"
      />

      <Pressable
        style={[styles.fab, { bottom: 24 }]}
        onPress={handleCreateGame}
        onPressIn={() => {
          Animated.spring(fabScale, {
            toValue: 0.9,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(fabScale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }).start();
        }}
        testID="create-game-fab"
      >
        <Animated.View
          style={[styles.fabInner, { transform: [{ scale: fabScale }] }]}
        >
          <Plus size={24} color={Colors.textInverse} />
          <Text style={styles.fabText}>משחק חדש</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cityText: {
    fontSize: 13,
    color: Colors.textSecondary,
    writingDirection: 'rtl',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    writingDirection: 'rtl',
  },
  filterChipTextActive: {
    color: Colors.textInverse,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    left: 20,
    alignItems: 'center',
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textInverse,
    writingDirection: 'rtl',
  },
});
