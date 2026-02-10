import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar 
} from 'react-native';
import { useGeolocation } from '../hooks/useGeolocation';

export default function DiscoverScreen() {
  const { location, loading, error, refreshLocation } = useGeolocation();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'restaurants', label: 'Restaurants' },
    { id: 'cafes', label: 'Cafes' },
    { id: 'parks', label: 'Parks' },
    { id: 'shops', label: 'Shops' },
    { id: 'events', label: 'Events' },
  ];

  // Dummy data for places
  const dummyPlaces = [
    { id: '1', name: 'Central Coffee', type: 'cafe', distance: '0.5 km', rating: 4.5 },
    { id: '2', name: 'Green Park', type: 'park', distance: '1.2 km', rating: 4.8 },
    { id: '3', name: 'Urban Bistro', type: 'restaurant', distance: '0.8 km', rating: 4.3 },
    { id: '4', name: 'Mall Avenue', type: 'shop', distance: '2.1 km', rating: 4.0 },
    { id: '5', name: 'Sunset Cafe', type: 'cafe', distance: '1.5 km', rating: 4.7 },
    { id: '6', name: 'City Events Hall', type: 'events', distance: '3.0 km', rating: 4.2 },
  ];

  // Map placeholder component
  const MapPlaceholder = () => (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>🗺️</Text>
        <Text style={styles.mapLabel}>Map View</Text>
        <Text style={styles.mapSubtext}>Interactive map will appear here</Text>
        
        {/* Show location if available */}
        {location && !loading && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              📍 Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>
        )}
        
        {loading && (
          <Text style={styles.loadingText}>Loading map...</Text>
        )}
        
        {error && (
          <Text style={styles.errorText}>Location unavailable</Text>
        )}
      </View>
      
      {/* Map controls placeholder */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapButton}>
          <Text style={styles.mapButtonText}>📍 My Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapButton}>
          <Text style={styles.mapButtonText}>🔍 Search Area</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Place card component
  const PlaceCard = ({ place }: { place: any }) => (
    <TouchableOpacity style={styles.placeCard}>
      <View style={styles.placeImage}>
        <Text style={styles.placeEmoji}>
          {place.type === 'cafe' ? '☕' : 
           place.type === 'restaurant' ? '🍽️' : 
           place.type === 'park' ? '🌳' : 
           place.type === 'shop' ? '🛍️' : '🎪'}
        </Text>
      </View>
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{place.name}</Text>
        <Text style={styles.placeType}>{place.type.charAt(0).toUpperCase() + place.type.slice(1)}</Text>
        <View style={styles.placeDetails}>
          <Text style={styles.placeDistance}>📏 {place.distance}</Text>
          <Text style={styles.placeRating}>⭐ {place.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover Nearby</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>⚙️ Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search places, events, or categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(filter.id)}
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

      {/* Map Placeholder */}
      <MapPlaceholder />

      {/* Results Section */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Nearby Places</Text>
        <Text style={styles.resultsCount}>{dummyPlaces.length} places found</Text>
      </View>

      {/* Places List */}
      <ScrollView style={styles.placesList}>
        {dummyPlaces.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </ScrollView>

      {/* Refresh Location Button */}
      {error && (
        <TouchableOpacity style={styles.retryButton} onPress={refreshLocation}>
          <Text style={styles.retryButtonText}>🔄 Retry Location</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  filterButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 20,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
  },
  mapContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#e9ecef',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 48,
    marginBottom: 8,
  },
  mapLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 4,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  locationInfo: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    marginTop: 8,
  },
  mapControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 10,
  },
  mapButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  mapButtonText: {
    color: '#495057',
    fontWeight: '500',
    fontSize: 14,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6c757d',
  },
  placesList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  placeCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  placeImage: {
    width: 60,
    height: 60,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  placeEmoji: {
    fontSize: 28,
  },
  placeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  placeType: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  placeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  placeDistance: {
    fontSize: 14,
    color: '#495057',
  },
  placeRating: {
    fontSize: 14,
    color: '#ffc107',
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});