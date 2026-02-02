import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';
import { DEFAULT_LOCATION } from '@/constants';
import { useGamesStore } from '@/store';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const { setUserLocation } = useGamesStore();

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        setHasPermission(true);
        return true;
      }

      setHasPermission(false);

      // Show alert with option to open settings
      Alert.alert(
        'הרשאת מיקום',
        'כדי להציג משחקים בקרבתך, יש לאשר הרשאות מיקום בהגדרות',
        [
          { text: 'ביטול', style: 'cancel' },
          {
            text: 'פתח הגדרות',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );

      return false;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setError('שגיאה בבקשת הרשאות מיקום');
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check permission first
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          // Use default location
          setLocation(DEFAULT_LOCATION);
          setUserLocation(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
          return;
        }
      }

      setHasPermission(true);

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLocation: LocationState = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setLocation(newLocation);
      setUserLocation(position.coords.latitude, position.coords.longitude);
    } catch (err: any) {
      console.error('Error getting location:', err);
      setError('לא הצלחנו לקבל את המיקום שלך');

      // Fall back to default location
      setLocation(DEFAULT_LOCATION);
      setUserLocation(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    } finally {
      setIsLoading(false);
    }
  }, [requestPermission, setUserLocation]);

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

  // Initialize on mount
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

// Hook for watching location changes
export function useLocationWatch(enabled: boolean = false) {
  const [subscription, setSubscription] =
    useState<Location.LocationSubscription | null>(null);
  const { setUserLocation } = useGamesStore();

  useEffect(() => {
    if (!enabled) {
      subscription?.remove();
      setSubscription(null);
      return;
    }

    const startWatching = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // 30 seconds
          distanceInterval: 100, // 100 meters
        },
        (position) => {
          setUserLocation(position.coords.latitude, position.coords.longitude);
        }
      );

      setSubscription(sub);
    };

    startWatching();

    return () => {
      subscription?.remove();
    };
  }, [enabled, setUserLocation]);
}
