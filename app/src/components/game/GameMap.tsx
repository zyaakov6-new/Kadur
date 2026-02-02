import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';
import { useThemeStore } from '@/store';
import { GameWithOrganizer } from '@/types/database';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants';

// Default location (Petah Tikva, Israel)
const DEFAULT_LOCATION = {
  latitude: 32.0853,
  longitude: 34.8878,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

interface GameMapProps {
  games: GameWithOrganizer[];
  region?: Region;
  onRegionChange?: (region: Region) => void;
  onGamePress?: (game: GameWithOrganizer) => void;
  selectedGameId?: string;
  showUserLocation?: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
}

export function GameMap({
  games,
  region = DEFAULT_LOCATION,
  onRegionChange,
  onGamePress,
  selectedGameId,
  showUserLocation = true,
  userLocation,
}: GameMapProps) {
  const { theme } = useThemeStore();
  const mapRef = useRef<MapView>(null);

  const getMarkerColor = (game: GameWithOrganizer): string => {
    if (game.id === selectedGameId) return Colors.primary[500];
    if (game.status === 'full') return Colors.warning;
    return Colors.football[400];
  };

  const handleMarkerPress = useCallback(
    (game: GameWithOrganizer) => {
      onGamePress?.(game);

      // Center map on the selected game
      if (game.location_lat && game.location_lng) {
        mapRef.current?.animateToRegion(
          {
            latitude: game.location_lat,
            longitude: game.location_lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          300
        );
      }
    },
    [onGamePress]
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        {games.map((game) => {
          if (!game.location_lat || !game.location_lng) return null;

          return (
            <Marker
              key={game.id}
              coordinate={{
                latitude: game.location_lat,
                longitude: game.location_lng,
              }}
              onPress={() => handleMarkerPress(game)}
            >
              <View
                style={[
                  styles.markerContainer,
                  { backgroundColor: getMarkerColor(game) },
                ]}
              >
                <MapPin size={16} color="#FFFFFF" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Games count overlay */}
      <View style={styles.gamesCount}>
        <Text style={styles.gamesCountText}>
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
  return (
    <View style={styles.miniMapContainer}>
      <MapView
        style={styles.miniMap}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker
          coordinate={{ latitude, longitude }}
        >
          <View style={styles.miniMarker}>
            <MapPin size={20} color={Colors.football[400]} />
          </View>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  miniMapContainer: {
    height: 150,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  miniMap: {
    flex: 1,
  },
  miniMarker: {
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
