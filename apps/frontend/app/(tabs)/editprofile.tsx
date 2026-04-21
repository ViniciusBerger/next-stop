import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenLayout } from '@/components/screenLayout';
import { auth } from '@/src/config/firebase';
import { API_URL } from '@/src/config/api';
import { getToken } from '@/src/utils/auth';
import axios from 'axios';

export default function EditProfileScreen() {
  const router = useRouter();
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?img=12');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState({
    cuisine: '',
    dietaryLabels: '',
    allergies: '',
    activities: '',
  });
  const [privacy, setPrivacy] = useState({
    activityFeed: '',
    favorites: '',
    myEvents: '',
    badges: '',
    preferences: '',
  });

  // 👇 reloads every time you come back to this screen
  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;

          const token = await getToken();
          const res = await axios.get(
            `${API_URL}/profile?firebaseUid=${user.uid}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setUsername(res.data.username || '');
          setEmail(res.data.email || '');
          if (res.data.profile?.profilePicture) {
            setAvatar(res.data.profile.profilePicture);
          }
          if (res.data.profile?.preferences) {
            setPreferences(res.data.profile.preferences);
          }
          if (res.data.profile?.privacy) {
            setPrivacy(res.data.profile.privacy);
          }
        } catch (err) {
          console.log("Load profile error:", err);
        }
      };

      loadProfile();
    }, [])
  );

  const SectionCard = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.sectionCard}>{children}</View>
  );

  const RowItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.rowItem}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
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
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
        </View>

        <SectionCard>
          <Text style={styles.sectionTitle}>Profile</Text>
          <RowItem label="Username" value={username} />
          <View style={styles.divider} />
          <RowItem label="Email" value={email} />
          <ActionButton
            title="Edit Information"
            onPress={() => router.push('/editinformation')}
          />
        </SectionCard>

        {/* <SectionCard>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <RowItem label="Cuisine" value={preferences.cuisine} />
          <View style={styles.divider} />
          <RowItem label="Dietary labels" value={preferences.dietaryLabels} />
          <View style={styles.divider} />
          <RowItem label="Allergies" value={preferences.allergies} />
          <View style={styles.divider} />
          <RowItem label="Activities" value={preferences.activities} />
          <ActionButton
            title="Edit Preferences"
            onPress={() => router.push('/editpreferences')}
          />
        </SectionCard> */}

        <SectionCard>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <RowItem label="See activity feed" value={privacy.activityFeed} />
          <View style={styles.divider} />
          {/* <RowItem label="Favorites" value={privacy.favorites} /> */}
          <View style={styles.divider} />
          <RowItem label="My Events" value={privacy.myEvents} />
          <View style={styles.divider} />
          <RowItem label="Badges" value={privacy.badges} />
          <View style={styles.divider} />
          {/* <RowItem label="Preferences" value={privacy.preferences} /> */}
          <ActionButton
            title="Edit Privacy Settings"
            onPress={() => router.push('/editprivacy')}
          />
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
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 110,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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