import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlaceCardProps {
  place: {
    id: string;
    name: string;
    type: string;
    distance: string;
    rating: number;
  };
  onPress: () => void;
}

export const PlaceCard = ({ place, onPress }: PlaceCardProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'park': return 'leaf';
      case 'cafe': return 'cafe';
      case 'restaurant': return 'restaurant';
      case 'shopping': return 'cart';
      case 'library': return 'library';
      default: return 'location';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={getIcon(place.type)} size={24} color="#007AFF" />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.type}>{place.type}</Text>
        <View style={styles.details}>
          <Text style={styles.distance}>📏 {place.distance}</Text>
          <Text style={styles.rating}>⭐ {place.rating}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  details: {
    flexDirection: 'row',
    gap: 16,
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  rating: {
    fontSize: 12,
    color: '#FFC107',
    fontWeight: '600',
  },
});