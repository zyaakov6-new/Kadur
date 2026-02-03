import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_LOCATION } from '@/constants';
import { useGamesStore } from '@/store';

// Stub implementation for Expo Go compatibility
// Replace with actual expo-location implementation for production builds

interface LocationState {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface UseLocationReturn {
  location: LocationState;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  setManualLocation: (lat: number, lng: number) => void;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationState>(DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(true);

  const { setUserLocation } = useGamesStore();

  const requestPermission = useCallback(async (): Promise<boolean> => {
    // Stub - using default location
    console.log('[Location] Using default location (Tel Aviv) for Expo Go');
    setHasPermission(true);
    return true;
  }, []);

  const getCurrentLocation = useCallback(async () => {
    // Stub - use default location for Expo Go
    console.log('[Location] getCurrentLocation - using default location');
    setLocation(DEFAULT_LOCATION);
    setUserLocation(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    setIsLoading(false);
  }, [setUserLocation]);

  const setManualLocation = useCallback(
    (lat: number, lng: number) => {
      const newLocation: LocationState = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setLocation(newLocation);
      setUserLocation(lat, lng);
    },
    [setUserLocation]
  );

  // Initialize with default location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    location,
    isLoading,
    error,
    hasPermission,
    requestPermission,
    getCurrentLocation,
    setManualLocation,
  };
}

// Stub for watching location changes
export function useLocationWatch(enabled: boolean = false) {
  const { setUserLocation } = useGamesStore();

  useEffect(() => {
    if (enabled) {
      console.log('[Location] Location watch not available in Expo Go stub');
      // Use default location
      setUserLocation(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    }
  }, [enabled, setUserLocation]);
}
