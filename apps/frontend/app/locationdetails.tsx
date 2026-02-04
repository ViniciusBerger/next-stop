import React, { use, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Platform } from "react-native";
import { ScreenLayout } from "@/components/screenLayout";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

export default function LocationDetailsScreen() {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const navigation = useNavigation<any>(); // Replace 'any' with your typed navigation prop
  // This would come from Firestore user visit history
  const [hasVisited, setHasVisited] = useState(true);

  const locationData = {
    name: "Golden Gate Park",
    address: "San Francisco, CA 94122, United States", // Kept in data for the URL
    rating: 4.8,
    reviewCount: 124,    
    type: "Park / Recreational",
  };

  const openInMaps = () => {
    const destination = encodeURIComponent(`${locationData.name}, ${locationData.address}`);
    const provider = Platform.OS === 'ios' ? 'maps' : 'geo';
    const url = Platform.select({
      ios: `maps://0,0?q=${destination}`,
      android: `geo:0,0?q=${destination}`,
      default: `https://www.google.com/maps/search/?api=1&query=${destination}`
    });

    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open map app");
    });
  };

  // Helper to render stars based on the rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons 
          key={i} 
          name={i <= Math.floor(rating) ? "star" : "star-outline"} 
          size={18} 
          color="#FFD700" // Gold color
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

const handleCreateEvent = () => {
    // Navigate and pass the location data to the next screen
    navigation.navigate("createevent", {
      selectedLocation: {
        name: locationData.name,
        address: locationData.address,
        type: locationData.type
      }
    });
  };

  return (
    <ScreenLayout showBack={true}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Location Details</Text>

        {/* 1. Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={40} color="#5962ff" />
          <Text style={styles.mapText}>Map Preview Placeholder</Text>
          <Text style={styles.mapSubText}>(Google Maps SDK Integration)</Text>
        </View>

        {/* 2. Main Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="location" size={24} color="#5962ff" />
            </View>
            <TouchableOpacity 
              style={styles.titleTextContainer} 
              onPress={openInMaps}
              activeOpacity={0.7}
            >
              <View style={styles.nameHeaderRow}>
                <Text style={styles.locationName}>{locationData.name}</Text>
                <Ionicons name="open-outline" size={16} color="#5679f9" style={{marginLeft: 5}} />
              </View>
              <Text style={styles.locationType}>{locationData.type} • Tap to Navigate</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* 3. Rating Section */}
          <View style={styles.detailRow}>
            <Ionicons name="star-half-outline" size={20} color="#888" />
            <View style={styles.ratingContainer}>
              <View style={styles.starRow}>
                {renderStars(locationData.rating)}
              </View>
              <Text style={styles.ratingScore}>{locationData.rating}</Text>
              <Text style={styles.reviewCount}>({locationData.reviewCount} reviews)</Text>
            </View>
          </View>

          {/* 4. Review Button (Only if user has visited) */}
        {hasVisited && (
          <TouchableOpacity 
            style={styles.reviewPromptCard}
            onPress={() => Alert.alert("Review", "Navigate to Review Creation Screen")}
          >
            <View style={styles.reviewPromptContent}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#5962ff" />
              <View style={styles.reviewPromptTextContainer}>
                <Text style={styles.reviewPromptTitle}>You've been here before!</Text>
                <Text style={styles.reviewPromptSub}>Share your experience with others.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
        )}

          {/* 5. Pressable Buttons */}
          <View style={styles.interactionRow}>
            <TouchableOpacity 
              style={styles.interactionButton} 
              onPress={() => setIsFavorited(!isFavorited)}
            >
              <Ionicons 
                name={isFavorited ? "heart" : "heart-outline"} 
                size={26} 
                color={isFavorited ? "#ff4b4b" : "#333"} 
              />
              <Text style={[styles.interactionText, isFavorited && {color: "#ff4b4b"}]}>
                Favorite
              </Text>
            </TouchableOpacity>

            <View style={styles.verticalDivider} />

            <TouchableOpacity 
              style={styles.interactionButton} 
              onPress={() => setIsBookmarked(!isBookmarked)}
            >
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isBookmarked ? "#5962ff" : "#333"} 
              />
              <Text style={[styles.interactionText, isBookmarked && {color: "#5962ff"}]}>
                Wishlist
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateEvent}>
            <Text style={styles.primaryButtonText}>Create an Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>See in-app Reviews</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -10
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#F0F3FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E1E8FF',
    borderStyle: 'dashed',
  },
  mapText: {
    marginTop: 10,
    color: '#5962ff',
    fontWeight: 'bold',
  },
  mapSubText: {
    color: '#A0AEC0',
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  titleTextContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  locationType: {
    fontSize: 14,
    color: '#5679f9',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  detailText: {
    flex: 1,
    fontSize: 15,
    color: '#555',
    marginLeft: 12,
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 30,
  },
  primaryButton: {
    backgroundColor: '#45d5af',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 12,
    height: 70,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#5962ff',
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
  },
  secondaryButtonText: {
    color: '#5962ff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  interactionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
  },
  ratingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginLeft: 12 
},
  starRow: { 
    flexDirection: 'row', 
    marginRight: 8 
},
  ratingScore: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333', 
    marginRight: 4 
},
  reviewCount: { 
    fontSize: 14, 
    color: '#888' 
},
nameHeaderRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
},
reviewPromptCard: {
    backgroundColor: 'rgba(89, 98, 255, 0.08)',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(89, 98, 255, 0.2)',
  },
  reviewPromptContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
},
  reviewPromptTextContainer: { 
    flex: 1, 
    marginLeft: 12 
},
  reviewPromptTitle: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#333' 
},
  reviewPromptSub: { 
    fontSize: 13, 
    color: '#666', 
    marginTop: 2 
},
});