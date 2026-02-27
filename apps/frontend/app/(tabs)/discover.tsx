import React, { useState, useEffect } from 'react';
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
import { useGeolocation } from '../../hooks/useGeolocation';
import { useRouter } from 'expo-router';
import axios from "axios";

export default function DiscoverScreen() {
  const { location } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<Place[]>([]); // State to hold data from backend
  const [isLoading, setIsLoading] = useState(true); // Loading state for UI feedback  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Define the structure of a Place object so TypeScript understands the data
  interface Place {
    id: string;      // Unique identifier from MongoDB
    name: string;    // Name of the location
    type: string;    // Category (cafe, park, etc.)
    address: string; // Physical location
    distance: string;// Distance from user
    rating: number;  // User rating
  }

useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setIsLoading(true);
        // GET request to your NestJS places endpoint
        const response = await axios.get('http://localhost:3000/places');

        // Map the backend data to match your frontend interface if needed
        // Note: MongoDB usually uses '_id', so we ensure 'id' is mapped correctly
        const formattedPlaces = response.data.map((item: any) => ({
          ...item,
          id: item._id || item.id // Use MongoDB _id as the primary key
        }));
        
        setPlaces(formattedPlaces); // Update state with the formatted database results
      } catch (error) {
        console.error("Failed to fetch places:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, []);

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

            {places.map((item) => (
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