import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AdminScreenLayout } from '@/components/adminScreenLayout';
import { showToast } from '@/components/ui/Toast';
import Svg_SVG, { Polyline as SVGPolyline } from 'react-native-svg';

const { width } = Dimensions.get('window');

const ANALYTICS_DATA = [
  { title: 'Analitics', trend: 'up', points: '0,30 20,20 40,25 60,10 80,5' },
  { title: 'Analitics', trend: 'down', points: '0,5 20,15 40,10 60,25 80,30' },
  { title: 'Analitics', trend: 'up', points: '0,30 20,18 40,22 60,8 80,2' },
];

// Simple SVG line graph component
const MiniGraph = ({ trend }: { trend: 'up' | 'down' }) => {
  const color = trend === 'up' ? '#22C55E' : '#EF4444';
  const points =
    trend === 'up'
      ? '0,32 18,22 36,26 54,12 72,6 90,2'
      : '0,2 18,12 36,8 54,22 72,26 90,32';

  return (
    <Svg_SVG width={90} height={36} viewBox="0 0 90 36">
      <SVGPolyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow head */}
      {trend === 'up' ? (
        <>
          <SVGPolyline
            points="82,8 90,2 84,10"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <SVGPolyline
            points="82,26 90,32 84,24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </Svg_SVG>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Dashboard updated', 'success');
    }, 1000);
  };

  return (
    <AdminScreenLayout showBack={false}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7FFFD4"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.username}>Username</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={28} color="#888" />
          </View>
        </View>

        {/* Analytics Cards Container — with cyan glow border */}
        <View style={styles.analyticsContainer}>
          {ANALYTICS_DATA.map((item, index) => (
            <View key={index} style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>{item.title}</Text>
              <View style={styles.graphWrapper}>
                <MiniGraph trend={item.trend as 'up' | 'down'} />
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(admin)/reports' as any)}
          >
            <Text style={styles.actionButtonText}>Manage Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(admin)/moderation' as any)}
          >
            <Text style={styles.actionButtonText}>Manage Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(admin)/adminsettings' as any)}
          >
            <Text style={styles.actionButtonText}>System Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AdminScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  username: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Analytics outer container with cyan glow border
  analyticsContainer: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#22D3EE', // cyan/teal glow border
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
    marginBottom: 24,
    // Glow effect via shadow
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },

  analyticsCard: {
    backgroundColor: '#E8E8E8',
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  analyticsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
    alignSelf: 'center',
  },
  graphWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Buttons
  buttonsSection: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#C8D8F0',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: 0.2,
  },
});