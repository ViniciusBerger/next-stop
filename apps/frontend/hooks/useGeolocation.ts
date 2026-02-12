import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface UseGeolocationReturn {
  location: LocationCoords | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  };

  const getCurrentLocation = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        setError('Location permission denied');
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to use the Discover feature.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: LocationCoords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy || undefined, // FIXED: Handle null
      };

      setLocation(coords);
    } catch (err) {
      console.error('Error getting location:', err);
      setError('Unable to retrieve location');
      Alert.alert(
        'Location Error',
        'Unable to retrieve your current location. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    location,
    loading,
    error,
    refreshLocation: getCurrentLocation,
  };
};