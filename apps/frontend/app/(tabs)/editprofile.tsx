import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '@/components/screenLayout';

const USER = {
  username: 'Example',
  email: 'example@email.com',
  avatar: 'https://i.pravatar.cc/150?img=12',
  preferences: {
    cuisine: 'Halal',
    dietary: 'Vegan',
    allergies: 'Eggs',
    activities: 'Pub/ Restaurant',
  },
  privacy: {
    activityFeed: 'All/ Friends/ None',
    favorites: 'All/ Friends/ None',
    myEvents: 'All/ Friends/ None',
    badges: 'All/ Friends/ None',
    preferences: 'All/ Friends/ None',
  },
};

export default function EditProfileScreen() {
  const router = useRouter();

  const SectionCard = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.sectionCard}>{children}</View>
  );

  const RowItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.rowItem}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );

  const ActionButton = ({ title, onPress }: { title: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout showBack={true}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: USER.avatar }} style={styles.avatar} />
        </View>

        {/* Profile Section */}
        <SectionCard>
          <Text style={styles.sectionTitle}>Profile</Text>

          <RowItem label="Username" value={USER.username} />
          <View style={styles.divider} />
          <RowItem label="Email" value={USER.email} />

          <ActionButton 
          title="Edit Information"
          onPress={() => router.push('/editinformation')} />
        </SectionCard>

        {/* Preferences Section */}
        <SectionCard>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <RowItem label="Cuisine" value={USER.preferences.cuisine} />
          <View style={styles.divider} />
          <RowItem label="Dietary labels" value={USER.preferences.dietary} />
          <View style={styles.divider} />
          <RowItem label="Allergies" value={USER.preferences.allergies} />
          <View style={styles.divider} />
          <RowItem label="Activities" value={USER.preferences.activities} />

          <ActionButton 
          title="Edit Preferences"
          onPress={() => router.push('/editpreferences')} />
        </SectionCard>

        {/* Privacy Section */}
        <SectionCard>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <RowItem label="See activity feed" value={USER.privacy.activityFeed} />
          <View style={styles.divider} />
          <RowItem label="Favorites" value={USER.privacy.favorites} />
          <View style={styles.divider} />
          <RowItem label="My Events" value={USER.privacy.myEvents} />
          <View style={styles.divider} />
          <RowItem label="Badges" value={USER.privacy.badges} />
          <View style={styles.divider} />
          <RowItem label="Preferences" value={USER.privacy.preferences} />

          <ActionButton 
          title="Edit Privacy Settings"
          onPress={() => router.push('/editprivacy')} />
        </SectionCard>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 10,
  },

  // Avatar
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 110,
  },

  // Section card — rounded pill container with cyan border
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#22D3EE',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: 16,
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 14,
  },

  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },

  // Action button inside each card
  actionButton: {
    backgroundColor: '#7E9AFF',
    borderRadius: 100,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});