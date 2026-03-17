import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { ScreenLayout } from "@/components/screenLayout";
import { Ionicons } from '@expo/vector-icons';

// Mock data for badges
const BADGES = [
  { id: '1', name: '3 Outings', description: 'Complete 3 outings', progress: 3, total: 3, icon: 'trophy', color: '#FFD700', earned: true },
  { id: '2', name: 'Fresh Perspective', description: 'Review a new spot', progress: 1, total: 1, icon: 'eye', color: '#45d5af', earned: true },
  { id: '3', name: 'Paparazzi', description: 'Upload 10 photos', progress: 4, total: 10, icon: 'camera', color: '#5962ff', earned: false },
  { id: '4', name: 'Social Butterfly', description: 'Meet 5 new groups', progress: 2, total: 5, icon: 'people', color: '#9775FA', earned: false },
  { id: '5', name: 'Night Owl', description: '3 Late night outings', progress: 0, total: 3, icon: 'moon', color: '#2C3E50', earned: false },
  { id: '6', name: 'Local Legend', description: '5 visits to one spot', progress: 5, total: 5, icon: 'medal', color: '#FF8C00', earned: true },
];

export default function BadgesScreen() {

  const renderBadge = ({ item }: { item: typeof BADGES[0] }) => {
    const progressWidth = (item.progress / item.total) * 100;

    return (
      <View style={[styles.badgeCard, !item.earned && styles.lockedBadge]}>
        <View style={[styles.iconCircle, { backgroundColor: item.earned ? item.color : '#E0E0E0' }]}>
          <Ionicons 
            name={item.earned ? (item.icon as any) : 'lock-closed'} 
            size={30} 
            color="#FFF" 
          />
        </View>
        
        <Text style={styles.badgeName}>{item.name}</Text>
        <Text style={styles.badgeDesc}>{item.description}</Text>

        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${progressWidth}%`, backgroundColor: item.color }]} />
        </View>
        <Text style={styles.progressText}>{item.progress}/{item.total}</Text>
      </View>
    );
  };

  return (
    <ScreenLayout showBack={true}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>My Badges</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{BADGES.filter(b => b.earned).length}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{BADGES.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <FlatList
          data={BADGES}
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