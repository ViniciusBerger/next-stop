import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { ScreenLayout } from "@/components/screenLayout";
import { EmptyState, LoadingSpinner, ErrorState } from "@/components/ui/StateComponents";
import { auth } from "@/src/config/firebase";
import axios from "axios";
import { API_URL } from "@/src/config/api";
import { getToken } from "@/src/utils/auth";
import { PlaceCard } from "@/components/placeCard";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";

export default function HistoryScreen() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchHistory = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("📚 Fetching history for:", uid);


      const token = await getToken();
      console.log("🔑 Token:", token ? "EXISTS" : "NULL");


      // Get MongoDB _id from profile
      const profileRes = await axios.get(`${API_URL}/profile?firebaseUid=${uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("👤 Profile:", profileRes.data._id);

      const mongoId = profileRes.data._id;

      // Get user's events
      const eventsRes = await axios.get(`${API_URL}/events/user/${mongoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("📅 Events:", eventsRes.data);

      const now = new Date();

      // Only past events
      const pastEvents = [
        ...eventsRes.data.created.filter((e: any) => new Date(e.date) <= now),
        ...eventsRes.data.attending.filter((e: any) => new Date(e.date) <= now),
      ];

      // Map to place objects, removing duplicates
      const seenPlaceIds = new Set();
      const uniquePlaces = pastEvents
        .filter((e: any) => {
          const placeId = e.place?._id ?? e.place;
          if (!placeId || seenPlaceIds.has(placeId)) return false;
          seenPlaceIds.add(placeId);
          return true;
        })
        .map((e: any) => ({
          id: e.place?._id ?? e.place,
          name: e.place?.name ?? 'Unknown Place',
          address: e.place?.address ?? '',
          category: e.place?.category ?? e.place?.type ?? 'Place',
          rating: e.place?.averageUserRating ?? e.place?.googleRating ?? 0,
          distance: new Date(e.date).toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric' 
          }),
        }));

      setReviews(uniquePlaces); // reusing reviews state for places
    } catch (err: any) {
      console.error("History fetch error:", err.response?.status, err.response?.data);
      setError("Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRetry = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      fetchHistory(currentUser.uid);
    }
  };

  useEffect(() => {
  const load = async () => {
    const user = auth.currentUser;
    if (user) {
      fetchHistory(user.uid);
    } else {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          fetchHistory(user.uid);
        } else {
          setLoading(false);
        }
        unsubscribe();
      });
    }
  };
  load();
}, [fetchHistory]);

  const Header = () => (
    <View style={styles.headerBlock} />
  );

  if (loading) {
    return (
      <ScreenLayout showBack={true} title="History">
        <Header />
        <View style={styles.stateWrapper}>
          <LoadingSpinner text="Loading your history..." />
        </View>
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout showBack={true} title="History">
        <Header />
        <View style={styles.stateWrapper}>
          <ErrorState error={error} onRetry={handleRetry} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout showBack={true} title="History">
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12 }}>
            <PlaceCard
              place={item}
              onPress={() => router.push({
                pathname: "/locationdetails",
                params: { place: JSON.stringify(item) }
              })}
            />
          </View>
        )}
        ListHeaderComponent={Header}
        ListEmptyComponent={
          <View style={styles.stateWrapper}>
            <EmptyState
              icon="time-outline"
              title="No history yet"
              message="Places you have visited will appear here."
            />
          </View>
        }
        ListFooterComponent={<View style={{ height: 20 }} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
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
    marginTop: 0,
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