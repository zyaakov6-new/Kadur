import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';
import { useThemeStore } from '@/store';
import { GameWithOrganizer } from '@/types/database';
import { Colors, Spacing, FontSizes, MAP_STYLE, DEFAULT_LOCATION } from '@/constants';

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

  const centerOnUser = useCallback(() => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        300
      );
    }
  }, [userLocation]);

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
        customMapStyle={theme.mode === 'dark' ? MAP_STYLE.dark : MAP_STYLE.light}
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
                  game.id === selectedGameId && styles.selectedMarker,
                ]}
              >
                <View
                  style={[
                    styles.marker,
                    { backgroundColor: getMarkerColor(game) },
                  ]}
                >
                  <Text style={styles.markerText}>
                    {game.current_players}/{game.max_players}
                  </Text>
                </View>
                <View
                  style={[
                    styles.markerArrow,
                    { borderTopColor: getMarkerColor(game) },
                  ]}
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* User location button */}
      {showUserLocation && userLocation && (
        <TouchableOpacity
          style={[styles.locationButton, { backgroundColor: theme.colors.card }]}
          onPress={centerOnUser}
          activeOpacity={0.7}
        >
          <MapPin size={20} color={Colors.primary[500]} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// Mini map for game details
interface MiniMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

export function MiniMap({ latitude, longitude, title }: MiniMapProps) {
  const { theme } = useThemeStore();

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
        rotateEnabled={false}
        pitchEnabled={false}
        customMapStyle={theme.mode === 'dark' ? MAP_STYLE.dark : MAP_STYLE.light}
      >
        <Marker coordinate={{ latitude, longitude }}>
          <View style={styles.miniMapMarker}>
            <MapPin size={24} color={Colors.football[400]} fill={Colors.football[400]} />
          </View>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  selectedMarker: {
    transform: [{ scale: 1.2 }],
  },
  marker: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  locationButton: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  miniMapContainer: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
  },
  miniMap: {
    flex: 1,
  },
  miniMapMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
