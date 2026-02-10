// apps/frontend/hooks/useGeolocation.tsx
import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type LocationData = {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  address?: string;
  isManual?: boolean;
  accuracy?: number;
  timestamp?: number;
};

export type LocationError = {
  code: number;
  message: string;
  action?: string;
};

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'blocked';

export type UseGeolocationReturn = {
  location: LocationData | null;
  loading: boolean;
  error: LocationError | null;
  permissionStatus: PermissionStatus;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
  setManualLocation: (city: string, lat?: number, lng?: number) => Promise<void>;
  isManual: boolean;
  clearManualLocation: () => void;
  checkPermissionStatus: () => Promise<void>;
  showPermissionRationale: () => Promise<boolean>;
};

const LOCATION_STORAGE_KEY = 'user_location';
const PERMISSION_DENIED_KEY = 'location_permission_denied';

export default function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LocationError | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');

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

  const savePermissionDenied = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(PERMISSION_DENIED_KEY, 'true');
    } catch (err) {
      console.error('Error saving permission status:', err);
    }
  };

  const getPermissionDenied = async (): Promise<boolean> => {
    try {
      const denied = await AsyncStorage.getItem(PERMISSION_DENIED_KEY);
      return denied === 'true';
    } catch (err) {
      return false;
    }
  };

  // Check current permission status
  const checkPermissionStatus = async (): Promise<void> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      switch (status) {
        case Location.PermissionStatus.GRANTED:
          setPermissionStatus('granted');
          break;
        case Location.PermissionStatus.DENIED:
          setPermissionStatus('denied');
          break;
        default:
          setPermissionStatus('undetermined');
      }
      
      // Check if user previously denied permission
      const wasDenied = await getPermissionDenied();
      if (wasDenied && status === Location.PermissionStatus.DENIED) {
        setPermissionStatus('blocked');
      }
    } catch (err) {
      console.error('Error checking permission:', err);
    }
  };

  // Show permission rationale (for Android)
  const showPermissionRationale = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const canAskAgain = await Location.canAskAgain();
      return canAskAgain;
    }
    return true;
  };

  // Request permission with proper handling
  const requestPermission = async (): Promise<boolean> => {
    try {
      console.log('📱 Requesting location permission...');
      
      // First check if we should show rationale
      const canAsk = await showPermissionRationale();
      if (!canAsk && Platform.OS === 'android') {
        setPermissionStatus('blocked');
        setError({
          code: 5,
          message: 'Location permission is permanently denied. Please enable it in Settings.',
          action: 'open_settings'
        });
        await savePermissionDenied();
        return false;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📱 Permission status:', status);
      
      switch (status) {
        case Location.PermissionStatus.GRANTED:
          setPermissionStatus('granted');
          setError(null);
          await AsyncStorage.removeItem(PERMISSION_DENIED_KEY);
          console.log('✅ Location permission granted');
          return true;
          
        case Location.PermissionStatus.DENIED:
          setPermissionStatus('denied');
          setError({
            code: 1,
            message: 'Location permission was denied',
            action: 'request_again'
          });
          await savePermissionDenied();
          console.log('❌ Location permission denied');
          return false;
          
        default:
          setPermissionStatus('undetermined');
          return false;
      }
    } catch (err) {
      console.error('❌ Error requesting permission:', err);
      setPermissionStatus('undetermined');
      setError({
        code: 2,
        message: 'Error requesting location permission'
      });
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setIsManual(false);

      // Check permission first
      await checkPermissionStatus();
      
      if (permissionStatus !== 'granted') {
        const hasPermission = await requestPermission();
        if (!hasPermission) {
          setLoading(false);
          return;
        }
      }

      console.log('📍 Getting current location...');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000, // 15 seconds timeout
        distanceInterval: 10 // Minimum change in meters to update
      });

      console.log('📍 Location obtained:', {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy
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
          city: geo[0].city || geo[0].subregion || 'Your Location',
          country: geo[0].country || '',
          address: `${geo[0].city || ''}, ${geo[0].country || ''}`.trim(),
          accuracy: currentLocation.coords.accuracy,
          timestamp: Date.now(),
          isManual: false
        };

        setLocation(newLocation);
        await saveLocation(newLocation);
        console.log('✅ Location saved successfully');
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ Error getting location:', err);
      setLoading(false);
      
      if (err instanceof Error) {
        // Handle specific location errors
        if (err.message.includes('timeout')) {
          setError({
            code: 6,
            message: 'Location request timed out. Please try again.',
            action: 'retry'
          });
        } else if (err.message.includes('not enabled')) {
          setError({
            code: 7,
            message: 'Location services are disabled. Please enable them in Settings.',
            action: 'open_settings'
          });
        } else {
          setError({
            code: 3,
            message: 'Unable to get current location',
            action: 'retry'
          });
        }
      } else {
        setError({
          code: 3,
          message: 'Unable to get current location',
          action: 'retry'
        });
      }
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
        country: reverseGeo[0]?.country || '',
        address: city,
        accuracy: 0,
        timestamp: Date.now(),
        isManual: true
      };

      setLocation(newLocation);
      setIsManual(true);
      await saveLocation(newLocation);
      setLoading(false);
      console.log('📍 Manual location set:', city);
    } catch (err) {
      setLoading(false);
      setError({
        code: 4,
        message: err instanceof Error ? err.message : 'Error setting manual location',
        action: 'retry'
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
      await checkPermissionStatus();
      
      // Load saved location if exists
      const savedLocation = await getSavedLocation();
      if (savedLocation) {
        setLocation(savedLocation);
        setIsManual(savedLocation.isManual || false);
      }
      
      // Only auto-request GPS if permission was previously granted
      if (permissionStatus === 'granted' && !savedLocation?.isManual) {
        await getCurrentLocation();
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  return {
    location,
    loading,
    error,
    permissionStatus,
    requestPermission,
    refreshLocation,
    setManualLocation,
    isManual,
    clearManualLocation,
    checkPermissionStatus,
    showPermissionRationale
  };
}