import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { ScreenLayout } from '@/components/screenLayout';
import axios from 'axios';
import { API_URL } from '@/src/config/api';
import { getToken } from '@/src/utils/auth';

export default function UserProfileScreen() {
  const { username, avatar: avatarParam } = useLocalSearchParams<{ username: string; avatar: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`${API_URL}/profile?username=${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);

        const reviewsRes = await axios.get(`${API_URL}/reviews/profile/${res.data._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
      } catch (err) {
        console.log('UserProfile fetch error:', err);
        setError('Could not load profile.');
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <ScreenLayout showBack={true} title={username ?? 'Profile'}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7E9AFF" />
        </View>
      </ScreenLayout>
    );
  }

  if (error || !profile) {
    return (
      <ScreenLayout showBack={true} title={username ?? 'Profile'}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
          <Text style={styles.errorText}>{error ?? 'Profile not found.'}</Text>
        </View>
      </ScreenLayout>
    );
  }

  // profilePicture and bio live under profile.profile due to the schema nesting,
  // but the DTO tries to expose them at the top level — check both paths.
  const avatarUrl =
    avatarParam ||
    profile.profilePicture ||
    profile.profile?.profilePicture ||
    `https://i.pravatar.cc/150?u=${profile._id}`;

  const bio = profile.bio || profile.profile?.bio;

  const prefs = profile.preferences || profile.profile?.preferences;
  const privacy = profile.privacy || profile.profile?.privacy;

  const showPreferences = privacy?.preferences !== 'private';

  return (
    <ScreenLayout showBack={true} title={profile.username ?? username}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Avatar + username */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <Text style={styles.username}>{profile.username}</Text>
          {bio ? <Text style={styles.bio}>{bio}</Text> : null}
        </View>

        {/* Friends count */}
        <View style={styles.friendsContainer}>
          <Text style={styles.friendsCount}>
            {profile.friends?.length ?? 0} Friends
          </Text>
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          {profile.badges?.length > 0 ? (
            <View style={styles.emptyRow}>
              <Ionicons name="ribbon-outline" size={20} color="#7E9AFF" />
              <Text style={styles.emptySubText}>
                {profile.badges.length} badge{profile.badges.length !== 1 ? 's' : ''} earned
              </Text>
            </View>
          ) : (
            <View style={styles.emptyRow}>
              <Ionicons name="ribbon-outline" size={20} color="#ccc" />
              <Text style={styles.emptySubText}>No badges yet</Text>
            </View>
          )}
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviews.length > 0 ? (
            reviews.map((review: any) => (
              <View key={review._id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewPlace}>{review.place?.name ?? 'Unknown place'}</Text>
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={13} color="#F59E0B" />
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                  </View>
                </View>
                {review.reviewText ? (
                  <Text style={styles.reviewText} numberOfLines={2}>{review.reviewText}</Text>
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.emptyRow}>
              <Ionicons name="chatbubble-outline" size={20} color="#ccc" />
              <Text style={styles.emptySubText}>No reviews yet</Text>
            </View>
          )}
        </View>

        {/* Preferences */}
        {showPreferences && prefs && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            {prefs.cuisine ? (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Cuisine</Text>
                <Text style={styles.preferenceValue}>{prefs.cuisine}</Text>
              </View>
            ) : null}

            {prefs.dietaryLabels ? (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Dietary labels</Text>
                <Text style={styles.preferenceValue}>{prefs.dietaryLabels}</Text>
              </View>
            ) : null}

            {prefs.allergies ? (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Allergies</Text>
                <Text style={styles.preferenceValue}>{prefs.allergies}</Text>
              </View>
            ) : null}

            {prefs.activities ? (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Activities</Text>
                <Text style={styles.preferenceValue}>{prefs.activities}</Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#7E9AFF',
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 4,
  },
  friendsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  friendsCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  reviewItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewPlace: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reviewRatingText: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '600',
  },
  reviewText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});
