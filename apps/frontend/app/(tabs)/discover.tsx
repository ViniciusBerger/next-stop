import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ScrollView,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { ScreenLayout } from '@/components/screenLayout';
import { PlaceCard } from '@/components/placeCard';
import { Ionicons } from '@expo/vector-icons';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useRouter } from 'expo-router';
import axios from "axios";
import { LocationInputModal } from '@/components/ui/LocationInputModal';
import { LocationBanner, SimpleLocationBanner } from '@/components/ui/LocationBanner';
import { PermissionModal } from '@/components/ui/PermissionModal';
import { LocationPrompt } from '@/components/ui/LocationPrompt';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { showToast } from '@/components/ui/Toast';

const { width, height } = Dimensions.get('window');

// Define the structure of a Place object - matching what PlaceCard expects
interface Place {
  id: string;
  name: string;
  type: string;
  distance: string;
  rating: number;
  address?: string; // Make address optional if PlaceCard doesn't need it
}

// Filter categories
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'cafe', label: 'Cafes' },
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'park', label: 'Parks' },
  { id: 'shop', label: 'Shops' },
  { id: 'events', label: 'Events' },
];

export default function DiscoverScreen() {
  const { location, loading, error, refreshLocation } = useGeolocation();
  const {
    permissionStatus,
    requestPermission,
    openSettings,
    isLoading: permissionLoading
  } = useLocationPermission();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [screenDimensions, setScreenDimensions] = useState({ width, height });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);
  const [manualLocation, setManualLocation] = useState<string | null>(null);
  const [locationType, setLocationType] = useState<'gps' | 'manual'>('gps');
  const [manualCoords, setManualCoords] = useState<{lat: number, lng: number} | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions({ width: window.width, height: window.height });
    });
    return () => subscription?.remove();
  }, []);

  // Show permission modal when undetermined
  useEffect(() => {
    if (permissionStatus === 'undetermined' && !hasShownPrompt && !manualLocation) {
      setShowPermissionModal(true);
      setHasShownPrompt(true);
    }
  }, [permissionStatus, hasShownPrompt, manualLocation]);

  // Show error toast if GPS fails
  useEffect(() => {
    if (error && locationType === 'gps' && permissionStatus === 'granted') {
      showToast('Unable to get your location. Please enter manually.', 'warning');
    }
  }, [error, locationType, permissionStatus]);

  // Handle permission denied
  useEffect(() => {
    if (permissionStatus === 'denied' && !manualLocation) {
      showToast('Location permission denied. Using manual entry.', 'info');
    }
  }, [permissionStatus, manualLocation]);

  // Fetch places from backend
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:3000/places');
        
        // Map the response to match the Place interface
        const formattedPlaces = response.data.map((item: any) => ({
          id: item._id || item.id,
          name: item.name || '',
          type: item.type || 'other',
          distance: item.distance || '0.5 km',
          rating: item.rating || 4.0,
          address: item.address || '' // Keep address if needed elsewhere
        }));
        
        setPlaces(formattedPlaces);
      } catch (error) {
        console.error("Failed to fetch places:", error);
        showToast('Failed to load places', 'error');
        // Set dummy data as fallback
        setPlaces([
          { id: '1', name: 'Central Coffee', type: 'cafe', distance: '0.5 km', rating: 4.5 },
          { id: '2', name: 'Green Park', type: 'park', distance: '1.2 km', rating: 4.8 },
          { id: '3', name: 'Urban Bistro', type: 'restaurant', distance: '0.8 km', rating: 4.3 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  // Filter places based on selected filter and search
  const filteredPlaces = places.filter(place => {
    const matchesFilter = selectedFilter === 'all' || place.type === selectedFilter;
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handlePlacePress = (place: Place) => {
    // Navigate to location details with the place data
    router.push({
      pathname: "/locationdetails",
      params: { 
        id: place.id,
        name: place.name,
        type: place.type,
        rating: place.rating.toString(),
        address: place.address || ''
      }
    });
  };

  const handleManualLocationSet = (city: string) => {
    setManualLocation(city);
    setLocationType('manual');
    
    const mockLat = 40.7128 + (city.length * 0.01);
    const mockLng = -74.0060 + (city.length * 0.01);
    setManualCoords({ lat: mockLat, lng: mockLng });
    
    showToast(`Location set to ${city}`, 'success');
    setShowPermissionModal(false);
  };

  const handleUseGPS = () => {
    setLocationType('gps');
    setManualLocation(null);
    setManualCoords(null);
    refreshLocation();
    showToast('Switched to GPS location', 'info');
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowPermissionModal(false);
      refreshLocation();
    }
  };

  const getDisplayLocation = () => {
    if (locationType === 'manual' && manualLocation) {
      return `📍 ${manualLocation}`;
    } else if (location && locationType === 'gps' && permissionStatus === 'granted') {
      return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    } else if (permissionStatus === 'denied' || permissionStatus === 'blocked') {
      return 'Location permission denied';
    } else {
      return 'Getting location...';
    }
  };

  // Responsive sizing
  const mapHeight = screenDimensions.height * 0.25;
  const spacerHeight = screenDimensions.height * 0.15;
  const listMinHeight = screenDimensions.height * 0.5;

  // Determine if we should show location banners
  const showLocationBanner = permissionStatus === 'denied' || 
                             permissionStatus === 'blocked' || 
                             locationType === 'manual' || 
                             error;

  return (
    <ScreenLayout showBack={true}>
      <StatusBar barStyle="light-content" />

      {/* Permission Prompt - Shows when permission is denied but not in modal */}
      {permissionStatus === 'denied' && !showPermissionModal && !manualLocation && (
        <LocationPrompt
          variant="banner"
          onRequestPermission={() => setShowPermissionModal(true)}
          onManualEntry={() => setShowLocationModal(true)}
        />
      )}

      {/* Manual Location Banner - Shows when GPS is off or manual mode is active */}
      {showLocationBanner && (
        locationType === 'manual' ? (
          <LocationBanner 
            type="manual" 
            onPress={() => setShowLocationModal(true)} 
          />
        ) : permissionStatus === 'blocked' ? (
          <LocationBanner 
            type="denied" 
            onPress={openSettings} 
          />
        ) : error ? (
          <LocationBanner 
            type="unavailable" 
            onPress={() => setShowLocationModal(true)} 
          />
        ) : (
          <LocationBanner 
            type="denied" 
            onPress={() => setShowLocationModal(true)} 
          />
        )
      )}

      {/* Simple Banner for easy access when permission is granted */}
      {permissionStatus === 'granted' && !error && locationType === 'gps' && (
        <SimpleLocationBanner onPress={() => setShowLocationModal(true)} />
      )}

      {/* Header Section */}
      <View style={styles.discoverHeader}>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.controlsRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#7E9AFF" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Search nearby..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            ) : (
              <Ionicons name="search" size={20} color="#7E9AFF" />
            )}
          </View>
          <TouchableOpacity style={styles.filterButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="options-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === filter.id && styles.filterChipTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Container */}
      <View style={styles.mapWrapper}>
        <ImageBackground
          source={require('@/src/icons/mapPlaceholder.png')}
          style={[styles.mapBackground, { height: mapHeight + spacerHeight + listMinHeight }]}
          imageStyle={{ borderRadius: 20 }}
        >
          {/* Location Info Overlay */}
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={16} color="#7E9AFF" />
            <Text style={styles.locationText} numberOfLines={1}>
              {getDisplayLocation()}
            </Text>
            {locationType === 'manual' ? (
              <TouchableOpacity onPress={handleUseGPS} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="locate" size={16} color="#7E9AFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={refreshLocation} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="refresh" size={16} color="#7E9AFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Spacer for map area */}
          <View style={[styles.spacer, { height: spacerHeight }]} />

          {/* Places List Container */}
          <View style={[styles.listContainer, { minHeight: listMinHeight }]}>
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitle}>Places Nearby</Text>
            <View style={styles.titleUnderline} />

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.placesList}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text>Loading places...</Text>
                </View>
              ) : filteredPlaces.length > 0 ? (
                filteredPlaces.map((item) => (
                  <PlaceCard
                    key={item.id}
                    place={item}
                    onPress={() => handlePlacePress(item)}
                  />
                ))
              ) : (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search-outline" size={50} color="#ccc" />
                  <Text style={styles.noResultsText}>No places found</Text>
                  <Text style={styles.noResultsSubtext}>Try adjusting your search or filters</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </ImageBackground>
      </View>

      {/* Location Input Modal */}
      <LocationInputModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSet={handleManualLocationSet}
      />

      {/* Permission Modal */}
      <PermissionModal
        visible={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onAllow={handleRequestPermission}
        onSettings={openSettings}
        type="location"
        isBlocked={permissionStatus === 'blocked'}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  discoverHeader: {
    marginTop: Platform.OS === 'ios' ? -10 : -5,
    marginBottom: 15,
    alignItems: 'center',
    zIndex: 20,
  },
  headerTitle: {
    fontSize: Math.min(32, width * 0.08),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: Math.min(48, height * 0.06),
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: Math.min(16, width * 0.04),
    color: '#333',
    paddingVertical: Platform.OS === 'ios' ? 8 : 0,
  },
  filterButton: {
    width: Math.min(48, height * 0.06),
    height: Math.min(48, height * 0.06),
    backgroundColor: 'rgba(126, 154, 255, 0.8)',
    borderRadius: Math.min(24, height * 0.03),
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    marginBottom: 15,
  },
  filtersScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: Math.min(16, width * 0.04),
    paddingVertical: Math.min(8, height * 0.01),
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  filterChipActive: {
    backgroundColor: '#7E9AFF',
    borderColor: '#7E9AFF',
  },
  filterChipText: {
    fontSize: Math.min(14, width * 0.035),
    color: '#7E9AFF',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  mapWrapper: {
    marginHorizontal: -20,
    flex: 1,
  },
  mapBackground: {
    width: '100%',
  },
  locationInfo: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: Math.min(10, height * 0.012),
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationText: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: Math.min(12, width * 0.03),
    color: '#333',
    flex: 1,
  },
  spacer: {
    width: '100%',
  },
  listContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 100,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    borderBottomWidth: 0,
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
    fontSize: Math.min(20, width * 0.05),
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  titleUnderline: {
    height: 1,
    backgroundColor: '#DEE4FF',
    width: '100%',
    marginBottom: 20,
  },
  placesList: {
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.05,
  },
  noResultsText: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
  },
  noResultsSubtext: {
    fontSize: Math.min(14, width * 0.035),
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});