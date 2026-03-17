import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform, Alert, Linking } from 'react-native';
import { showToast } from '@/components/ui/Toast';

type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'undetermined';

interface UseLocationPermissionReturn {
  permissionStatus: PermissionStatus;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<void>;
  openSettings: () => void;
  isLoading: boolean;
}

export const useLocationPermission = (): UseLocationPermissionReturn => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [isLoading, setIsLoading] = useState(false);

  const checkPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      switch (status) {
        case 'granted':
          setPermissionStatus('granted');
          break;
        case 'denied':
          setPermissionStatus('denied');
          break;
        default:
          setPermissionStatus('undetermined');
      }

      // Check if permanently denied on iOS
      if (Platform.OS === 'ios' && status === 'denied') {
        const { canAskAgain } = await Location.getForegroundPermissionsAsync();
        if (!canAskAgain) {
          setPermissionStatus('blocked');
        }
      }
    } catch (error) {
      console.error('Error checking permission:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      
      switch (status) {
        case 'granted':
          setPermissionStatus('granted');
          showToast('Location access granted!', 'success');
          setIsLoading(false);
          return true;
          
        case 'denied':
          if (!canAskAgain) {
            setPermissionStatus('blocked');
            showToast('Location permission permanently denied. Please enable in settings.', 'error');
          } else {
            setPermissionStatus('denied');
            showToast('Location permission denied', 'error');
          }
          setIsLoading(false);
          return false;
          
        default:
          setPermissionStatus('undetermined');
          setIsLoading(false);
          return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      showToast('Failed to request location permission', 'error');
      setIsLoading(false);
      return false;
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return {
    permissionStatus,
    requestPermission,
    checkPermission,
    openSettings,
    isLoading
  };
};