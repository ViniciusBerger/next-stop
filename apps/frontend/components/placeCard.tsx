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

  const getDistanceIcon = (distance: string) => {
    if (!distance) return '';
    if (/\d+(\.\d+)?\s*(mi|km|ft|m)\b/i.test(distance) || /away/i.test(distance)) return '📏';
    if (/saved/i.test(distance)) return '🔖';
    return '📅';
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
        <Text style={styles.placeName} numberOfLines={1} ellipsizeMode="tail">{place.name}</Text>
        <Text style={styles.placeType} numberOfLines={1}>
          {place.type ? place.type.charAt(0).toUpperCase() + place.type.slice(1) : 'Place'}
        </Text>
        <View style={styles.placeDetails}>
          <Text style={styles.placeDistance} numberOfLines={1}>
            {getDistanceIcon(place.distance)} {place.distance}
          </Text>
          <Text style={styles.placeRating} numberOfLines={1}>
            ⭐ {place.rating > 0 ? place.rating.toFixed(1) : 'No ratings'}
          </Text>
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
  placeDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  placeDistance: { fontSize: 14, color: '#495057', flexShrink: 1 },
  placeRating: { fontSize: 14, color: '#ffc107', fontWeight: '600', flexShrink: 0 },
});