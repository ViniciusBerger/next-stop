import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { ScreenLayout } from "@/components/screenLayout";
import { PlaceCard } from "@/components/placeCard";
import { useFocusEffect, useRouter } from "expo-router";
import axios from "axios";
import { API_URL } from "@/src/config/api";
import { EmptyState } from "@/components/ui/StateComponents";
import { getToken } from "@/src/utils/auth";

export default function WishlistScreen() {
  const router = useRouter();
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchWishlist = async () => {
        try {
          setLoading(true);
          const token = await getToken();

          const response = await axios.get(`${API_URL}/user/me/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const mapped = response.data.map((item: any) => ({
            ...item,
            id: item._id || item.id,
            type: item.category ?? item.type ?? "place",
            distance: "Saved",
            rating: item.averageUserRating ?? item.googleRating ?? 0,
          }));

          setPlaces(mapped);
        } catch (error) {
          console.error("Failed to fetch wishlist:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchWishlist();
    }, [])
  );

  return (
    <ScreenLayout showBack={true}>
      <View style={styles.container}>
        <Text style={styles.title}>Wishlist</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#5962ff" />
        ) : places.length === 0 ? (
          <EmptyState
            icon="bookmark-outline"
            title="Your wishlist is empty"
            message="Save places you want to visit later."
            />
        ) : (
          places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onPress={() =>
                router.push({
                  pathname: "/locationdetails",
                  params: { place: JSON.stringify(place) },
                })
              }
            />
          ))
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 0,
  },
  emptyText: {
    color: "#000",
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
  },
});