import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  // You can add props like imageUrl or category later
}

export function EventCard({ id, title, date, location }: EventCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/events/${id}`)} // Routes to a detail page
      activeOpacity={0.8}
    >
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.detailsRow}>
          <Ionicons name="calendar-outline" size={14} color="#7E9AFF" />
          <Text style={styles.detailsText}>{date}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Ionicons name="location-outline" size={14} color="#7E9AFF" />
          <Text style={styles.detailsText}>{location}</Text>
        </View>
      </View>
      
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#8737e9" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  detailsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
  }
});