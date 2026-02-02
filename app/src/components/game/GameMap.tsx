import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useThemeStore } from '@/store';
import { GameWithOrganizer } from '@/types/database';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants';

// Note: react-native-maps requires a development build
// This is a placeholder for Expo Go testing
// Run `npx expo run:android` or `npx expo run:ios` for full map support

interface GameMapProps {
  games: GameWithOrganizer[];
  region?: any;
  onRegionChange?: (region: any) => void;
  onGamePress?: (game: GameWithOrganizer) => void;
  selectedGameId?: string;
  showUserLocation?: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
}

export function GameMap({
  games,
  onGamePress,
}: GameMapProps) {
  const { theme } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.placeholder}>
        <MapPin size={48} color={Colors.primary[500]} />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          מפה לא זמינה
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
          להפעלת המפה יש לבנות גרסת פיתוח
        </Text>
        <Text style={[styles.command, { color: theme.colors.textSecondary }]}>
          npx expo run:android
        </Text>
      </View>

      {/* Show games count */}
      <View style={styles.gamesCount}>
        <Text style={[styles.gamesCountText, { color: theme.colors.text }]}>
          {games.length} משחקים באזור
        </Text>
      </View>
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
        {title || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  command: {
    fontSize: FontSizes.xs,
    fontFamily: 'monospace',
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: BorderRadius.sm,
  },
  gamesCount: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  gamesCountText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  miniMapContainer: {
    height: 120,
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
