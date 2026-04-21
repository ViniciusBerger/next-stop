import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, Animated } from 'react-native';
import { ScreenLayout } from "@/components/screenLayout";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useRef } from "react";
import { auth } from "@/src/config/firebase";
import axios from "axios";
import { API_URL } from "@/src/config/api";
import { getToken } from '@/src/utils/auth';

export default function BadgesScreen() {
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [unearnedBadges, setUnearnedBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mongoUserId, setMongoUserId] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const openBadge = (item: any) => {
    setSelectedBadge(item);
    setModalVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  };

  const closeBadge = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setModalVisible(false);
      setSelectedBadge(null);
    });
  };

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await getToken();

        const profileRes = await axios.get(
          `${API_URL}/profile?firebaseUid=${user.uid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const mongoId = profileRes.data._id;
        setMongoUserId(mongoId);

        // recalc first
        await axios.post(
          `${API_URL}/badges/recalculate/${mongoId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // get badges WITH progress using mongoId
        const res = await axios.get(
          `${API_URL}/badges?userId=${mongoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const badges = Array.isArray(res.data) ? res.data : res.data.badges || [];
        const earned = badges.filter((b: any) => b.earned === true);
        const unearned = badges.filter((b: any) => !b.earned);
        setEarnedBadges(earned);
        setUnearnedBadges(unearned);

      } catch (err: any) {
        console.log("BADGE ERROR:", err?.response?.data || err);
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

  const renderBadge = ({ item }: { item: any }) => {
    const progress = item.progress || { current: 0, target: 1 };
    const progressPercent = Math.min((progress.current / progress.target) * 100, 100);

    return (
      <TouchableOpacity
        style={[styles.badgeCard, !item.earned && styles.lockedBadge]}
        onPress={() => openBadge(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconCircle, { backgroundColor: item.earned ? '#45d5af' : '#D0D0D0' }]}>
          {item.iconUrl ? (
            <Image
              source={{ uri: item.iconUrl }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                opacity: item.earned ? 1 : 0.3,
              }}
            />
          ) : (
            <Ionicons name={item.earned ? 'trophy' : 'lock-closed'} size={30} color="#FFF" />
          )}
        </View>
        <Text style={[styles.badgeName, !item.earned && { color: '#BBBBBB' }]}>{item.name}</Text>

        {/* Progress bar - show for unearned only */}
        {!item.earned && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, {
              width: `${progressPercent}%` as any,
              backgroundColor: '#45d5af',
            }]} />
          </View>
        )}
        {!item.earned && (
          <Text style={styles.progressText}>{progress.current}/{progress.target}</Text>
        )}

        {item.earned && item.earnedAt && (
          <Text style={styles.progressText}>
            Earned {new Date(item.earnedAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout showBack={true} title="My Badges">
      <View style={styles.container}>

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
          keyExtractor={(item) => item._id?.toString() || item.badgeId?.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>

      {/* Badge Detail Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={closeBadge}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeBadge}
        >
          <Animated.View
            style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}
          >
            <TouchableOpacity activeOpacity={1}>

              <View style={[
                styles.modalIconCircle,
                { backgroundColor: selectedBadge?.earned ? '#45d5af' : '#ffffff' },
                selectedBadge?.earned && styles.glowCircle
              ]}>
                {selectedBadge?.iconUrl ? (
                  <Image
                    source={{ uri: selectedBadge.iconUrl }}
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: 70,
                      opacity: selectedBadge?.earned ? 1 : 0.3,
                    }}
                  />
                ) : (
                  <Ionicons
                    name={selectedBadge?.earned ? 'trophy' : 'lock-closed'}
                    size={60}
                    color="#FFF"
                  />
                )}
              </View>

              {selectedBadge?.earned && (
                <View style={styles.earnedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color="#45d5af" />
                  <Text style={styles.earnedText}>Earned</Text>
                </View>
              )}

              <Text style={styles.modalBadgeName}>{selectedBadge?.name}</Text>
              <Text style={styles.modalBadgeDesc}>{selectedBadge?.description}</Text>

              {selectedBadge?.earned && selectedBadge?.earnedAt && (
                <Text style={styles.modalEarnedAt}>
                  EARNED: {new Date(selectedBadge.earnedAt).toLocaleDateString([], {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </Text>
              )}

              {/* Progress bar in modal for unearned */}
              {!selectedBadge?.earned && selectedBadge?.progress && (
                <View style={styles.modalProgressContainer}>
                  <View style={styles.modalProgressTrack}>
                    <View style={[styles.modalProgressBar, {
                      width: `${Math.min((selectedBadge.progress.current / selectedBadge.progress.target) * 100, 100)}%` as any,
                    }]} />
                  </View>
                  <Text style={styles.modalProgressText}>
                    {selectedBadge.progress.current} / {selectedBadge.progress.target}
                  </Text>
                </View>
              )}

              {!selectedBadge?.earned && (
                <View style={styles.lockedInfo}>
                  <Ionicons name="lock-closed" size={14} color="#ffffff" />
                  <Text style={styles.lockedText}>Keep going to unlock this badge!</Text>
                </View>
              )}

              <TouchableOpacity style={[
                styles.closeBtn,
                !selectedBadge?.earned && { backgroundColor: '#ffffff' }
              ]} onPress={closeBadge}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>

            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

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
    marginTop: 0
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
    padding: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  lockedBadge: {
    backgroundColor: '#F0F0F0',
    opacity: 0.75,
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
    width: '90%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginTop: 15,
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
    marginTop: 10,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 30,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  glowCircle: {
    shadowColor: '#45d5af',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
  },
  earnedText: {
    color: '#45d5af',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalBadgeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBadgeDesc: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  modalEarnedAt: {
    fontSize: 13,
    color: '#AAA',
    marginBottom: 20,
    marginLeft: 90,
  },
  modalProgressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalProgressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  modalProgressBar: {
    height: '100%',
    backgroundColor: '#45d5af',
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 13,
    color: '#AAA',
    fontWeight: 'bold',
  },
  lockedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 20,
  },
  lockedText: {
    fontSize: 13,
    color: '#AAA',
    fontStyle: 'italic',
    justifyContent: 'center',
    marginLeft: 15,
  },
  closeBtn: {
    backgroundColor: '#45d5af',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 5,
  },
  closeBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});