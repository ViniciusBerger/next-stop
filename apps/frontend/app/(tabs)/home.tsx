import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { DiscoverCard } from "../../components/discoverCard";
import { ActivityCard, FeedItem } from "../../components/activityCard";
import { BottomTabBar } from "../../components/bottomTabBar";
import { HomeHeader } from "../../components/homeHeader";
import { styles } from "../../src/styles/login.styles";
import HomeMenu from "../../components/homeMenu";
import { useRouter, useFocusEffect } from "expo-router"; // ADDED useFocusEffect
import axios from "axios";
import { auth } from "@/src/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { SimpleFeedSkeleton } from "@/components/ActivityFeedSkeleton";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { showToast } from "@/components/ui/Toast";
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from "@/src/config/api";
import { getToken } from "@/src/utils/auth";

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [username, setUsername] = useState("Username");
  const [profilePicture, setProfilePicture] = useState('');
  const [mongoId, setMongoId] = useState<string | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  const { isConnected, isInitialized } = useNetworkStatus();

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await getToken();

      if (token) {
        try {
          const response = await axios.get(`${API_URL}/profile?firebaseUid=${user.uid}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data?.username) {
            setUsername(response.data.username);
          }
          if (response.data?.profile?.profilePicture) {
            setProfilePicture(response.data.profile.profilePicture);
          }
          if (response.data?._id) {
            setMongoId(response.data._id);
          }
        } catch (apiError: any) {
          console.error("API Error:", apiError.response?.status, apiError.response?.data);
        }
      }
    }
  });

  return () => unsubscribe();
}, []);

  // Reload profile + feed every time home screen is focused
  useFocusEffect(
    useCallback(() => {
      const reloadProfile = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const token = await getToken();
        if (!token) return;
        try {
          const response = await axios.get(`${API_URL}/profile?firebaseUid=${user.uid}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data?.username) setUsername(response.data.username);
          if (response.data?.profile?.profilePicture) {
            setProfilePicture(response.data.profile.profilePicture);
          }
          const id = response.data._id;
          if (id) {
            setMongoId(id);
            const countRes = await axios.get(`${API_URL}/notifications/unread-count?userId=${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadNotifications(countRes.data);
          }
        } catch (err) {
          console.error("Profile reload error:", err);
        }
      };
      reloadProfile();
    }, [])
  );

  // Load feed when mongoId becomes available
  useEffect(() => {
    if (mongoId) loadFeed();
  }, [mongoId]);

  useEffect(() => {
    if (isInitialized && !isConnected) {
      showToast('You are offline. Some content may not be available.', 'warning', 5000);
    }
  }, [isConnected, isInitialized]);

  const loadFeed = async () => {
    if (!mongoId) return;
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/feed?userId=${mongoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedItems(response.data);
    } catch (err) {
      setError('Failed to load activity feed');
      showToast('Failed to load activity feed', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLike = async (reviewId: string) => {
    const firebaseUid = auth.currentUser?.uid;
    if (!firebaseUid) return;
    try {
      const token = await getToken();
      const res = await axios.post(
        `${API_URL}/reviews/like`,
        { reviewId, userId: firebaseUid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedItems(prev => prev.map(item =>
        item.id === reviewId
          ? { ...item, likes: res.data.likes, likedBy: (res.data.likedBy ?? []).map((u: any) => u._id?.toString?.() ?? u.toString()) }
          : item
      ));
    } catch (err: any) {
      console.error("Failed to like review:", err.response?.data || err.message);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeed();
  }, [mongoId]);

  const handleRetry = () => {
    loadFeed();
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <View style={styles.headerBackground} />
        <HomeHeader 
          username={username}
          avatarUrl={profilePicture} // 👈 ADDED
          onMenuPress={() => setIsMenuOpen(true)}
          onNotificationsPress={() => router.push('/notifications')}
          unreadCount={unreadNotifications}
        />
        <DiscoverCard onPress={() => router.push("/discover")} />
        <SimpleFeedSkeleton count={5} />
        <BottomTabBar />
      </View>
    );
  }

  if (error && !refreshing && feedItems.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <View style={styles.headerBackground} />
        <HomeHeader 
          username={username}
          avatarUrl={profilePicture} // ADDED
          onMenuPress={() => setIsMenuOpen(true)}
          onNotificationsPress={() => router.push('/notifications')}
          unreadCount={unreadNotifications}
        />
        <DiscoverCard onPress={() => router.push("/discover")} />
        <View style={localStyles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text style={localStyles.errorTitle}>Something went wrong</Text>
          <Text style={localStyles.errorMessage}>{error}</Text>
          <TouchableOpacity style={localStyles.retryButton} onPress={handleRetry}>
            <Text style={localStyles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
        <BottomTabBar />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7d77f0"
            colors={["#7d77f0"]}
          />
        }
      >
        <View style={styles.headerBackground} />
        <HomeHeader 
          username={username}
          avatarUrl={profilePicture} //  ADDED
          onMenuPress={() => setIsMenuOpen(true)}
          onNotificationsPress={() => router.push('/notifications')}
          unreadCount={unreadNotifications}
        />

        <DiscoverCard onPress={() => router.push("/discover")} />

        {isInitialized && !isConnected && (
          <View style={localStyles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={18} color="#D32F2F" />
            <Text style={localStyles.offlineBannerText}>You're offline. Some content may not be available.</Text>
          </View>
        )}

        {feedItems.length > 0 ? (
          feedItems.map((item) => (
            <ActivityCard
              key={item.id}
              item={item}
              currentUserId={mongoId}
              onLike={(reviewId) => handleLike(reviewId)}
              onEventPress={(eventId) => router.push(`/events/${eventId}`)}
              onPlacePress={(place) => router.push({
                pathname: '/locationdetails',
                params: { place: JSON.stringify(place) }
              })}
            />
          ))
        ) : (
          !loading && (
            <View style={localStyles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={localStyles.emptyTitle}>No Activity Yet</Text>
              <Text style={localStyles.emptyMessage}>
                Follow friends and favorite places to see activity here!
              </Text>
              <TouchableOpacity
                style={localStyles.emptyButton}
                onPress={() => router.push("/discover")}
              >
                <Text style={localStyles.emptyButtonText}>Discover Places</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </ScrollView>
      
      <HomeMenu 
        isVisible={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
      
      <BottomTabBar />
    </View>
  );
}

const localStyles = StyleSheet.create({
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 50,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#7d77f0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFA5A5',
    gap: 8,
  },
  offlineBannerText: {
    color: '#D32F2F',
    fontSize: 14,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#7d77f0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});