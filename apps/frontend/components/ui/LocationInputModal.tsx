// apps/frontend/components/ui/LocationInputModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationData } from '../../hooks/useGeolocation';

interface LocationInputModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSet: (location: LocationData) => void;
  currentLocation?: LocationData | null;
  setManualLocation: (city: string, lat?: number, lng?: number) => Promise<void>;
}

const popularCities = [
  'New York',
  'London',
  'Tokyo',
  'Paris',
  'Sydney',
  'Berlin',
  'Singapore',
  'Dubai',
  'Mumbai',
  'São Paulo',
  'Toronto',
  'Seoul'
];

export default function LocationInputModal({
  visible,
  onClose,
  onLocationSet,
  currentLocation,
  setManualLocation
}: LocationInputModalProps) {
  const [input, setInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!input.trim()) {
      setError('Please enter a city name');
      return;
    }

    setSearching(true);
    setError(null);

    try {
      await setManualLocation(input.trim());
      const location: LocationData = {
        latitude: 0, // Will be set by the hook
        longitude: 0,
        city: input.trim(),
        address: input.trim(),
        isManual: true
      };
      onLocationSet(location);
      onClose();
      setInput('');
    } catch (err) {
      setError('Unable to find location. Please try another name.');
    } finally {
      setSearching(false);
    }
  };

  const handleCitySelect = async (city: string) => {
    setInput(city);
    setSearching(true);
    setError(null);

    try {
      await setManualLocation(city);
      const location: LocationData = {
        latitude: 0,
        longitude: 0,
        city,
        address: city,
        isManual: true
      };
      onLocationSet(location);
      onClose();
      setInput('');
    } catch (err) {
      setError('Unable to set location. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      onLocationSet(currentLocation);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Enter Location</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.inputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter city name (e.g., London, Tokyo)"
              value={input}
              onChangeText={(text) => {
                setInput(text);
                setError(null);
              }}
              onSubmitEditing={handleSubmit}
              returnKeyType="search"
              autoFocus
            />
            {searching && (
              <ActivityIndicator size="small" color="#007AFF" style={styles.loading} />
            )}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={16} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, (!input.trim() || searching) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!input.trim() || searching}
          >
            {searching ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Use This Location</Text>
            )}
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Cities</Text>
            <View style={styles.citiesGrid}>
              {popularCities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={styles.cityButton}
                  onPress={() => handleCitySelect(city)}
                >
                  <Text style={styles.cityText}>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {currentLocation && !currentLocation.isManual && (
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
            >
              <Ionicons name="locate" size={20} color="#007AFF" />
              <Text style={styles.currentLocationText}>
                Use Current Location: {currentLocation.city}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5'
  },
  title: {
    fontSize: 18,
    fontWeight: '600'
  },
  closeButton: {
    padding: 4
  },
  content: {
    flex: 1,
    padding: 16
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16
  },
  searchIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16
  },
  loading: {
    marginLeft: 8
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: 8,
    flex: 1
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24
  },
  submitButtonDisabled: {
    backgroundColor: '#c7c7cc',
    opacity: 0.7
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#666'
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  cityButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8
  },
  cityText: {
    fontSize: 14,
    color: '#333'
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginTop: 8
  },
  currentLocationText: {
    marginLeft: 12,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500'
  }
});