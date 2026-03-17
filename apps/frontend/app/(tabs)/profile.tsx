import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '@/components/screenLayout';

// Mock user data
const USER = {
  username: 'Username',
  avatar: 'https://i.pravatar.cc/150?img=12',
  friends: 128,
  badges: [
    { id: '1', name: 'Badge name' },
    { id: '2', name: 'Badge name' }
  ],
  preferences: {
    cuisine: 'Italian',
    dietary: 'Vegan',
    allergies: 'None'
  }
};

// Mock posts data
const POSTS = [
  {
    id: '1',
    placeName: "Place's name",
    date: 'Month - year',
    likes: 88,
    description: 'Description of outing here'
  },
  {
    id: '2',
    placeName: "Place's name",
    date: 'Month - year',
    likes: 42,
    description: 'Description of outing here'
  }
];

export default function ProfileScreen() {
  const router = useRouter();

  const renderPost = ({ item }: { item: typeof POSTS[0] }) => (
    <View style={styles.postCard}>
      <Text style={styles.postPlaceName}>{item.placeName}</Text>
      <Text style={styles.postDate}>{item.date}</Text>
      
      <View style={styles.postContent}>
        <View style={styles.postIcon}>
          <Ionicons name="image-outline" size={40} color="#9CA3AF" />
        </View>
        <View style={styles.postDetails}>
          <Text style={styles.postDescription}>{item.description}</Text>
          <View style={styles.likesContainer}>
            <Ionicons name="heart-outline" size={16} color="#EF4444" />
            <Text style={styles.likesText}>{item.likes} likes</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenLayout showBack={true}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: USER.avatar }} style={styles.avatar} />
          <Text style={styles.username}>{USER.username}</Text>
        </View>

        {/* Friends Count */}
        <View style={styles.friendsContainer}>
          <Text style={styles.friendsCount}>{USER.friends} Friends</Text>
        </View>

        {/* Badges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgesContainer}>
            {USER.badges.map((badge, index) => (
              <View key={badge.id} style={styles.badgeItem}>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Cuisine</Text>
            <Text style={styles.preferenceValue}>{USER.preferences.cuisine}</Text>
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Dietary labels</Text>
            <Text style={styles.preferenceValue}>{USER.preferences.dietary}</Text>
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Allergies</Text>
            <Text style={styles.preferenceValue}>{USER.preferences.allergies}</Text>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/editprofile')}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Posts Section */}
        <View style={styles.postsSection}>
          {POSTS.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <Text style={styles.postPlaceName}>{post.placeName}</Text>
              <Text style={styles.postDate}>{post.date}</Text>
              
              <View style={styles.postContent}>
                <View style={styles.postIcon}>
                  <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                </View>
                <View style={styles.postDetails}>
                  <Text style={styles.postDescription}>{post.description}</Text>
                  <View style={styles.likesContainer}>
                    <Ionicons name="heart-outline" size={16} color="#EF4444" />
                    <Text style={styles.likesText}>{post.likes} likes</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
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
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeName: {
    fontSize: 14,
    color: '#374151',
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