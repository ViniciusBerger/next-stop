import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import useGeolocation from '@/hooks/useGeolocation';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { location, loading: locationLoading, error: locationError } = useGeolocation();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      // TODO: Replace with your actual authentication check
      // For now, set to false (redirect to login)
      setIsAuthenticated(false);
    };

    checkAuth();
  }, []);

  // Handle location permission issues
  useEffect(() => {
    if (locationError) {
      console.log('Location error in index:', locationError);
    }
  }, [locationError]);

  // Store location when available
  useEffect(() => {
    if (location && !locationLoading) {
      console.log('Location ready in index:', location);
    }
  }, [location, locationLoading]);

  // Show loading while checking auth or getting location
  if (isAuthenticated === null || locationLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Redirect based on authentication
  return isAuthenticated ? (
    <Redirect href="/discover" />
  ) : (
    <Redirect href="/discover" />
  );
}