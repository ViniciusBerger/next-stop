// apps/frontend/app/(tabs)/discover.tsx
import React, { useState, useEffect } from 'react';
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
import useGeolocation from '../../hooks/useGeolocation';
import DiscoverCard from '../../components/ui/discoverCard';
import LocationInputModal from '../../components/ui/LocationInputModal';
import PermissionModal from '../../components/ui/PermissionModal';
import LocationBanner from '../../components/ui/LocationBanner';

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

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      await checkPermissionStatus();
    };
    checkPermission();
  }, []);

  // Show permission modal if needed
  useEffect(() => {
    const showPermissionIfNeeded = async () => {
      if (
        permissionStatus === 'undetermined' &&
        !hasRequestedPermission &&
        !loading &&
        !location
      ) {
        // Small delay to let UI settle
        setTimeout(() => {
          setShowPermissionModal(true);
        }, 1000);
      }
    };
    
    showPermissionIfNeeded();
  }, [permissionStatus, hasRequestedPermission, loading, location]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshLocation();
    setRefreshing(false);
  };

  const handleLocationSet = (newLocation: any) => {
    console.log('Location set:', newLocation);
  };

  const handleRequestPermission = async () => {
    setHasRequestedPermission(true);
    const granted = await requestPermission();
    
    if (granted) {
      Alert.alert(
        'Success',
        'Location permission granted!',
        [{ text: 'OK' }]
      );
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const renderPermissionState = () => {
    // Show banner for denied/blocked states
    if (permissionStatus === 'denied' || permissionStatus === 'blocked' || error) {
      return (
        <LocationBanner
          permissionStatus={permissionStatus}
          error={error}
          onRequestPermission={handleRequestPermission}
          onUseManualLocation={() => setShowLocationModal(true)}
          onRetry={refreshLocation}
        />
      );
    }

    // Show loading state
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

    // Show manual location indicator
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

    // Show location card when granted
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
    if (permissionStatus === 'denied' && !isManual) {
      return (
        <View style={styles.noPermissionContainer}>
          <Ionicons name="location-off" size={64} color="#ccc" />
          <Text style={styles.noPermissionTitle}>
            Location Access Needed
          </Text>
          <Text style={styles.noPermissionText}>
            Enable location access to discover nearby places
          </Text>
          <View style={styles.noPermissionButtons}>
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={handleRequestPermission}
            >
              <Text style={styles.permissionButtonText}>Allow Location</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.permissionButton, styles.manualButton]}
              onPress={() => setShowLocationModal(true)}
            >
              <Text style={[styles.permissionButtonText, styles.manualButtonText]}>
                Enter City Manually
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (location) {
      return (
        <View style={styles.content}>
          {/* Your DiscoverCard or other content */}
          <Text style={styles.sectionTitle}>Discover Nearby</Text>
          {/* Add your place listings here */}
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="compass" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No Location Available</Text>
        <Text style={styles.emptyText}>
          Enable location services or enter a city to discover places
        </Text>
        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => setShowLocationModal(true)}
        >
          <Text style={styles.exploreButtonText}>Enter Location</Text>
        </TouchableOpacity>
      </View>
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
    color: '#666',
  },
  noPermissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  noPermissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  noPermissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  noPermissionButtons: {
    width: '100%',
    gap: 12,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  manualButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  manualButtonText: {
    color: '#007AFF',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 10,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});