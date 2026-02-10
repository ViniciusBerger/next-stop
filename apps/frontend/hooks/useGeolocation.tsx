import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LocationData = {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  address?: string;
  isManual?: boolean;
};

export type LocationError = {
  code: number;
  message: string;
};

export type UseGeolocationReturn = {
  location: LocationData | null;
  loading: boolean;
  error: LocationError | null;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
  setManualLocation: (city: string, lat?: number, lng?: number) => Promise<void>;
  isManual: boolean;
  clearManualLocation: () => void;
};

const LOCATION_STORAGE_KEY = 'user_location';

export default function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LocationError | null>(null);
  const [isManual, setIsManual] = useState(false);

  // Storage functions
  const saveLocation = async (loc: LocationData): Promise<void> => {
    try {
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
    } catch (err) {
      console.error('Error saving location:', err);
    }
  };

  const getSavedLocation = async (): Promise<LocationData | null> => {
    try {
      const saved = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error('Error getting saved location:', err);
      return null;
    }
  };

  const clearSavedLocation = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
    } catch (err) {
      console.error('Error clearing location:', err);
    }
  };

  // Load saved location from storage
  const loadSavedLocation = useCallback(async () => {
    try {
      const savedLocation = await getSavedLocation();
      if (savedLocation) {
        setLocation(savedLocation);
        setIsManual(savedLocation.isManual || false);
      }
    } catch (err) {
      console.log('Error loading saved location:', err);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setError(null);
        return true;
      } else {
        setError({
          code: 1,
          message: 'Location permission denied'
        });
        return false;
      }
    } catch (err) {
      setError({
        code: 2,
        message: 'Error requesting permission'
      });
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setIsManual(false);

      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000
      });

      // Reverse geocode to get city name
      const geo = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });

      if (geo.length > 0) {
        const newLocation: LocationData = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          city: geo[0].city || geo[0].subregion || 'Unknown City',
          country: geo[0].country || 'Unknown Country',
          address: `${geo[0].city || ''}, ${geo[0].country || ''}`.trim(),
          isManual: false
        };

        setLocation(newLocation);
        await saveLocation(newLocation);
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError({
        code: 3,
        message: 'Unable to get current location'
      });
    }
  };

  const setManualLocation = async (city: string, lat?: number, lng?: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      let latitude = lat;
      let longitude = lng;

      // If no coordinates provided, geocode the city name
      if (!latitude || !longitude) {
        const geo = await Location.geocodeAsync(city);
        
        if (geo.length === 0) {
          throw new Error('City not found');
        }

        latitude = geo[0].latitude;
        longitude = geo[0].longitude;
      }

      // Reverse geocode to get full address
      const reverseGeo = await Location.reverseGeocodeAsync({
        latitude: latitude!,
        longitude: longitude!
      });

      const newLocation: LocationData = {
        latitude: latitude!,
        longitude: longitude!,
        city: reverseGeo[0]?.city || city,
        country: reverseGeo[0]?.country || 'Unknown',
        address: city,
        isManual: true
      };

      setLocation(newLocation);
      setIsManual(true);
      await saveLocation(newLocation);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError({
        code: 4,
        message: err instanceof Error ? err.message : 'Error setting manual location'
      });
    }
  };

  const clearManualLocation = async (): Promise<void> => {
    setIsManual(false);
    await clearSavedLocation();
    await getCurrentLocation();
  };

  const refreshLocation = async (): Promise<void> => {
    if (isManual) {
      // Don't refresh manual location automatically
      return;
    }
    await getCurrentLocation();
  };

  // Initialize
  useEffect(() => {
    const init = async () => {
      await loadSavedLocation();
      await getCurrentLocation();
    };
    init();
  }, []);

  return {
    location,
    loading,
    error,
    requestPermission,
    refreshLocation,
    setManualLocation,
    isManual,
    clearManualLocation
  };
}