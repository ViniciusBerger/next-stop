import React, { use, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from "react-native";
import { ScreenLayout } from "@/components/screenLayout";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { auth } from "@/src/config/firebase";
import axios from "axios";
import { API_URL } from "@/src/config/api";
import { getToken } from "@/src/utils/auth";
import { showAlert } from '@/src/utils/alert';
import { AppMap } from '@/components/AppMap';

export default function LocationDetailsScreen() {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const router = useRouter();
  // This would come from Firestore user visit history
  const [hasVisited, setHasVisited] = useState(false);
  const params = useLocalSearchParams();

  const place = typeof params.place === 'string' ? JSON.parse(params.place) : null;

  const placeId = place?._id ?? place?.id;
  const placeName = place?.name ?? "Unknown Location";
  const placeAddress = place?.address ?? "";
  const placeRating = place?.averageUserRating ?? place?.googleRating ?? 0;
  const placeType = place?.category ?? place?.type ?? "Place";
  const placeReviewCount = place?.totalUserReviews ?? place?.googleReviewCount ?? 0;

  const openInMaps = () => {
    const destination = encodeURIComponent(`${placeName}, ${placeAddress}`);
    const url = Platform.select({
      ios: `maps://0,0?q=${destination}`,
      android: `geo:0,0?q=${destination}`,
      default: `https://www.google.com/maps/search/?api=1&query=${destination}`
    });

    Linking.openURL(url).catch(() => {
      showAlert("Error", "Could not open map app");
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
    router.push({
      pathname: "/createevent",
      params: { 
        placeId: placeId,
        placeName: placeName,
        placeAddress: placeAddress,
      }
    });
  };

  useEffect(() => {
    const checkVisit = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await getToken();

        // Get MongoDB _id
        const profileRes = await axios.get(`${API_URL}/profile?firebaseUid=${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const mongoId = profileRes.data._id;

        // Get user's events
        const eventsRes = await axios.get(`${API_URL}/events/user/${mongoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const now = new Date();
        const pastAttended = [
          ...eventsRes.data.created.filter((e: any) => new Date(e.date) <= now),
          ...eventsRes.data.attending.filter((e: any) => new Date(e.date) <= now),
        ];

        // Check if any past event was at this place
        const visited = pastAttended.some(
          (e: any) => e.place?._id === placeId || e.place === placeId
        );

        setHasVisited(visited);
      } catch (err) {
        console.error("Failed to check visit history:", err);
      }
    };

    if (placeId){
      checkVisit();
      loadSavedState();
    }
  }, [placeId]);

  const loadSavedState = async () => {
  try {
    const token = await getToken();

    const [favoritesRes, wishlistRes] = await Promise.all([
      axios.get(`${API_URL}/user/me/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_URL}/user/me/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const favoriteIds = favoritesRes.data.map((p: any) => p._id ?? p.id);
    const wishlistIds = wishlistRes.data.map((p: any) => p._id ?? p.id);

    setIsFavorited(favoriteIds.includes(placeId));
    setIsBookmarked(wishlistIds.includes(placeId));
  } catch (err) {
    console.error("Failed to load saved place state:", err);
  }
};

const handleToggleFavorite = async () => {
  try {
    const token = await getToken();

    await axios.patch(
      `${API_URL}/user/me/favorites/${placeId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setIsFavorited((prev) => !prev);
  } catch (err) {
    console.error("Failed to toggle favorite:", err);
  }
};

const handleToggleWishlist = async () => {
  try {
    const token = await getToken();

    await axios.patch(
      `${API_URL}/user/me/wishlist/${placeId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setIsBookmarked((prev) => !prev);
  } catch (err) {
    console.error("Failed to toggle wishlist:", err);
  }
};

  return (
    <ScreenLayout showBack={true} title="Location Details">
      <View style={styles.container}>

        {/* 1. Map */}
        <AppMap
          focusedPlace={place ? { ...place, id: placeId } : undefined}
          style={styles.mapContainer}
        />

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
                <Text style={styles.locationName} numberOfLines={2} ellipsizeMode="tail">{placeName}</Text>
                <Ionicons name="open-outline" size={16} color="#5679f9" style={{marginLeft: 5}} />
              </View>
              <Text style={styles.locationType}>{placeType} • Tap to Navigate</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* 3. Rating Section */}
          <View style={styles.detailRow}>
            <Ionicons name="star-half-outline" size={20} color="#888" />
            <View style={styles.ratingContainer}>
              <View style={styles.starRow}>
                {renderStars(placeRating)}
              </View>
              <Text style={styles.ratingScore}>{placeRating}</Text>
              <Text style={styles.reviewCount}>({placeReviewCount} Google reviews)</Text>
            </View>
          </View>

          {/* 4. Review Button (Only if user has visited) */}
        {hasVisited && (
          <TouchableOpacity 
            style={styles.reviewPromptCard}
            onPress={() => router.push({
              pathname: "/createreview",
              params: { 
                placeId: placeId, // MongoDB ID
                placeName: placeName // Place name so it is showed on create review
              }}
            )}
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
              onPress={handleToggleFavorite}
              hitSlop={{ top: 12, bottom: 12, left: 20, right: 20 }}
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
              onPress={handleToggleWishlist}
              hitSlop={{ top: 12, bottom: 12, left: 20, right: 20 }}
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
          
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push({
            pathname: '/locationreviews',
            params: { placeId, placeName }
          })}>
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
    marginTop: 0
  },
  mapContainer: {
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
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
    fontSize: 20,
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
    fontSize: 20,
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
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
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