import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router'; //  add useFocusEffect
import { ScreenLayout } from '@/components/screenLayout';
import { auth } from '@/src/config/firebase'; //  ADD
import { API_URL } from '@/src/config/api'; // ADD
import { getToken } from '@/src/utils/auth'; //  ADD
import axios from 'axios'; // ADD

export default function ProfileScreen() {
  const router = useRouter();

  const [avatar, setAvatar] = useState();
  const [username, setUsername] = useState('Username');
  const [bio, setBio] = useState('');
  const [friendsCount, setFriendsCount] = useState(0);
  const [badges, setBadges] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [preferences, setPreferences] = useState({
    cuisine: '',
    dietary: '',
    allergies: ''
  });

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;

          const token = await getToken();
          const headers = { Authorization: `Bearer ${token}` };

          // Fetch profile and reviews in parallel
          const [profileRes, reviewsRes] = await Promise.all([
            axios.get(`${API_URL}/profile?firebaseUid=${user.uid}`, { headers }),
            axios.get(`${API_URL}/reviews/user/${user.uid}`, { headers }),
          ]);

          const data = profileRes.data;
          setUsername(data.username || 'Username');
          setFriendsCount(data.friends?.length || 0);
          setBio(data.profile?.bio || '');

          if (data.profile?.profilePicture) {
            setAvatar(data.profile.profilePicture);
          }

          if (data.profile?.preferences) {
            setPreferences({
              cuisine: data.profile.preferences.cuisine || '',
              dietary: data.profile.preferences.dietaryLabels || '',
              allergies: data.profile.preferences.allergies || '',
            });
          }

          // Badges — populated from backend
          if (data.badges?.length > 0) {
            setBadges(
              data.badges
                .filter((b: any) => b.badge) // filter out any unresolved refs
                .map((b: any) => ({
                  id: b.badge._id || b.badge,
                  name: b.badge.name || 'Badge',
                  iconUrl: b.badge.iconUrl || '',
                  earnedAt: b.earnedAt,
                }))
            );
          } else {
            setBadges([]);
          }

          // Reviews
          setReviews(reviewsRes.data || []);
        } catch (err) {
          console.log("Load profile error:", err);
        }
      };

      loadProfile();
    }, [])
  );

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const name: any = i <= rating ? 'star' : i - 0.5 === rating ? 'star-half' : 'star-outline';
      stars.push(<Ionicons key={i} name={name} size={14} color="#FFD700" />);
    }
    return stars;
  };

  return (
    <ScreenLayout showBack={true}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <Text style={styles.username}>{username}</Text>
          {bio ? <Text style={styles.bioText}>{bio}</Text> : null}
        </View>

        {/* Friends Count */}
        <View style={styles.friendsContainer}>
          <Text style={styles.friendsCount}>{friendsCount} Friends</Text>
        </View>

        {/* Badges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          {badges.length > 0 ? (
            <View style={styles.badgesContainer}>
              {badges.map((badge) => (
                <View key={badge.id} style={styles.badgeItem}>
                  {badge.iconUrl ? (
                    <Image source={{ uri: badge.iconUrl }} style={styles.badgeIcon} />
                  ) : null}
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No badges earned yet</Text>
          )}
        </View>

        {/* Preferences Section
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Cuisine</Text>
            <Text style={styles.preferenceValue}>{preferences.cuisine || '-'}</Text>
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Dietary labels</Text>
            <Text style={styles.preferenceValue}>{preferences.dietary || '-'}</Text>
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Allergies</Text>
            <Text style={styles.preferenceValue}>{preferences.allergies || '-'}</Text>
          </View>
        </View> */}

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/editprofile')}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Reviews Section */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>My Reviews</Text>
          {reviews.length > 0 ? (
            reviews.map((review: any) => (
              <TouchableOpacity
                key={review._id || review.id}
                style={styles.postCard}
                onPress={() => router.push({
                  pathname: '/locationdetails',
                  params: { place: JSON.stringify(review.place) }
                })}
                activeOpacity={0.7}
              >
                <Text style={styles.postPlaceName}>
                  {review.place?.name || 'Unknown Place'}
                </Text>
                <Text style={styles.postDate}>
                  {new Date(review.date || review.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>

                <View style={styles.postContent}>
                  {review.images?.length > 0 ? (
                    <Image source={{ uri: review.images[0] }} style={styles.reviewImage} />
                  ) : (
                    <View style={styles.postIcon}>
                      <Ionicons name="chatbubble-outline" size={30} color="#9CA3AF" />
                    </View>
                  )}
                  <View style={styles.postDetails}>
                    <View style={styles.starsRow}>{renderStars(review.rating)}</View>
                    <Text style={styles.postDescription} numberOfLines={2}>
                      {review.reviewText}
                    </Text>
                    <View style={styles.likesContainer}>
                      <Ionicons name="heart" size={14} color="#EF4444" />
                      <Text style={styles.likesText}>{review.likes || 0} likes</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No reviews yet</Text>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 110,
    marginBottom: 8,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bioText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
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
  badgesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  badgeName: {
    fontSize: 14,
    color: '#374151',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 8,
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
  editButton: {
    backgroundColor: '#7E9AFF',
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  postsSection: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 20,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  postPlaceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  postDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  postContent: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  postIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  postDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  postDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesText: {
    fontSize: 12,
    color: '#6B7280',
  },
});