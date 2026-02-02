import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useThemeStore } from '@/store';
import { GameWithOrganizer } from '@/types/database';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants';

interface GameMapProps {
  games: GameWithOrganizer[];
  region?: any;
  onRegionChange?: (region: any) => void;
  onGamePress?: (game: GameWithOrganizer) => void;
  selectedGameId?: string;
  showUserLocation?: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
}

export function GameMap({ games, onGamePress }: GameMapProps) {
  const { theme } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.placeholder}>
        <MapPin size={48} color={Colors.primary[500]} />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {games.length} משחקים זמינים
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
          עבור לתצוגת רשימה לפרטים
        </Text>
      </View>

      {/* Game list preview */}
      {games.slice(0, 3).map((game) => (
        <TouchableOpacity
          key={game.id}
          style={[styles.gameItem, { borderColor: theme.colors.border }]}
          onPress={() => onGamePress?.(game)}
        >
          <MapPin size={16} color={Colors.football[400]} />
          <Text
            style={[styles.gameText, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {game.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

interface MiniMapProps {
  latitude: number;
  longitude: number;
  title?: string;
}

export function MiniMap({ latitude, longitude, title }: MiniMapProps) {
  const { theme } = useThemeStore();

  return (
    <View style={[styles.miniMapContainer, { backgroundColor: theme.colors.card }]}>
      <MapPin size={24} color={Colors.football[400]} />
      <Text style={[styles.miniMapText, { color: theme.colors.muted }]}>
        {title || 'מיקום המשחק'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  gameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  gameText: {
    flex: 1,
    fontSize: FontSizes.sm,
  },
  miniMapContainer: {
    height: 100,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  miniMapText: {
    fontSize: FontSizes.sm,
  },
});
