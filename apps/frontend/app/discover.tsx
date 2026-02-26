import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useGeolocation from '../hooks/useGeolocation';
import { DiscoverCard } from '@/components/discoverCard';
import LocationInputModal from '../components/ui/LocationInputModal';
import PermissionModal from '../components/ui/PermissionModal';
import LocationBanner from '../components/ui/LocationBanner';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { showToast } from '../components/ui/Toast';
import { PlaceCard } from '../components/ui/PlaceCard';
import { ErrorState } from '../components/ui/StateComponents'; // ADD THIS
import { ValidationError } from '../components/ui/StateComponents'; // ADD THIS

export default function DiscoverScreen() {
  const {
    location,
    loading,
    error,
    permissionStatus,
    requestPermission,
    refreshLocation,
    setManualLocation,
    isManual,
    clearManualLocation,
    checkPermissionStatus
  } = useGeolocation();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const [places, setPlaces] = useState<any[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [apiError, setApiError] = useState<Error | null>(null); // ADD THIS
  const [searchQuery, setSearchQuery] = useState(''); // ADD THIS
  const [filterError, setFilterError] = useState<string>(''); // ADD THIS
  
  const { isConnected, isInternetReachable, isInitialized } = useNetworkStatus();

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      await checkPermissionStatus();
    };
    checkPermission();
  }, []);

  // Show offline warning - IMPROVED
  useEffect(() => {
    if (isInitialized && (!isConnected || !isInternetReachable)) {
      showToast('You are offline. Some features may be unavailable.', 'warning', 5000);
    }
  }, [isConnected, isInternetReachable, isInitialized]);

  // Show permission modal if needed
  useEffect(() => {
    const showPermissionIfNeeded = async () => {
      if (
        permissionStatus === 'undetermined' &&
        !hasRequestedPermission &&
        !loading &&
        !location
      ) 
      {
        setTimeout(() => {
          setShowPermissionModal(true);
        }, 1000);
      }
    };
    
    showPermissionIfNeeded();
  }, [permissionStatus, hasRequestedPermission, loading, location]);

  // Fetch places when location is available - ADDED ERROR HANDLING
  useEffect(() => {
    const fetchPlaces = async () => {
      if (!location || permissionStatus !== 'granted') return;
      
      setPlacesLoading(true);
      setApiError(null);
      
      try {
        // Simulate API call with potential error
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Randomly simulate error for testing (remove in production)
        if (Math.random() < 0.1) { // 10% chance of error
          throw new Error('Failed to fetch places. Please try again.');
        }
        
        // Mock data
        const mockPlaces = [
          { id: '1', name: 'Central Park', type: 'park', distance: '0.5 km', rating: 4.8 },
          { id: '2', name: 'Starbucks', type: 'cafe', distance: '0.8 km', rating: 4.3 },
          { id: '3', name: 'The Italian Restaurant', type: 'restaurant', distance: '1.2 km', rating: 4.6 },
          { id: '4', name: 'City Mall', type: 'shopping', distance: '1.5 km', rating: 4.2 },
          { id: '5', name: 'Public Library', type: 'library', distance: '2.0 km', rating: 4.5 },
        ];
        
        setPlaces(mockPlaces);
        showToast(`${mockPlaces.length} places found nearby!`, 'success');
      } catch (error) {
        console.error('Error fetching places:', error);
        setApiError(error as Error);
        showToast('Failed to load places', 'error');
      } finally {
        setPlacesLoading(false);
      }
    };

    fetchPlaces();
  }, [location, permissionStatus]);

  // Filter places based on search query (if implemented)
  const filteredPlaces = places.filter(place => 
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setApiError(null);
    await refreshLocation();
    setRefreshing(false);
  };

  const handleLocationSet = (newLocation: any) => {
    console.log('Location set:', newLocation);
    showToast('Location updated successfully', 'success');
  };

  const handleRequestPermission = async () => {
    setHasRequestedPermission(true);
    const granted = await requestPermission();
    
    if (granted) {
      showToast('Location permission granted!', 'success');
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0 && filteredPlaces.length === 0) {
      setFilterError(`No results found for "${query}"`);
    } else {
      setFilterError('');
    }
  };

  const renderPermissionState = () => {
    if (permissionStatus === 'denied' || permissionStatus === 'blocked' || error) {
      return (
        <LocationBanner
          permissionStatus={permissionStatus}
          error={error || undefined}
          onRequestPermission={handleRequestPermission}
          onUseManualLocation={() => setShowLocationModal(true)}
          onRetry={refreshLocation}
        />
      );
    }

    if (loading && !location) {
      return (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            Getting your location...
          </Text>
          <Text style={styles.loadingSubtext}>
            Ensuring the best experience
          </Text>
        </View>
      );
    }

    if (isManual) {
      return (
        <View style={styles.manualLocationCard}>
          <View style={styles.manualLocationHeader}>
            <Ionicons name="pin" size={20} color="#FF9500" />
            <Text style={styles.manualLocationTitle}>Manual Location</Text>
            <TouchableOpacity 
              style={styles.changeButton}
              onPress={() => setShowLocationModal(true)}
            >
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.manualLocationText}>
            Showing results for: {location?.city || location?.address || 'Unknown'}
          </Text>
          <TouchableOpacity 
            style={styles.useGpsButton}
            onPress={clearManualLocation}
          >
            <Ionicons name="locate" size={16} color="#007AFF" />
            <Text style={styles.useGpsText}>Use GPS Instead</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (location && permissionStatus === 'granted') {
      return (
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <Text style={styles.locationTitle}>Current Location</Text>
            <TouchableOpacity 
              style={styles.locationAction}
              onPress={() => setShowLocationModal(true)}
            >
              <Text style={styles.locationActionText}>Change</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.locationText}>
            {location.city || 'Your Location'}
            {location.country && `, ${location.country}`}
          </Text>
          <View style={styles.locationDetails}>
            <Text style={styles.coordinates}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
            {location.accuracy && (
              <Text style={styles.accuracy}>
                Accuracy: ±{(location.accuracy).toFixed(0)}m
              </Text>
            )}
          </View>
        </View>
      );
    }

    return null;
  };

  const renderContent = () => {
    // Network offline state (priority 1)
    if (isInitialized && (!isConnected || !isInternetReachable)) {
      return (
        <EmptyState
          icon="wifi-outline"
          title="You're Offline"
          message="Please check your internet connection and try again."
          buttonText="Retry"
          onButtonPress={refreshLocation}
        />
      );
    }

    // API Error state (priority 2)
    if (apiError) {
      return (
        <ErrorState
          error={apiError}
          onRetry={() => {
            setApiError(null);
            // Retry fetching places
            if (location && permissionStatus === 'granted') {
              setPlacesLoading(true);
              setTimeout(() => {
                // Simulate retry
                setPlaces([]);
                setPlacesLoading(false);
                showToast('Retrying...', 'info');
              }, 1000);
            }
          }}
        />
      );
    }

    // Loading skeletons (priority 3)
    if (placesLoading) {
      return (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Discover Nearby</Text>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      );
    }

    // Permission denied state (priority 4)
    if (permissionStatus === 'denied' && !isManual) {
      return (
        <EmptyState
          icon="location-outline"
          title="Location Access Needed"
          message="Enable location access to discover nearby places and get personalized recommendations."
          buttonText="Allow Location"
          onButtonPress={handleRequestPermission}
        />
      );
    }

    // Filter error state (search with no results)
    if (filterError) {
      return (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Discover Nearby</Text>
          <ValidationError error={filterError} />
          <EmptyState
            icon="search-outline"
            title="No Results Found"
            message={filterError}
            buttonText="Clear Search"
            onButtonPress={() => {
              setSearchQuery('');
              setFilterError('');
            }}
          />
        </View>
      );
    }

    // No places found state (priority 5)
    if (location && places.length === 0 && !placesLoading) {
      return (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Discover Nearby</Text>
          <EmptyState
            icon="compass-outline"
            title="No Places Found"
            message="We couldn't find any places nearby. Try adjusting your search area or filters."
            buttonText="Search Again"
            onButtonPress={refreshLocation}
          />
        </View>
      );
    }

    // Places list (success state)
    if (location && places.length > 0) {
      return (
        <View style={styles.content}> 
          <Text style={styles.sectionTitle}>Discover Nearby</Text>
          {filteredPlaces.length === 0 && searchQuery ? (
            <EmptyState
              icon="search-outline"
              title="No Matches"
              message={`No places match "${searchQuery}"`}
              buttonText="Clear Search"
              onButtonPress={() => {
                setSearchQuery('');
                setFilterError('');
              }}
            />
          ) : (
            filteredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onPress={() => {
                  console.log('Place pressed:', place.name);
                  showToast(`Viewing ${place.name}`, 'info');
                }}
              />
            ))
          )}
        </View>
      );
    }

    // Empty state when no location
    return (
      <EmptyState
        icon="location-outline"
        title="No Location Available"
        message="Enable location services or enter a city to discover places near you."
        buttonText="Enter Location"
        onButtonPress={() => setShowLocationModal(true)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            enabled={permissionStatus === 'granted'}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Explore places around you</Text>
        </View>

        {/* Optional Search Bar - ADD THIS for better UX */}
        {location && permissionStatus === 'granted' && places.length > 0 && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search places..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#999"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {renderPermissionState()}
        {renderContent()}
      </ScrollView>

      {/* Location Input Modal */}
      <LocationInputModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSet={handleLocationSet}
        currentLocation={location}
        setManualLocation={setManualLocation}
      />

      {/* Permission Modal */}
      <PermissionModal
        visible={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onGrantPermission={handleRequestPermission}
        permissionType="location"
        isBlocked={permissionStatus === 'blocked'}
      />
    </View>
  );
}

// Add TextInput to imports
import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    paddingVertical: 8,
  },
  loadingCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 32,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    color: '#000',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  manualLocationCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFEAAE',
  },
  manualLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  manualLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginLeft: 8,
    flex: 1,
  },
  changeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  manualLocationText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
  },
  useGpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  useGpsText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  locationCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  locationAction: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  locationActionText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  locationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coordinates: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  accuracy: {
    fontSize: 12,
    color: '#666'
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  }
});