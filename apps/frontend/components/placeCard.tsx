import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

// Define the interface for better TypeScript support
interface Place {
  id: string;
  name: string;
  type: string;
  distance: string;
  rating: number;
}

interface PlaceCardProps {
  place: Place;
  onPress?: (place: Place) => void;
}

export const PlaceCard = React.memo(({ place, onPress }: PlaceCardProps) => {
  const getEmoji = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'cafe': return '☕';
      case 'restaurant': return '🍽️';
      case 'park': return '🌳';
      case 'shop': return '🛍️';
      case 'museum': return '🏛️';
      case 'bar': return '🍸';
      case 'gym': return '🏋️';
      case 'spa': return '💆';
      case 'theater': return '🎭';
      case 'library': return '📚';
      case 'beach': return '🏖️';
      case 'mountain': return '⛰️';
      case 'lake': return '🏞️';
      case 'zoo': return '🦁';
      case 'stadium': return '🏟️';
      case 'point of interest': return '📍';
      default: return '🎪';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.placeCard} 
      onPress={() => onPress?.(place)}
    >
      <View style={styles.placeImage}>
        <Text style={styles.placeEmoji}>{getEmoji(place.type)}</Text>
      </View>
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{place.name}</Text>
        <Text style={styles.placeType}>
          {place.type ? place.type.charAt(0).toUpperCase() + place.type.slice(1) : 'Place'}
        </Text>
        <View style={styles.placeDetails}>
          <Text style={styles.placeDistance}>📏 {place.distance}</Text>
          <Text style={styles.placeRating}>⭐ {place.rating > 0 ? place.rating.toFixed(1) : 'No ratings yet'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  placeCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
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
  placeEmoji: { fontSize: 28 },
  placeInfo: { flex: 1, justifyContent: 'center' },
  placeName: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  placeType: { fontSize: 14, color: '#6c757d', marginBottom: 8 },
  placeDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  placeDistance: { fontSize: 14, color: '#495057' },
  placeRating: { fontSize: 14, color: '#ffc107', fontWeight: '600' },
});