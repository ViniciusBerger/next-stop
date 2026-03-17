import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LocationInputModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSet: (city: string, country?: string) => void;
}

// Mock recent searches - in real app, this would come from storage
const RECENT_SEARCHES = ['New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami'];
const POPULAR_CITIES = ['London', 'Paris', 'Tokyo', 'Sydney', 'Dubai', 'Singapore'];

export const LocationInputModal = ({ visible, onClose, onLocationSet }: LocationInputModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.length > 2) {
      setIsSearching(true);
      // Simulate geocoding API call
      setTimeout(() => {
        // Mock results - in real app, this would call a geocoding API
        const mockResults = [
          `${text} City`,
          `${text} Downtown`,
          `${text} Heights`,
          `New ${text}`,
        ];
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectLocation = (location: string) => {
    onLocationSet(location);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    // This will trigger the GPS location request
    onClose();
    // The parent component will handle GPS request
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Enter Location</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#7E9AFF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search city or place..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus={true}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Use Current Location Option */}
          <TouchableOpacity 
            style={styles.currentLocationButton}
            onPress={handleUseCurrentLocation}
          >
            <View style={styles.currentLocationIcon}>
              <Ionicons name="locate" size={20} color="#7E9AFF" />
            </View>
            <View style={styles.currentLocationText}>
              <Text style={styles.currentLocationTitle}>Use Current Location</Text>
              <Text style={styles.currentLocationSubtitle}>GPS will be requested</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* Search Results or Suggestions */}
          <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7E9AFF" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchQuery.length > 2 && searchResults.length > 0 ? (
              <>
                <Text style={styles.resultsHeader}>Search Results</Text>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => handleSelectLocation(result)}
                  >
                    <Ionicons name="location-outline" size={20} color="#7E9AFF" />
                    <Text style={styles.resultText}>{result}</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : searchQuery.length === 0 ? (
              <>
                {/* Recent Searches */}
                <Text style={styles.resultsHeader}>Recent Searches</Text>
                {RECENT_SEARCHES.map((city, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => handleSelectLocation(city)}
                  >
                    <Ionicons name="time-outline" size={20} color="#7E9AFF" />
                    <Text style={styles.resultText}>{city}</Text>
                  </TouchableOpacity>
                ))}

                {/* Popular Cities */}
                <Text style={[styles.resultsHeader, styles.popularHeader]}>Popular Cities</Text>
                <View style={styles.popularGrid}>
                  {POPULAR_CITIES.map((city, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.popularCityButton}
                      onPress={() => handleSelectLocation(city)}
                    >
                      <Text style={styles.popularCityText}>{city}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : null}
          </ScrollView>

          {/* Manual Entry Option */}
          {searchQuery.length > 0 && searchResults.length === 0 && !isSearching && (
            <TouchableOpacity
              style={styles.manualEntryButton}
              onPress={() => handleSelectLocation(searchQuery)}
            >
              <Ionicons name="create-outline" size={20} color="#7E9AFF" />
              <Text style={styles.manualEntryText}>
                Use "{searchQuery}" as location
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE4FF',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 48,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#DEE4FF',
    backgroundColor: '#F8F9FA',
  },
  currentLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentLocationText: {
    flex: 1,
  },
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  currentLocationSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  resultsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 12,
  },
  popularHeader: {
    marginTop: 24,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  popularCityButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F0F3FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  popularCityText: {
    fontSize: 14,
    color: '#7E9AFF',
    fontWeight: '500',
  },
  manualEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: '#F0F3FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    gap: 8,
  },
  manualEntryText: {
    fontSize: 14,
    color: '#7E9AFF',
    fontWeight: '600',
  },
});