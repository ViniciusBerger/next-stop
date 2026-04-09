import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppMap } from '@/components/AppMap';
import { PlaceCard } from '@/components/placeCard';
import { PlaceFilter } from '@/components/placeFilter';
import { BackButton } from '@/components/backButton';
import { BottomTabBar } from '@/components/bottomTabBar';
import { Ionicons } from '@expo/vector-icons';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRouter } from 'expo-router';
import axios from "axios";
import { API_URL } from '@/src/config/api';
import { auth } from '@/src/config/firebase';
import { styles as loginStyles } from '@/src/styles/login.styles';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();

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
  const [isLoading, setIsLoading] = useState(true); // Loading state for UI feedback
  const router = useRouter();
  const [filters, setFilters] = useState<{
    category: string | null;
    distance: number | null;
    rating: number | null;
    priceLevel: number | null;
  }>({
    category: null, distance: null, rating: null, priceLevel: null
  });

  // AI Randomizer state
  const [vibeModalVisible, setVibeModalVisible] = useState(false);
  const [vibeInput, setVibeInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

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
          radius: 10000, // 10km radius
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

  // AI-powered place picker — sends vibe + place list to AI and navigates to the best match
  const handleAIPick = async () => {
    if (filteredPlaces.length === 0 || !vibeInput.trim()) return;

    setAiLoading(true);
    setAiMessage('');

    try {
      // 2. Call endpoint
      const response = await axios.post(`${API_URL}/ai/pick`, {
        vibe: vibeInput,
        places: filteredPlaces.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category || p.type
        })),
        userId: auth.currentUser?.uid //Now logging who searched what
      });

      const { id, reason } = response.data; // Matches backend response

      // 3. Find the place in local list by ID instead of Index
      const pickedPlace = filteredPlaces.find(p => p.id === id);
      
      if (!pickedPlace) throw new Error("Place not found in local list");

      setAiMessage(reason);

      setTimeout(() => {
        setVibeModalVisible(false);
        setVibeInput('');
        setAiMessage('');
        router.push({
          pathname: '/locationdetails',
          params: { place: JSON.stringify(pickedPlace) }
        });
      }, 5000); // Show AI reasoning for 5 seconds before navigating

    } catch (err) {
      console.error("AI pick failed:", err);
      // Fallback to random pick if AI fails
      const random = filteredPlaces[Math.floor(Math.random() * filteredPlaces.length)];
      setVibeModalVisible(false);
      router.push({
        pathname: '/locationdetails',
        params: { place: JSON.stringify(random) }
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Gradient header background — same as ScreenLayout */}
      <View style={[loginStyles.headerBackground, { position: 'absolute' }]} />

      {/* Back button — respects safe area */}
      <View style={[styles.topBar, { paddingTop: insets.top + 30 }]}>
        <BackButton color="white" />
        <Text style={styles.headerTitle}>Discover</Text>
      </View>

      {/* AI Vibe Modal — opens when user taps the sparkles icon */}
      <Modal
        visible={vibeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVibeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Ionicons name="sparkles" size={24} color="#7d77f0" />
              <Text style={styles.modalTitle}>What's your vibe?</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Describe what you're looking for and AI will pick the perfect spot
            </Text>

            <TextInput
              style={styles.vibeInput}
              placeholder="e.g. cozy date night, fun with friends, solo chill..."
              placeholderTextColor="#aaa"
              value={vibeInput}
              onChangeText={setVibeInput}
              multiline
              editable={!aiLoading}
            />

            {/* AI reasoning message shown briefly before navigating */}
            {aiMessage ? (
              <View style={styles.aiMessageBox}>
                <Ionicons name="sparkles" size={16} color="#7d77f0" />
                <Text style={styles.aiMessageText}>{aiMessage}</Text>
              </View>
            ) : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setVibeModalVisible(false);
                  setVibeInput('');
                }}
                disabled={aiLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pickButton, (!vibeInput.trim() || aiLoading) && { opacity: 0.5 }]}
                onPress={handleAIPick}
                disabled={!vibeInput.trim() || aiLoading}
              >
                {aiLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.pickButtonText}>Pick for me ✨</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 1. Header is now "above" the map visually */}
      <View style={styles.discoverHeader}>
        <View style={styles.controlsRow}>
          <View style={styles.searchBar}>
            {/* Sparkles icon now opens the AI vibe modal instead of pure random */}
            <Ionicons
              name="sparkles"
              size={18}
              color="#7d77f0"
              style={styles.searchIcon}
              onPress={() => setVibeModalVisible(true)}
            />
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

      {/* Map — lives outside any ScrollView */}
      <AppMap
        places={filteredPlaces}
        userLocation={location}
        onMarkerPress={handlePlacePress}
        style={styles.map}
      />

      {/* Scrollable list — only this part scrolls */}
      <View style={styles.listWrapper}>
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
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
        </ScrollView>
      </View>

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 18,
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 40,
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
    marginHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
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
    marginBottom: 20,
    alignItems: 'center',
    zIndex: 20,
  },
  map: {
    height: 300,
    width: '100%',
  },
  listWrapper: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    overflow: 'hidden',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 100,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  vibeInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  aiMessageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0eeff',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  aiMessageText: {
    flex: 1,
    fontSize: 14,
    color: '#7d77f0',
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  pickButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#7d77f0',
    alignItems: 'center',
  },
  pickButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});