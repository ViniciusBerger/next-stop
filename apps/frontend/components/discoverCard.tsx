// apps/frontend/components/ui/discoverCard.tsx
import { 
  TouchableOpacity, 
  View, 
  Text, 
  ActivityIndicator, 
  Alert,
  StyleSheet,
  Linking
} from "react-native";
import { useGeolocation, LocationData, PermissionStatus } from "../../hooks/useGeolocation";
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
    clearManualLocation,
    permissionStatus,
    requestPermission,
    checkPermissionStatus
  } = useGeolocation();
  
  const [nearbyCount, setNearbyCount] = useState<number>(0);
  const [isFetchingPlaces, setIsFetchingPlaces] = useState<boolean>(false);
  const [userCity, setUserCity] = useState<string>('');
  const [showPermissionAlert, setShowPermissionAlert] = useState<boolean>(false);

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

  // Check permission status on component mount
  useEffect(() => {
    const initPermissionCheck = async () => {
      await checkPermissionStatus();
    };
    initPermissionCheck();
  }, []);

  // Show permission alert if needed
  useEffect(() => {
    if (permissionStatus === 'denied' && !loading && !showPermissionAlert) {
      setShowPermissionAlert(true);
    }
  }, [permissionStatus, loading]);

  // Fetch nearby places based on user's location
  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      if (!location || permissionStatus !== 'granted') return;
      
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
        console.log('📍 Permission Status:', permissionStatus);
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
  }, [location, isManual, permissionStatus]);

  // Handle permission request
  const handleRequestPermission = async (): Promise<boolean> => {
    console.log('📱 Requesting location permission...');
    const granted = await requestPermission();
    
    if (granted) {
      console.log('✅ Permission granted, fetching location...');
      await refreshLocation();
      return true;
    } else {
      console.log('❌ Permission denied');
      
      // Show permission denied alert with manual option
      if (permissionStatus === 'denied' || permissionStatus === 'blocked') {
        Alert.alert(
          "Location Access Needed",
          permissionStatus === 'blocked' 
            ? "Location permission is permanently denied. Please enable it in Settings to use location features."
            : "Location permission was denied. You can enter a city manually or enable location access in Settings.",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            ...(permissionStatus === 'blocked' ? [{
              text: "Open Settings",
              onPress: () => Linking.openSettings()
            }] : [{
              text: "Try Again",
              onPress: async () => {
                const grantedAgain = await requestPermission();
                if (grantedAgain) {
                  await refreshLocation();
                }
              }
            }]),
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
      }
      return false;
    }
  };

  // Handle retry when location error occurs
  const handleRetry = async () => {
    if (error?.code === 1 || permissionStatus === 'denied' || permissionStatus === 'blocked') {
      // Permission-related error
      await handlePermissionError();
    } else if (error?.code === 3 || error?.code === 6) {
      // Location timeout or unavailable
      Alert.alert(
        "Location Unavailable",
        "We couldn't access your location. Would you like to try again or enter a city manually?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Try Again",
            onPress: async () => {
              await refreshLocation();
            }
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
    } else if (showManualLocationModal) {
      // Offer manual location as fallback
      showManualLocationModal();
    } else {
      await refreshLocation();
    }
  };

  // Handle permission-related errors
  const handlePermissionError = async () => {
    if (permissionStatus === 'blocked') {
      Alert.alert(
        "Location Permission Required",
        "Location access is permanently denied. Please enable it in Settings to use location features.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings()
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
      const granted = await handleRequestPermission();
      if (!granted && showManualLocationModal) {
        // After permission denial, offer manual input
        setTimeout(() => {
          Alert.alert(
            "Location Access Denied",
            "You can still discover places by entering a city manually.",
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
        }, 500);
      }
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

  // Get appropriate icon and color based on permission/location state
  const getLocationIcon = () => {
    if (loading) return { name: 'location', color: '#666' };
    if (error) return { name: 'location-off', color: '#FF3B30' };
    if (isManual) return { name: 'pin', color: '#FF9500' };
    if (permissionStatus === 'granted') return { name: 'location', color: '#007AFF' };
    if (permissionStatus === 'denied') return { name: 'location-off', color: '#FF3B30' };
    return { name: 'location-outline', color: '#666' };
  };

  // Get appropriate subtitle based on state
  const getSubtitle = () => {
    if (loading) return 'Getting your location...';
    if (isFetchingPlaces) return 'Finding nearby places...';
    if (error) return error.message || 'Location error';
    if (location) {
      if (nearbyCount > 0) return `${nearbyCount} places nearby`;
      return 'Exploring the area';
    }
    if (permissionStatus === 'denied') return 'Location access denied';
    if (permissionStatus === 'blocked') return 'Enable location in Settings';
    return 'Enable location to find places';
  };

  // Get appropriate title based on state
  const getTitle = () => {
    if (loading) return 'Discover';
    if (error && error.code === 1) return 'Permission Needed';
    if (error && error.code === 5) return 'Location Blocked';
    if (error) return 'Location Error';
    if (location && userCity) return `Discover in ${userCity}`;
    if (permissionStatus === 'denied') return 'Location Access';
    return 'Discover Nearby';
  };

  // Show permission banner when permission is denied
  const renderPermissionBanner = () => {
    if (permissionStatus !== 'denied' && permissionStatus !== 'blocked') return null;
    
    return (
      <View style={[
        styles.permissionBanner,
        permissionStatus === 'blocked' ? styles.blockedBanner : styles.deniedBanner
      ]}>
        <Ionicons 
          name={permissionStatus === 'blocked' ? 'settings' : 'warning'} 
          size={16} 
          color={permissionStatus === 'blocked' ? '#FF9500' : '#FF3B30'} 
        />
        <Text style={styles.permissionBannerText}>
          {permissionStatus === 'blocked' 
            ? 'Location is blocked. Enable in Settings.' 
            : 'Location access denied. Tap to enable.'}
        </Text>
      </View>
    );
  };

  // Handle card press with permission check
  const handleCardPress = async () => {
    // If no permission yet, request it first
    if (permissionStatus === 'undetermined') {
      const granted = await handleRequestPermission();
      if (!granted) return;
    }
    
    // If permission denied, show options
    if (permissionStatus === 'denied' || permissionStatus === 'blocked') {
      await handlePermissionError();
      return;
    }
    
    // If location error, handle it
    if (error) {
      await handleRetry();
      return;
    }
    
    // Otherwise, proceed to discover screen
    if (location) {
      console.log('📍 Passing location to Discover screen:', location);
    }
    onPress();
  };

  const icon = getLocationIcon();

  return (
    <>
      {renderPermissionBanner()}
      
      <TouchableOpacity 
        onPress={handleCardPress} 
        activeOpacity={0.8} 
        disabled={loading || isFetchingPlaces}
        style={styles.cardContainer}
      >
        <View style={[
          styles.card,
          (error || permissionStatus === 'denied' || permissionStatus === 'blocked') && styles.errorCard,
          loading && styles.loadingCard
        ]}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: getIconBackgroundColor(icon.color) }
          ]}>
            {loading ? (
              <ActivityIndicator size="small" color={icon.color} />
            ) : (
              <Ionicons name={icon.name as any} size={20} color={icon.color} />
            )}
          </View>
          
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {getTitle()}
              </Text>
              {isManual && (
                <View style={styles.manualBadge}>
                  <Text style={styles.manualBadgeText}>Manual</Text>
                </View>
              )}
            </View>
            <Text style={styles.subtitle}>
              {getSubtitle()}
            </Text>
          </View>
          
          {!loading && !isFetchingPlaces && (
            <>
              {location && permissionStatus === 'granted' && (
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
              
              {nearbyCount > 0 && location && permissionStatus === 'granted' && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{nearbyCount}</Text>
                </View>
              )}
            </>
          )}
          
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={
              error || permissionStatus === 'denied' || permissionStatus === 'blocked' 
                ? '#FF3B30' 
                : '#666'
            } 
          />
        </View>
        
        {/* Action hint for denied/blocked permission */}
        {(permissionStatus === 'denied' || permissionStatus === 'blocked') && (
          <View style={styles.actionHint}>
            <Text style={styles.actionHintText}>
              Tap to enable location or enter city
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </>
  );
}

// Helper function to generate icon background color
function getIconBackgroundColor(iconColor: string): string {
  switch (iconColor) {
    case '#007AFF': return '#E3F2FD';
    case '#FF3B30': return '#FFE5E5';
    case '#FF9500': return '#FFF3CD';
    default: return '#F0F0F0';
  }
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
  cardContainer: {
    marginBottom: 12,
  },
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
  },
  errorCard: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  loadingCard: {
    opacity: 0.8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  deniedBanner: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FFD1D1',
  },
  blockedBanner: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFEAAE',
  },
  permissionBannerText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  actionHint: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  actionHintText: {
    fontSize: 11,
    color: '#007AFF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});