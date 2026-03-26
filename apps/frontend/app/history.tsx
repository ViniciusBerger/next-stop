import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { ScreenLayout } from "@/components/screenLayout";
import { ReviewCard } from "@/components/reviewCard";
import { EmptyState, LoadingSpinner, ErrorState } from "@/components/ui/StateComponents";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/config/firebase";
import axios from "axios";
import { API_URL } from "@/src/config/api";

export default function HistoryScreen() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("userToken");

      const response = await axios.get(`${API_URL}/reviews/user/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped = response.data.map((review: any) => ({
        id: review._id,
        userName: review.author?.username ?? "Unknown",
        date: review.date
          ? new Date(review.date).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "Unknown date",
        placeName: review.place?.name ?? review.place ?? "Unknown place",
        rating: review.rating,
        likes: review.likes ?? 0,
        hasImage: review.images?.length > 0,
        imageUrl: review.images?.[0] ?? null,
        text: review.reviewText,
      }));

      setReviews(mapped);
    } catch (err: any) {
      console.error("History fetch error:", err.response?.status, err.response?.data);
      setError("Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      fetchHistory(currentUser.uid);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      fetchHistory(user.uid);
    });

    return () => unsubscribe();
  }, [fetchHistory]);

  const handleRetry = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      fetchHistory(currentUser.uid);
    }
  };

  const Header = () => (
    <View style={styles.headerBlock}>
      <Text style={styles.headerTitle}>History</Text>
    </View>
  );

  if (loading) {
    return (
      <ScreenLayout showBack={true}>
        <Header />
        <View style={styles.stateWrapper}>
          <LoadingSpinner text="Loading your history..." />
        </View>
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout showBack={true}>
        <Header />
        <View style={styles.stateWrapper}>
          <ErrorState error={error} onRetry={handleRetry} />
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
            <ReviewCard {...item} />
          </View>
        )}
        ListHeaderComponent={Header}
        ListEmptyComponent={
          <View style={styles.stateWrapper}>
            <EmptyState
              icon="time-outline"
              title="No history yet"
              message="Places you reviewed will appear here."
            />
          </View>
        }
        ItemSeparatorComponent={() => (
          <View style={styles.cardBody}>
            <View style={styles.divider} />
          </View>
        )}
        ListFooterComponent={<View style={styles.cardBottom} />}
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
  headerBlock: {
    marginTop: -10,
    marginBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  cardBody: {
    backgroundColor: "#FFF",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#000000",
    width: "100%",
    marginVertical: 10,
  },
  cardBottom: {
    backgroundColor: "#FFF",
    height: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  stateWrapper: {
    backgroundColor: "#FFF",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 260,
  },
});