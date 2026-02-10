// apps/frontend/components/ui/discoverCard.tsx
import { 
  TouchableOpacity, 
  View, 
  Text, 
  ActivityIndicator, 
  Alert,
  StyleSheet 
} from "react-native";
import { useGeolocation, LocationData } from "../../hooks/useGeolocation";
import { useEffect, useState } from "react";
import { Ionicons } from '@expo/vector-icons';

interface DiscoverCardProps {
  onPress: () => void;
  showManualLocationModal?: () => void;
}

interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
  type?: string;
  rating?: number;
}

export function DiscoverCard({ onPress, showManualLocationModal }: DiscoverCardProps) {
  const { 
    location, 
    loading, 
    error, 
    refreshLocation, 
    isManual,
    clearManualLocation 
  } = useGeolocation();
  
  const [nearbyCount, setNearbyCount] = useState<number>(0);
  const [isFetchingPlaces, setIsFetchingPlaces] = useState<boolean>(false);
  const [userCity, setUserCity] = useState<string>('');

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

  // Update user city when location changes
  useEffect(() => {
    if (location?.city) {
      setUserCity(location.city);
    } else if (location?.address) {
      setUserCity(location.address);
    }
  }, [location]);

  // Fetch nearby places based on user's location
  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      if (!location) return;
      
      setIsFetchingPlaces(true);
      
      try {
        // Generate realistic test data based on location
        const testPlaces: Place[] = generateTestPlaces(location);
        
        // Filter places within 15km radius
        const nearbyPlaces = testPlaces.filter(place => {
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            place.latitude,
            place.longitude
          );
          place.distance = distance;
          return distance <= 15; // 15km radius
        });

        setNearbyCount(nearbyPlaces.length);
        
        // Log for debugging
        console.log('📍 Location Mode:', isManual ? 'Manual' : 'GPS');
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
  }, [location, isManual]);

  // Handle retry when location error occurs
  const handleRetry = async () => {
    if (error?.code === 1 || error?.code === 3) {
      // Permission or location error - suggest manual input
      Alert.alert(
        "Location Unavailable",
        "We couldn't access your location. Would you like to enter a city manually?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Enter City",
            onPress: () => {
              if (showManualLocationModal) {
                showManualLocationModal();
              }
            }
          }
        ]
      );
    } else {
      await refreshLocation();
    }
  };

  // Handle manual location change
  const handleLocationChange = () => {
    Alert.alert(
      "Change Location",
      isManual 
        ? "Switch back to GPS location or enter a different city?" 
        : "Use GPS location or enter a city manually?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        ...(isManual ? [{
          text: "Use GPS",
          onPress: clearManualLocation
        }] : []),
        {
          text: "Enter City",
          onPress: () => {
            if (showManualLocationModal) {
              showManualLocationModal();
            }
          }
        }
      ]
    );
  };

  // Show error state with manual location option
  if (error) {
    return (
      <TouchableOpacity onPress={handleRetry} activeOpacity={0.8}>
        <View style={[styles.card, { borderColor: '#ff6b6b', borderWidth: 1 }]}>
          <View style={[styles.iconContainer, { backgroundColor: '#ffebee' }]}>
            <Ionicons name="location-off" size={20} color="#ff6b6b" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Location Error</Text>
            <Text style={styles.subtitle}>
              {error.message || 'Unable to access location'}
            </Text>
            <Text style={styles.retryText}>
              Tap to enter location manually
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={() => {
        if (location) {
          console.log('📍 Passing location to Discover screen:', location);
        }
        onPress();
      }} 
      activeOpacity={0.8} 
      disabled={loading || isFetchingPlaces}
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Ionicons 
              name={isManual ? "pin" : "location"} 
              size={20} 
              color="#007AFF" 
            />
          )}
        </View>
        
        <View style={styles.textContainer}>
          {loading || isFetchingPlaces ? (
            <>
              <Text style={styles.title}>
                {loading ? 'Getting location...' : 'Finding places...'}
              </Text>
              <Text style={styles.subtitle}>
                Discovering nearby spots
              </Text>
            </>
          ) : location ? (
            <>
              <View style={styles.locationRow}>
                <Text style={styles.title} numberOfLines={1}>
                  Discover {userCity ? `in ${userCity}` : ''}
                </Text>
                {isManual && (
                  <View style={styles.manualBadge}>
                    <Text style={styles.manualBadgeText}>Manual</Text>
                  </View>
                )}
              </View>
              <Text style={styles.subtitle}>
                {nearbyCount > 0 
                  ? `${nearbyCount} places nearby`
                  : 'Exploring the area'
                }
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Discover Nearby</Text>
              <Text style={styles.subtitle}>
                Enable location to find places
              </Text>
            </>
          )}
        </View>
        
        {location && !loading && (
          <TouchableOpacity 
            onPress={handleLocationChange}
            style={styles.changeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.changeButtonText}>
              {isManual ? 'Change' : 'Switch'}
            </Text>
          </TouchableOpacity>
        )}
        
        {nearbyCount > 0 && !loading && !isFetchingPlaces && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{nearbyCount}</Text>
          </View>
        )}
        
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );
}

// Helper function to generate test places
function generateTestPlaces(userLocation: LocationData): Place[] {
  const placeTypes = [
    'Coffee Shop', 'Restaurant', 'Park', 'Museum', 'Shopping Mall',
    'Hotel', 'Gym', 'Supermarket', 'Cinema', 'Library'
  ];
  
  const places: Place[] = [];
  
  // Generate 8-12 random places
  const placeCount = Math.floor(Math.random() * 5) + 8;
  
  for (let i = 0; i < placeCount; i++) {
    // Generate random offset (up to 0.03 degrees ≈ 3.3km)
    const latOffset = (Math.random() - 0.5) * 0.06;
    const lonOffset = (Math.random() - 0.5) * 0.06;
    
    places.push({
      id: `place_${i}`,
      name: `${placeTypes[i % placeTypes.length]} ${i + 1}`,
      latitude: userLocation.latitude + latOffset,
      longitude: userLocation.longitude + lonOffset,
      type: placeTypes[i % placeTypes.length],
      rating: Math.floor(Math.random() * 5) + 1
    });
  }
  
  return places;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manualBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  manualBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#856404',
  },
  retryText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  changeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});