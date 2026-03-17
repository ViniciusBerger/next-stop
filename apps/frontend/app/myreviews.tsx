import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { ScreenLayout } from "@/components/screenLayout";
import { ReviewCard } from "@/components/reviewCard";
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/config/firebase";
import axios from "axios";
import { API_URL } from "@/src/config/api";

export default function MyReviewsScreen() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  // Avoids waiting for async auth restore
  const currentUser = auth.currentUser;
  if (currentUser) {
    console.log("Immediate user found:", currentUser.uid);
    fetchReviews(currentUser.uid);
    setLoading(false);
    return;
  }

  // Fallback, wait for Firebase to restore session
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    console.log("MyReviews auth user:", user?.uid ?? "NULL");
    if (!user) {
      setLoading(false);
      return;
    }
    fetchReviews(user.uid);
  });

  return () => unsubscribe();
}, []);

const fetchReviews = async (uid: string) => {
  try {
    const token = localStorage.getItem("userToken");
    console.log("Fetching reviews for:", uid);
    
    const response = await axios.get(`${API_URL}/reviews/user/${uid}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const mapped = response.data.map((review: any) => ({
      id: review._id,
      mongoAuthorId: review.author?._id ?? review.author,
      userName: review.author?.username ?? "Unknown",
      date: review.date
        ? new Date(review.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "Unknown date",
      placeName: review.place?.name ?? review.place ?? "Unknown place",
      rating: review.rating,
      likes: review.likes ?? 0,
      hasImage: review.images?.length > 0,
      imageUrl: review.images?.[0] ?? null,
      text: review.reviewText,
    }));

    console.log("Mapped reviews:", mapped.length);
    setReviews(mapped);
  } catch (err: any) {
    console.error("Reviews fetch error:", err.response?.status, err.response?.data);
    setError("Failed to load reviews.");
  } finally {
    setLoading(false);
  }
};

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={50} color="#ccc" />
      <Text style={styles.emptyTitle}>No reviews yet</Text>
      <Text style={styles.emptySubtitle}>
        Your thoughts on the places you've visited will appear here.
      </Text>
    </View>
  );

  const ErrorState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="alert-circle-outline" size={50} color="#dc2626" />
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity onPress={() => setLoading(true)} style={styles.retryButton}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // 1. The Top of the Card
  const Header = () => (
    <View style={styles.cardTop}>
      <Text style={styles.headerTitle}>My Reviews</Text>
      <View style={styles.whiteCardTop}>
        <Ionicons name="hand-right-outline" size={80} color="#5962ff" style={styles.topIcon} />
      </View>
    </View>
  );

  // 2. The Bottom of the Card
  const Footer = () => <View style={styles.cardBottom} />;

  if (loading) {
    return (
      <ScreenLayout showBack={true}>
        <Header />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptySubtitle}>Loading your reviews...</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout showBack={true}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardBody}>
            <ReviewCard
              {...item}
              isOwnReview={true}
              onDelete={async () => {
                try {
                  const token = localStorage.getItem("userToken");
                  await axios.delete(`${API_URL}/reviews/${item.id}`, {
                    headers: {
                      "user-id": item.mongoAuthorId,
                      Authorization: `Bearer ${token}`
                    }
                  });
                  // Remove from local state instantly without refetching
                  setReviews(prev => prev.filter(r => r.id !== item.id));
                } catch (err) {
                  console.error("Delete failed:", err);
                }
              }}
            />
          </View>
        )}
        ListHeaderComponent={Header}
        ListFooterComponent={Footer}
        ListEmptyComponent={error ? ErrorState : EmptyState}
        ItemSeparatorComponent={() => (
          <View style={styles.cardBody}>
            <View style={styles.divider} />
          </View>
        )}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  listPadding: {
    paddingBottom: 40,
  },
  cardTop: {
    alignItems: 'center',
    marginTop: -10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  whiteCardTop: {
    backgroundColor: '#FFF',
    width: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  cardBody: {
    backgroundColor: '#FFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cardBottom: {
    backgroundColor: '#FFF',
    height: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  topIcon: {
    transform: [{ rotate: '-15deg' }],
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#000000',
    width: '100%',
    marginVertical: 10,
  },
  emptyContainer: {
    backgroundColor: '#FFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#7d77f0',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});