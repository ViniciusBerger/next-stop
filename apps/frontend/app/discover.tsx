// apps/frontend/app/(tabs)/discover.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useGeolocation, { LocationData } from '../../hooks/useGeolocation';
import DiscoverCard from '../../components/ui/discoverCard';
import LocationInputModal from '../../components/ui/LocationInputModal';

export default function DiscoverScreen() {
  const {
    location,
    loading,
    error,
    refreshLocation,
    setManualLocation,
    isManual,
    clearManualLocation
  } = useGeolocation();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshLocation();
    setRefreshing(false);
  };

  const handleLocationSet = (newLocation: LocationData) => {
    console.log('Location set:', newLocation);
    // Refresh discover content based on new location
  };

  const handleRetry = async () => {
    if (error?.code === 1 || error?.code === 3) {
      // Permission or location error - show manual input
      setShowLocationModal(true);
    } else {
      await refreshLocation();
    }
  };

  const renderLocationHeader = () => {
    if (loading && !location) {
      return (
        <View style={styles.locationCard}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.locationText}>Getting your location...</Text>
        </View>
      );
    }

    if (error && !location) {
      return (
        <View style={styles.errorCard}>
          <Ionicons name="location-off" size={24} color="#FF3B30" />
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>Location Access Needed</Text>
            <Text style={styles.errorMessage}>
              {error.message || 'Unable to access your location'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Enter Location Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (location) {
      return (
        <View style={styles.locationCard}>
          <View style={styles.locatorHeader}>
            <View style={styles.locationInfo}>
              <Ionicons 
                name={isManual ? "pin" : "location"} 
                size={20} 
                color="#007AFF" 
              />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationCity}>
                  {location.city || 'Unknown City'}
                  {isManual && (
                    <Text style={styles.manualBadge}> (Manual)</Text>
                  )}
                </Text>
                {location.country && (
                  <Text style={styles.locationCountry}>{location.country}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.locationActions}>
              {isManual ? (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={clearManualLocation}
                >
                  <Ionicons name="refresh" size={18} color="#007AFF" />
                  <Text style={styles.actionButtonText}>Use GPS</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setShowLocationModal(true)}
                >
                  <Ionicons name="create-outline" size={18} color="#007AFF" />
                  <Text style={styles.actionButtonText}>Change</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={onRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Ionicons name="refresh" size={18} color="#007AFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.coordinates}>
            <Text style={styles.coordinatesText}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>
        </View>
      );
    }

    return null;
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
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Explore places near you</Text>
        </View>

        {renderLocationHeader()}

        {location ? (
          <View style={styles.content}>
            <DiscoverCard location={location} />
            {/* Add more discover content here */}
          </View>
        ) : (
          <View style={styles.noLocationContainer}>
            <Ionicons name="compass" size={64} color="#ccc" />
            <Text style={styles.noLocationText}>
              Enable location or enter a city to discover places
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => setShowLocationModal(true)}
            >
              <Text style={styles.exploreButtonText}>Enter Location</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <LocationInputModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSet={handleLocationSet}
        currentLocation={location}
        setManualLocation={setManualLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  scrollView: {
    flex: 1
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4
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
    elevation: 3
  },
  locatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  locationTextContainer: {
    marginLeft: 12
  },
  locationCity: {
    fontSize: 18,
    fontWeight: '600'
  },
  manualBadge: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500'
  },
  locationCountry: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  locationText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666'
  },
  locationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    gap: 4
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500'
  },
  refreshButton: {
    padding: 6,
    backgroundColor: '#f0f8ff',
    borderRadius: 8
  },
  coordinates: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6
  },
  coordinatesText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  errorCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFD1D1',
    flexDirection: 'row',
    alignItems: 'center'
  },
  errorContent: {
    flex: 1,
    marginLeft: 12
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30'
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600'
  },
  content: {
    padding: 16
  },
  noLocationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40
  },
  noLocationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});