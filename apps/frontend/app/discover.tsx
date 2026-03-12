import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  StatusBar,
  ImageBackground
} from 'react-native';
import { ScreenLayout } from '@/components/screenLayout';
import { PlaceCard } from '@/components/placeCard';
import { PlaceFilter } from '@/components/placeFilter';
import { Ionicons } from '@expo/vector-icons';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRouter } from 'expo-router';
import axios from "axios";
import { API_URL } from '@/src/config/api';
import MapComponent from '@/components/MapComponent';


export default function DiscoverScreen() {

  const HANGOUT_CATEGORIES = [
    'restaurant', 'cafe', 'bar', 'night club', 'park', 'museum',
    'art gallery', 'shopping mall', 'gym', 'movie',
    'library', 'tourist attraction', 'amusement park', 'bowling alley',
    'casino', 'stadium', 'zoo', 'aquarium', 'campground', 'bakery',
    'food', 'meal takeawy', 'meal delivery', 'beach',
  ];

  const { location } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<Place[]>([]); // State to hold data from backend
  const [isLoading, setIsLoading] = useState(true); // Loading state for UI feedback  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [filters, setFilters] = useState<{
    category: string | null;
    distance: number | null;
    rating: number | null;
    priceLevel: number | null;
  }>({
    category: null, distance: null, rating: null, priceLevel: null
  });

  // Define the structure of a Place object so TypeScript understands the data
  interface Place {
    id: string;      // Unique identifier from MongoDB
    name: string;    // Name of the location
    category: string;    // Category (cafe, park, etc.)
    type: string;     // Type from Google Places if category is missing
    address: string; // Physical location
    distance: string;// Distance from user
    rating: number;  // User rating
    priceLevel?: number; // Optional price level
    location: {
      type: string;
      coordinates: number[];
    };                // GeoJSON format for location
  }

  // Get distance between user and place for display purposes
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`;
  };


  useEffect(() => {
    if (!location) return;
      fetchPlaces(location);
    }, [location]);

    const fetchPlaces = async (currentLocation: { latitude: number; longitude: number }) => {
      try {
        setIsLoading(true);
        // GET request to NestJS places endpoint
        const response = await axios.get(`${API_URL}/places/nearby`, {
        params: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          radius: 10000, // 5km radius
        }
        });

        // Map backend data to match frontend interface
        const formattedPlaces = response.data
        .map((item: any) => {
          console.log(`📍 ${item.name} → category: "${item.category}"`);
          return item;
        })
        .filter((item: any) => {
          const category = (item.category ?? item.type ?? '').toLowerCase();
          // Exclude unwanted categories
          return HANGOUT_CATEGORIES.some(allowed => category.includes(allowed));
        })
        .map((item: any) => ({
          ...item,
          id: item._id || item.id,
          type: item.type ?? item.category ?? 'other',
          rating: item.averageUserRating ?? item.googleRating ?? 0,
          distance: item.location?.coordinates?.length === 2
            ? getDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                item.location.coordinates[1],
                item.location.coordinates[0]
              )
            : 'N/A',
        }))
        .sort((a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance));

        setPlaces(formattedPlaces);
      } catch (error) {
        console.error("Failed to fetch places:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const filteredPlaces = useMemo(() =>
      places
        .filter(p => !searchQuery || 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.address?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter(p => !filters.category || p.category?.toLowerCase() === (filters.category as string).toLowerCase())
        .filter(p => !filters.rating || p.rating >= (filters.rating as number))
        .filter(p => !filters.priceLevel || p.priceLevel === filters.priceLevel)
        .filter(p => !filters.distance || parseFloat(p.distance) * 1000 <= (filters.distance as number)),
      [places, filters, searchQuery]
    );

    const handlePlacePress = (place: any) => {
      router.push({
        pathname: "/locationdetails",
        params: { place: JSON.stringify(place) } // ← serialize the place object
      });
    };

    const handleRandomPlace = () => {
      if (filteredPlaces.length === 0) return;
      const random = filteredPlaces[Math.floor(Math.random() * filteredPlaces.length)];
      router.push({
        pathname: '/locationdetails',
        params: { place: JSON.stringify(random) }
      });
    };

  return (
      <ScreenLayout showBack={true}>      
        <StatusBar barStyle="light-content" />

        {/* 1. Header is now "above" the map visually */}
        <View style={styles.discoverHeader}>
          <Text style={styles.headerTitle}>Discover</Text>
          <View style={styles.controlsRow}>
            <View style={styles.searchBar}>
              <Ionicons name="sparkles" size={18} color="#555" style={styles.searchIcon} onPress={handleRandomPlace} />
              <TextInput
                style={styles.input}
                placeholder="Search nearby..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#888"
              />
              <Ionicons name="search" size={20} color="#555" />
            </View>
            <PlaceFilter onFilterChange={setFilters} />
          </View>
        </View>

        {/* 2. The Map Container */}
        <View style={styles.mapWrapper}>
          <ImageBackground 
            source={require('@/src/icons/mapPlaceholder.png')}          
            style={styles.mapBackground}
            imageStyle={{ borderRadius: 20 }}
          >
            {/* Spacer determines how much map shows before the white card starts */}
            <View style={styles.spacer} />
          <View style={styles.listContainer}>
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitle}>Places Nearby</Text>
            <View style={styles.titleUnderline} />

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Finding places near you...</Text>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.skeletonCard}>
                    <View style={styles.skeletonImage} />
                    <View style={styles.skeletonInfo}>
                      <View style={styles.skeletonLine} />
                      <View style={[styles.skeletonLine, { width: '50%' }]} />
                    </View>
                  </View>
                ))}
              </View>
            ) : filteredPlaces.length === 0 ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>No places found nearby</Text>
              </View>
            ) : (
              filteredPlaces.map((item) => (
                <PlaceCard
                  key={item.id}
                  place={item}
                  onPress={handlePlacePress}
                />
              ))
            )}
          </View>
          </ImageBackground>
        </View>
      </ScreenLayout>
    );
  }

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F0F2FF',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 48,
    alignItems: 'center',
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)', // Semi-transparent to match branding
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CCC',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
    marginBottom: 10,
  },
  titleUnderline: {
    height: 1,
    backgroundColor: '#EEE',
    width: '100%',
    marginBottom: 20,
  },
  discoverHeader: {
    marginTop: -10, // Adjust this to sit perfectly under the ScreenLayout back button
    marginBottom: 20,
    alignItems: 'center',
    zIndex: 20, // Forces the search bar to stay on top of the map
  },
  mapWrapper: {
    marginTop: 0,
    marginHorizontal: -20, // Negates the ScreenLayout padding so map is edge-to-edge
    flex: 1,
  },
  mapBackground: {
    width: '100%',
    minHeight: 800, // Ensure it's tall enough to cover the scroll area
  },
  spacer: {
    height: 400, // Reduced height so the map is visible but list starts sooner
  },
  listContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 50, 
    borderTopRightRadius: 50,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 100, // Extra padding for the bottom tab bar
    minHeight: 600,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  loadingContainer: {
  alignItems: 'center',
  paddingVertical: 20,
},
loadingText: {
  fontSize: 16,
  color: '#888',
  marginBottom: 20,
},
skeletonCard: {
  flexDirection: 'row',
  width: '100%',
  marginBottom: 12,
  padding: 16,
  borderRadius: 20,
  backgroundColor: '#f0f0f0',
},
skeletonImage: {
  width: 60,
  height: 60,
  borderRadius: 12,
  backgroundColor: '#e0e0e0',
  marginRight: 16,
},
skeletonInfo: {
  flex: 1,
  justifyContent: 'center',
  gap: 8,
},
skeletonLine: {
  height: 14,
  borderRadius: 6,
  backgroundColor: '#e0e0e0',
  width: '80%',
},
});