import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Platform
} from "react-native";
import { DiscoverCard } from "../../components/discoverCard";
import { PostCard } from "../../components/postCard";
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

const MOCK_POSTS = [
  {
    id: '1',
    username: 'Sarah K.',
    date: 'March 2026',
    imageUrl: '',
    likes: 88,
    description: 'Beautiful sunset at the beach! 🌅 #sunset #beachday'
  },
  {
    id: '2',
    username: 'Mike R.',
    date: 'March 2026',
    imageUrl: '',
    likes: 42,
    description: 'Great coffee at this new spot ☕ #coffeelover'
  },
  {
    id: '3',
    username: 'Alex P.',
    date: 'Feb 2026',
    imageUrl: '',
    likes: 156,
    description: 'Amazing hiking trails! 🥾 #nature #hiking'
  },
  {
    id: '4',
    username: 'Jessica L.',
    date: 'Feb 2026',
    imageUrl: '',
    likes: 67,
    description: 'Live music night was incredible! 🎸 #music'
  },
  {
    id: '5',
    username: 'David C.',
    date: 'Jan 2026',
    imageUrl: '',
    likes: 93,
    description: 'Food festival was amazing! 🍔 #foodie'
  }
];

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [username, setUsername] = useState("Username");
  const [profilePicture, setProfilePicture] = useState(''); // ADDED
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  const { isConnected, isInitialized } = useNetworkStatus();

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    console.log("onAuthStateChanged launched. User:", user?.uid ?? "NULL");
    console.log("auth.currentUser:", auth.currentUser?.uid ?? "NULL");

    if (user) {
      const token = await getToken();
      console.log("Token:", token ? "EXISTS" : "MISSING");

      if (token) {
        try {
          const response = await axios.get(`${API_URL}/profile?firebaseUid=${user.uid}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data?.username) {
            setUsername(response.data.username);
          }
          // ADDED
          if (response.data?.profile?.profilePicture) {
            setProfilePicture(response.data.profile.profilePicture);
          }
        } catch (apiError: any) {
          console.error("API Error:", apiError.response?.status, apiError.response?.data);
        }
      }
    }
    loadPosts();
  });

  return () => unsubscribe();
}, []);

  // ADDED - reload profile picture every time home screen is focused
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
          // Fetch unread notification count
          const mongoId = response.data._id;
          if (mongoId) {
            const countRes = await axios.get(`${API_URL}/notifications/unread-count?userId=${mongoId}`);
            setUnreadNotifications(countRes.data);
          }
        } catch (err) {
          console.log("Profile reload error:", err);
        }
      };
      reloadProfile();
    }, [])
  );

  useEffect(() => {
    if (isInitialized && !isConnected) {
      showToast('You are offline. Showing cached content.', 'warning', 5000);
    }
  }, [isConnected, isInitialized]);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPosts(MOCK_POSTS);
    } catch (err) {
      setError('Failed to load posts');
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPosts();
  }, []);

  const handleRetry = () => {
    loadPosts();
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

  if (error && !refreshing && posts.length === 0) {
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
            <Text style={localStyles.offlineBannerText}>You're offline. Showing cached content.</Text>
          </View>
        )}

        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              username={post.username}
              date={post.date}
              imageUrl={post.imageUrl}
              likes={post.likes}
              description={post.description}
            />
          ))
        ) : (
          !loading && (
            <View style={localStyles.emptyContainer}>
              <Ionicons name="images-outline" size={64} color="#ccc" />
              <Text style={localStyles.emptyTitle}>No Posts Yet</Text>
              <Text style={localStyles.emptyMessage}>
                Be the first to share your outing with the community!
              </Text>
              <TouchableOpacity 
                style={localStyles.emptyButton}
                onPress={() => router.push("/createreview")}
              >
                <Text style={localStyles.emptyButtonText}>Create Post</Text>
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