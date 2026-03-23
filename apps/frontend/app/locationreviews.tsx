import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { ScreenLayout } from "@/components/screenLayout";
import { ReviewCard } from "@/components/reviewCard";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { API_URL } from "@/src/config/api";
import { auth } from "@/src/config/firebase";
import { getToken } from "@/src/utils/auth";

export default function LocationReviewsScreen() {
  const { placeId, placeName } = useLocalSearchParams<{ placeId: string; placeName: string }>();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mongoUserId, setMongoUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        const token = await getToken();

        // Get mongoId for isOwnReview check
        if (user) {
          const profileRes = await axios.get(`${API_URL}/profile?firebaseUid=${user.uid}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMongoUserId(profileRes.data._id);
        }

        // Fetch reviews for this place
        const mongoPlaceId = placeId;

        const res = await axios.get(`${API_URL}/reviews/place/${mongoPlaceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Reviews response:", res.data);
        console.log("Fetching reviews for mongoPlaceId:", mongoPlaceId);
        setReviews(res.data);
      } catch (err: any) {
        console.error("Failed to fetch reviews:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (placeId) fetchData();
  }, [placeId]);

  const handleDelete = async (reviewId: string) => {
    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'user-id': mongoUserId
        }
      });
      setReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err: any) {
      console.error("Failed to delete review:", err.response?.data || err.message);
    }
  };

  const formatReview = (review: any) => ({
    id: review._id,
    userName: review.author?.username ?? 'Unknown',
    date: new Date(review.date).toLocaleDateString([], { month: 'short', year: 'numeric' }),
    placeName: placeName ?? '',
    rating: review.rating,
    likes: review.likes ?? 0,
    hasImage: review.images?.length > 0,
    imageUrl: review.images?.[0] ?? null,
    text: review.reviewText,
    isOwnReview: review.author?._id === mongoUserId || review.author === mongoUserId,
  });

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={60} color="#4750ff" />
      <Text style={styles.emptyTitle}>No reviews yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to tell the community about your visit to this location!
      </Text>
    </View>
  );

  const Header = () => (
    <View style={styles.cardTop}>
      <Text style={styles.headerTitle}>{placeName ?? 'Reviews'}</Text>
      <View style={styles.whiteCardTop} />
    </View>
  );

  const Footer = () => <View style={styles.cardBottom} />;

  return (
    <ScreenLayout showBack={true}>
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: '#fff' }}>Loading reviews...</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const formatted = formatReview(item);
            return (
              <View style={styles.cardBody}>
                <ReviewCard
                  {...formatted}
                  onDelete={() => handleDelete(item._id)}
                />
              </View>
            );
          }}
          ListHeaderComponent={Header}
          ListFooterComponent={Footer}
          ListEmptyComponent={
            <View>
              <View style={styles.cardBody} />
              <EmptyState />
            </View>
          }
          ItemSeparatorComponent={() => (
            <View style={styles.cardBody}>
              <View style={styles.divider} />
            </View>
          )}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  listPadding: { paddingBottom: 40 },
  cardTop: { alignItems: 'center', marginTop: -10 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, marginTop: 3 },
  whiteCardTop: {
    backgroundColor: '#FFF', width: '100%', height: 40,
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
  },
  cardBody: {
    backgroundColor: '#FFF', borderLeftWidth: 1, borderRightWidth: 1,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  cardBottom: {
    backgroundColor: '#FFF', height: 40,
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    borderBottomWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
  },
  divider: { height: 1, backgroundColor: '#EEE', width: '100%', marginVertical: 10 },
  emptyContainer: {
    backgroundColor: '#FFF', borderLeftWidth: 1, borderRightWidth: 1,
    padding: 50, alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 15 },
  emptySubtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 22 },
});