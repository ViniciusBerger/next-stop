import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AdminScreenLayout } from '@/components/adminScreenLayout';
import { showToast } from '@/components/ui/Toast';

const { width } = Dimensions.get('window');

// Analytics data
const ANALYTICS_DATA = {
  users: { value: '1,254', change: '+12%', color: '#4CAF50' },
  places: { value: '489', change: '+8%', color: '#4CAF50' },
  reviews: { value: '2,341', change: '+15%', color: '#F44336' },
  active: { value: '187', change: '-3%', color: '#F44336' }
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

  const AnalyticsCard = ({ title, value, change, color }: any) => (
    <View style={styles.analyticsCard}>
      <Text style={styles.analyticsTitle}>{title}</Text>
      <View style={styles.analyticsContent}>
        <Text style={styles.analyticsValue}>{value}</Text>
        <View style={styles.analyticsGraph}>
          {/* Green line graph - solid line */}
          <View style={[styles.graphLine, { backgroundColor: color === '#4CAF50' ? '#4CAF50' : '#F44336' }]} />
          {/* Red dashed line graph */}
          {color === '#F44336' && (
            <View style={styles.dashedLine}>
              <View style={[styles.dash, { backgroundColor: '#F44336' }]} />
              <View style={[styles.dash, { backgroundColor: '#F44336' }]} />
              <View style={[styles.dash, { backgroundColor: '#F44336' }]} />
            </View>
          )}
        </View>
      </View>
      <Text style={[styles.analyticsChange, { color }]}>{change}</Text>
    </View>
  );

  const MenuCard = ({ icon, title, onPress, color = '#7E9AFF' }: any) => (
    <TouchableOpacity style={styles.menuCard} onPress={onPress}>
      <View style={[styles.menuIconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <AdminScreenLayout showBack={false}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7E9AFF"
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
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={40} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Analytics Section Title */}
        <Text style={styles.sectionTitle}>Analytics</Text>

        {/* Analytics Cards Grid */}
        <View style={styles.analyticsGrid}>
          <AnalyticsCard
            title="Total Users"
            value={ANALYTICS_DATA.users.value}
            change={ANALYTICS_DATA.users.change}
            color={ANALYTICS_DATA.users.color}
          />
          <AnalyticsCard
            title="Total Places"
            value={ANALYTICS_DATA.places.value}
            change={ANALYTICS_DATA.places.change}
            color={ANALYTICS_DATA.places.color}
          />
          <AnalyticsCard
            title="Total Reviews"
            value={ANALYTICS_DATA.reviews.value}
            change={ANALYTICS_DATA.reviews.change}
            color={ANALYTICS_DATA.reviews.color}
          />
          <AnalyticsCard
            title="Active Today"
            value={ANALYTICS_DATA.active.value}
            change={ANALYTICS_DATA.active.change}
            color={ANALYTICS_DATA.active.color}
          />
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <MenuCard
            icon="flag-outline"
            title="Manage Reports"
            onPress={() => router.push('/(admin)/reports' as any)}
            color="#EF4444"
          />
          <MenuCard
            icon="people-outline"
            title="Manage Users"
            onPress={() => router.push('/(admin)/moderation' as any)}
            color="#3B82F6"
          />
          <MenuCard
            icon="settings-outline"
            title="System Settings"
            onPress={() => router.push('/(admin)/adminsettings' as any)}
            color="#8B5CF6"
          />
        </View>

        {/* Version Info */}
        <Text style={styles.versionText}>NextStop Admin v1.0.0</Text>
      </ScrollView>
    </AdminScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: -5,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  analyticsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  analyticsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  analyticsGraph: {
    flex: 1,
    height: 24,
    marginLeft: 8,
    justifyContent: 'center',
  },
  graphLine: {
    height: 2,
    width: '100%',
    borderRadius: 1,
  },
  dashedLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dash: {
    width: 6,
    height: 2,
    borderRadius: 1,
  },
  analyticsChange: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  menuSection: {
    gap: 12,
    marginBottom: 30,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },
});