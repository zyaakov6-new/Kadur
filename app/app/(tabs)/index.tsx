import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Map, List, Plus, Search } from 'lucide-react-native';
import { useThemeStore, useGamesStore, useAuthStore } from '@/store';
import { useLocation } from '@/hooks';
import { useAnalytics } from '@/hooks/useAnalytics';
import { GameCard, GameMap, QuickFilterBar, GameFilters } from '@/components/game';
import { Loading, EmptyState, CardSkeletonList } from '@/components/ui';
import { GameWithOrganizer } from '@/types/database';
import { Colors, FontSizes, Spacing, Shadows, BorderRadius } from '@/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ViewMode = 'list' | 'map';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { session } = useAuthStore();
  const { games, isLoading, isRefreshing, filters, fetchGames, refresh } = useGamesStore();
  const { location, isLoading: locationLoading } = useLocation();
  const { logScreenView } = useAnalytics();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | undefined>();

  useEffect(() => {
    logScreenView('home');
  }, []);

  useEffect(() => {
    if (!locationLoading) {
      fetchGames();
    }
  }, [locationLoading]);

  const handleGamePress = useCallback(
    (game: GameWithOrganizer) => {
      if (viewMode === 'map') {
        setSelectedGameId(game.id);
      }
      router.push(`/game/${game.id}`);
    },
    [viewMode, router]
  );

  const handleCreateGame = useCallback(() => {
    if (!session) {
      router.push('/(auth)/login');
      return;
    }
    router.push('/game/create');
  }, [session, router]);

  const activeFiltersCount = [
    filters.city,
    filters.format,
    filters.date,
    filters.publicOnly,
  ].filter(Boolean).length;

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.colors.text }]}>קדור ⚽</Text>
      <View style={styles.headerActions}>
        {/* View toggle */}
        <View style={[styles.viewToggle, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewMode === 'list' && styles.viewToggleButtonActive,
            ]}
            onPress={() => setViewMode('list')}
          >
            <List
              size={20}
              color={viewMode === 'list' ? Colors.primary[500] : theme.colors.muted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewMode === 'map' && styles.viewToggleButtonActive,
            ]}
            onPress={() => setViewMode('map')}
          >
            <Map
              size={20}
              color={viewMode === 'map' ? Colors.primary[500] : theme.colors.muted}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isLoading && games.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <CardSkeletonList count={4} />
        </View>
      );
    }

    if (games.length === 0) {
      return (
        <EmptyState
          icon={<Search size={64} color={theme.colors.muted} />}
          title="לא נמצאו משחקים"
          description="אין משחקים זמינים באזורך כרגע. נסה לשנות את הסינון או צור משחק חדש!"
          actionLabel="צור משחק חדש"
          onAction={handleCreateGame}
        />
      );
    }

    if (viewMode === 'map') {
      return (
        <View style={styles.mapContainer}>
          <GameMap
            games={games.filter((g) => g.location_lat && g.location_lng)}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            onGamePress={handleGamePress}
            selectedGameId={selectedGameId}
            userLocation={{ latitude: location.latitude, longitude: location.longitude }}
          />

          {/* Selected game card overlay */}
          {selectedGameId && (
            <View style={styles.selectedGameCard}>
              {games
                .filter((g) => g.id === selectedGameId)
                .map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onPress={() => router.push(`/game/${game.id}`)}
                    showDistance={false}
                  />
                ))}
            </View>
          )}
        </View>
      );
    }

    return (
      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GameCard game={item} onPress={() => handleGamePress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={Colors.primary[500]}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {renderHeader()}

      <QuickFilterBar
        onFilterPress={() => setShowFilters(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {renderContent()}

      {/* FAB - Create Game */}
      <TouchableOpacity
        style={[styles.fab, Shadows.lg]}
        onPress={handleCreateGame}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Filter modal */}
      <GameFilters visible={showFilters} onClose={() => setShowFilters(false)} />
    </SafeAreaView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  viewToggleButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  viewToggleButtonActive: {
    backgroundColor: Colors.primary[500] + '20',
  },
  loadingContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  mapContainer: {
    flex: 1,
  },
  selectedGameCard: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.lg,
    right: Spacing.lg,
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
