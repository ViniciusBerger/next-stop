import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/src/config/firebase';
import { removeToken } from '@/src/utils/auth';
import { AdminScreenLayout } from '@/components/adminScreenLayout';
import { showToast } from '@/components/ui/Toast';
import Svg_SVG, { Polyline as SVGPolyline } from 'react-native-svg';
import axios from 'axios';
import { API_URL } from '@/src/config/api';

type AiStats = {
  total: number;
  trending: { _id: string; count: number }[];
  daily: { _id: string; count: number }[];
};

const MiniGraph = ({ data }: { data: number[] }) => {
  if (data.length < 2) {
    return (
      <Svg_SVG width={90} height={36} viewBox="0 0 90 36">
        <SVGPolyline
          points="0,18 45,18 90,18"
          fill="none"
          stroke="#AAAAAA"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </Svg_SVG>
    );
  }

  const max = Math.max(...data, 1);
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 90;
      const y = 32 - (v / max) * 30;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? '#22C55E' : '#EF4444';

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
    </Svg_SVG>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AiStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get<AiStats>(`${API_URL}/ai/stats`);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch AI stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await removeToken();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
    showToast('Dashboard updated', 'success');
  };

  // Fill in all 7 days so the graph always has enough points,
  // defaulting missing days to 0.
  const dailyCounts = (() => {
    if (!stats) return Array(7).fill(0);
    const map = new Map(stats.daily.map((d) => [d._id, d.count]));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return map.get(key) ?? 0;
    });
  })();
  const todayCount = dailyCounts[dailyCounts.length - 1] ?? 0;
  const topVibe = stats?.trending[0];

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
            <Text style={styles.username}>Admin</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={28} color="#888" />
          </View>
        </View>

        {/* Analytics Cards Container — with cyan glow border */}
        <View style={styles.analyticsContainer}>
          {loading ? (
            <ActivityIndicator color="#000000" style={{ marginVertical: 30 }} />
          ) : (
            <>
              {/* Card 1: Total AI Searches */}
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsTitle}>Total AI Searches</Text>
                <Text style={styles.metricValue}>{stats?.total ?? 0}</Text>
                <View style={styles.graphWrapper}>
                  <MiniGraph data={dailyCounts} />
                </View>
              </View>

              {/* Card 2: Top Vibe */}
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsTitle}>Top Vibe</Text>
                <Text style={styles.metricValue} numberOfLines={1}>
                  {topVibe?._id ?? '—'}
                </Text>
                {topVibe && (
                  <Text style={styles.metricSub}>{topVibe.count} searches</Text>
                )}
              </View>

              {/* Card 3: Daily Usage */}
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsTitle}>Daily Usage (7d)</Text>
                <Text style={styles.metricValue}>{todayCount} today</Text>
                <View style={styles.graphWrapper}>
                  <MiniGraph data={dailyCounts} />
                </View>
              </View>
            </>
          )}
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
            onPress={() => router.push('../adminsettings')}
          >
            <Text style={styles.actionButtonText}>System Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#dc2626" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
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
    borderColor: '#282828',
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000000',
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
    marginBottom: 6,
    alignSelf: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 6,
    textAlign: 'center',
  },
  metricSub: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    textAlign: 'center',
  },
  graphWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 30,
    paddingVertical: 18,
    borderWidth: 1.5,
    borderColor: '#dc2626',
    backgroundColor: '#FFF1F1',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
});
