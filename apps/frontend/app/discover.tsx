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
  
  const { isConnected } = useNetworkStatus();

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      await checkPermissionStatus();
    };
    checkPermission();
  }, []);

  // Show offline warning
  useEffect(() => {
    if (!isConnected) {
      showToast('You are offline. Some features may be unavailable.', 'warning', 5000);
    }
  }, [isConnected]);

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

  // Fetch places when location is available
  useEffect(() => {
    const fetchPlaces = async () => {
      if (!location || permissionStatus !== 'granted') return;
      
      setPlacesLoading(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
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
        showToast('Failed to load places', 'error');
      } finally {
        setPlacesLoading(false);
      }
    };

    fetchPlaces();
  }, [location, permissionStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
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

  const renderPermissionState = () => 
    {
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
    // Show loading skeletons when places are loading
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

    // Show permission denied state
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

    // Show no places found state
    if (location && places.length === 0 && !placesLoading) {
      return (
        <EmptyState
          icon="compass"
          title="No Places Found"
          message="We couldn't find any places nearby. Try adjusting your search area or filters."
          buttonText="Search Again"
          onButtonPress={refreshLocation}
        />
      );
    }

    // Show places list
    if (location && places.length > 0) {
      return (
        <View style={styles.content}> 
          <Text style={styles.sectionTitle}>Discover Nearby</Text>
          {places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onPress={() => {
                console.log('Place pressed:', place.name);
                showToast(`Viewing ${place.name}`, 'info');
              }}
            />
          ))}
        </View>
      );
    }

    // Show offline state
    if (!isConnected) {
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

    // Show empty state when no location
    return (
      <EmptyState
        icon="location"
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