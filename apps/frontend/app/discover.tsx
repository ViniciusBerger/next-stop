import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  StatusBar,
  ImageBackground
} from 'react-native';
import { ScreenLayout } from '@/components/screenLayout';
import { PlaceCard } from '@/components/placeCard';
import { Ionicons } from '@expo/vector-icons';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRouter } from 'expo-router';

export default function DiscoverScreen() {
  const { location, refreshLocation } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

const dummyPlaces = [
  { id: '1', name: 'Central Coffee', type: 'cafe', address: '123 Main St', distance: '0.5 km', rating: 4.5 },
  { id: '2', name: 'Green Park', type: 'park', address: '456 Park Ave', distance: '1.2 km', rating: 4.8 },
  { id: '3', name: 'Urban Bistro', type: 'restaurant', address: '789 Metro Blvd', distance: '0.8 km', rating: 4.3 },
  { id: '4', name: 'The Tech Hub', type: 'events', address: '101 Innovation Dr', distance: '2.5 km', rating: 4.9 },
  { id: '5', name: 'Sunny Side Cafe', type: 'cafe', address: '202 Sunrise Terrace', distance: '1.1 km', rating: 4.6 },
  { id: '6', name: 'Retro Records', type: 'shop', address: '55 Vinyl Way', distance: '1.5 km', rating: 4.2 },
  { id: '7', name: 'Wildwood Trail', type: 'park', address: '99 Forest Rd', distance: '3.2 km', rating: 4.7 },
  { id: '8', name: 'Blue Wave Sushi', type: 'restaurant', address: '303 Coastal Hwy', distance: '2.1 km', rating: 4.4 },
  { id: '9', name: 'City Library', type: 'events', address: '12 Civic Center', distance: '0.9 km', rating: 4.8 },
  { id: '10', name: 'The Corner Bakery', type: 'cafe', address: '14 Pastry Lane', distance: '0.4 km', rating: 4.1 },
];

  const handlePlacePress = (place: any) => {
    router.push("/locationdetails");
  };

return (
    <ScreenLayout showBack={true}>      
      <StatusBar barStyle="light-content" />

      {/* 1. Header is now "above" the map visually */}
      <View style={styles.discoverHeader}>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.controlsRow}>
          <View style={styles.searchBar}>
            <Ionicons name="sparkles" size={18} color="#555" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Search nearby..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#888"
            />
            <Ionicons name="search" size={20} color="#555" />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="funnel-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. The Map Container */}
      <View style={styles.mapWrapper}>
        <ImageBackground 
          source={require('@/src/icons/mapPlaceholder.png')}          
          style={styles.mapBackground}
          imageStyle={{ borderRadius: 20 }}
        >
          {/* Spacer determines how much map shows before the white card starts */}
          <View style={styles.spacer} />
          
          <View style={styles.listContainer}>
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitle}>Places Nearby</Text>
            <View style={styles.titleUnderline} />

            {dummyPlaces.map((item) => (
              <PlaceCard 
                key={item.id} 
                place={item} 
                onPress={handlePlacePress} 
              />
            ))}
          </View>
        </ImageBackground>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F0F2FF',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 48,
    alignItems: 'center',
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)', // Semi-transparent to match branding
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CCC',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
    marginBottom: 10,
  },
  titleUnderline: {
    height: 1,
    backgroundColor: '#EEE',
    width: '100%',
    marginBottom: 20,
  },
  discoverHeader: {
    marginTop: -10, // Adjust this to sit perfectly under the ScreenLayout back button
    marginBottom: 20,
    alignItems: 'center',
    zIndex: 20, // Forces the search bar to stay on top of the map
  },
  mapWrapper: {
    marginTop: 0,
    marginHorizontal: -20, // Negates the ScreenLayout padding so map is edge-to-edge
    flex: 1,
  },
  mapBackground: {
    width: '100%',
    minHeight: 800, // Ensure it's tall enough to cover the scroll area
  },
  spacer: {
    height: 400, // Reduced height so the map is visible but list starts sooner
  },
  listContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 50, 
    borderTopRightRadius: 50,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 100, // Extra padding for the bottom tab bar
    minHeight: 600,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
});