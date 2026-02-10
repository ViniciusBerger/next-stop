import { TouchableOpacity, View, Text, ActivityIndicator, Alert } from "react-native";
import { useGeolocation } from "../hooks/useGeolocation";
import { useEffect, useState } from "react";

// INLINE STYLES (since your import path is wrong)
const styles = {
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '600' as const,
  }
};

// SIMPLE DISCOVER ICON (since your icon import is wrong)
const DiscoverIcon = () => (
  <View style={{ width: 24, height: 24, backgroundColor: '#007AFF', borderRadius: 6 }} />
);

interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

export function DiscoverCard({ onPress }: { onPress: () => void }) {
  const { location, loading, error, refreshLocation } = useGeolocation();
  const [nearbyCount, setNearbyCount] = useState<number>(0);
  const [isFetchingPlaces, setIsFetchingPlaces] = useState<boolean>(false);

  // Calculate distance between coordinates
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fetch nearby places based on user's location
  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      if (!location || loading) return;
      
      setIsFetchingPlaces(true);
      
      try {
        // TODO: REPLACE WITH YOUR ACTUAL API CALL
        // For now, using test data near the user's location
        const testPlaces: Place[] = [
          { 
            id: '1', 
            name: 'Nearby Place 1', 
            latitude: location.latitude + 0.01, 
            longitude: location.longitude + 0.01 
          },
          { 
            id: '2', 
            name: 'Nearby Place 2', 
            latitude: location.latitude - 0.01, 
            longitude: location.longitude - 0.01 
          },
          { 
            id: '3', 
            name: 'Nearby Place 3', 
            latitude: location.latitude + 0.015, 
            longitude: location.longitude - 0.005 
          },
        ];

        // Filter places within 10km radius
        const nearbyPlaces = testPlaces.filter(place => {
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            place.latitude,
            place.longitude
          );
          return distance <= 10; // 10km radius
        });

        setNearbyCount(nearbyPlaces.length);
        
        // Log for debugging
        console.log('📍 User Location:', location);
        console.log('📍 Nearby Places Found:', nearbyPlaces.length);
        
      } catch (error) {
        console.error('Error fetching places:', error);
        setNearbyCount(0);
      } finally {
        setIsFetchingPlaces(false);
      }
    };

    fetchNearbyPlaces();
  }, [location, loading]);

  // Handle retry when location error occurs
  const handleRetry = () => {
    refreshLocation();
  };

  // Show error state
  if (error) {
    return (
      <TouchableOpacity onPress={handleRetry} activeOpacity={0.8}>
        <View style={[styles.card, { opacity: 0.7 }]}>
          <DiscoverIcon />
          <View>
            <Text style={styles.text}>Location Error</Text>
            <Text style={{ fontSize: 12, color: '#ff6b6b', marginTop: 4 }}>
              Tap to retry
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={() => {
        // Pass location to the next screen if needed
        if (location) {
          console.log('📍 Passing location to Discover screen:', location);
        }
        onPress();
      }} 
      activeOpacity={0.8} 
      disabled={loading || isFetchingPlaces}
    >
      <View style={styles.card}>
        {loading || isFetchingPlaces ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ActivityIndicator size="small" color="#000" />
            <Text style={styles.text}>
              {loading ? 'Getting location...' : 'Loading places...'}
            </Text>
          </View>
        ) : (
          <>
            <DiscoverIcon />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.text}>Discover</Text>
              {location && nearbyCount > 0 && (
                <View style={{
                  backgroundColor: '#007AFF',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  minWidth: 24,
                  alignItems: 'center',
                }}>
                  <Text style={{
                    color: 'white',
                    fontSize: 12,
                    fontWeight: '600',
                  }}>
                    {nearbyCount}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}