import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { ScreenLayout } from "@/components/screenLayout";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { auth } from "@/src/config/firebase";
import axios from "axios";
import { API_URL } from "@/src/config/api";
import { getToken } from '@/src/utils/auth';

export default function BadgesScreen() {
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [unearnedBadges, setUnearnedBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mongoUserId, setMongoUserId] = useState<string | null>(null);

   useEffect(() => {
    const fetchBadges = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await getToken();

        // Get mongoId
        const profileRes = await axios.get(`${API_URL}/profile?firebaseUid=${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const mongoId = profileRes.data._id;
        setMongoUserId(mongoId);

        // Get badges
        const badgesRes = await axios.get(`${API_URL}/badges/user/${mongoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setEarnedBadges(badgesRes.data.earned);
        setUnearnedBadges(badgesRes.data.unearned);
      } catch (err: any) {
        console.error("Failed to fetch badges:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const allBadges = [
    ...earnedBadges.map(b => ({ ...b, earned: true })),
    ...unearnedBadges.map(b => ({ ...b, earned: false })),
  ];

  const renderBadge = ({ item }: { item: any }) => (
    <View style={[styles.badgeCard, !item.earned && styles.lockedBadge]}>
      <View style={[styles.iconCircle, { backgroundColor: item.earned ? '#45d5af' : '#E0E0E0' }]}>
        {item.iconUrl ? (
          <Image source={{ uri: item.iconUrl }} style={{ width: 36, height: 36 }} />
        ) : (
          <Ionicons name={item.earned ? 'trophy' : 'lock-closed'} size={30} color="#FFF" />
        )}
      </View>
      <Text style={styles.badgeName}>{item.name}</Text>
      <Text style={styles.badgeDesc}>{item.description}</Text>
      {item.earned && item.earnedAt && (
        <Text style={styles.progressText}>
          Earned {new Date(item.earnedAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
        </Text>
      )}
    </View>
  );

  return (
    <ScreenLayout showBack={true}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>My Badges</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{earnedBadges.length}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{earnedBadges.length + unearnedBadges.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <FlatList
          data={allBadges}
          renderItem={renderBadge}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15 },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -10
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 15,
    borderRadius: 20,
  },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 14, color: '#E0E0E0' },
  listContent: { paddingBottom: 40 },
  columnWrapper: { justifyContent: 'space-between' },
  badgeCard: {
    backgroundColor: '#FFF',
    width: '48%',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  lockedBadge: {
    opacity: 0.8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 11,
    color: '#777',
    textAlign: 'center',
    marginVertical: 5,
    height: 30,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginTop: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#AAA',
    marginTop: 4,
  }
});