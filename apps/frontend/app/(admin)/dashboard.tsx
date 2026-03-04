import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AdminScreenLayout } from '@/components/adminScreenLayout';
import { showToast } from '@/components/ui/Toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const { width } = Dimensions.get('window');

// Mock data for dashboard stats
const MOCK_STATS = {
  totalUsers: 12547,
  totalPlaces: 3892,
  totalEvents: 567,
  totalReviews: 8234,
  pendingReports: 78,
  pendingFeedback: 134,
  newToday: {
    users: 42,
    places: 15,
    events: 8,
    reviews: 67
  }
};

// Define types for screen items
interface ScreenItemWithCount {
  name: string;
  icon: string;
  path: string;
  count: number;
}

interface ScreenItemWithoutCount {
  name: string;
  icon: string;
  path: string;
}

type ScreenItem = ScreenItemWithCount | ScreenItemWithoutCount;

// Admin navigation sections
const ADMIN_SECTIONS: {
  id: string;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  screens: ScreenItem[];
}[] = [
  {
    id: 'users',
    title: 'User Management',
    icon: 'people',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    screens: [
      { name: 'All Users', icon: 'person', path: '/users', count: 12547 },
      { name: 'Moderation', icon: 'shield', path: '/moderation', count: 78 },
      { name: 'Banned Users', icon: 'ban', path: '/banned', count: 23 }
    ]
  },
  {
    id: 'content',
    title: 'Content Management',
    icon: 'document-text',
    color: '#10B981',
    bgColor: '#DCFCE7',
    screens: [
      { name: 'Places', icon: 'location', path: '/places', count: 3892 },
      { name: 'Events', icon: 'calendar', path: '/events', count: 567 },
      { name: 'Reviews', icon: 'star', path: '/reviews', count: 8234 }
    ]
  },
  {
    id: 'reports',
    title: 'Reports & Feedback',
    icon: 'flag',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    screens: [
      { name: 'User Reports', icon: 'flag', path: '/reports', count: 78 },
      { name: 'Feedback', icon: 'chatbubble', path: '/feedback', count: 134 },
      { name: 'Moderation Log', icon: 'document-text', path: '/moderation-log', count: 2456 }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: 'bar-chart',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    screens: [
      { name: 'Dashboard', icon: 'pie-chart', path: '/analytics' },
      { name: 'Reports', icon: 'document', path: '/analytics/reports' },
      { name: 'Export Data', icon: 'download', path: '/analytics/export' }
    ]
  },
  {
    id: 'system',
    title: 'System',
    icon: 'settings',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    screens: [
      { name: 'Settings', icon: 'cog', path: '/adminsettings' },
      { name: 'API Status', icon: 'cloud', path: '/api-status' },
      { name: 'Logs', icon: 'document', path: '/logs' }
    ]
  }
];

// Quick action buttons
const QUICK_ACTIONS = [
  { name: 'Add Place', icon: 'add-circle', path: '/places/add', color: '#10B981' },
  { name: 'New Admin', icon: 'person-add', path: '/users/add', color: '#3B82F6' },
  { name: 'View Reports', icon: 'flag', path: '/reports', color: '#EF4444' },
  { name: 'Analytics', icon: 'bar-chart', path: '/analytics', color: '#8B5CF6' }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(MOCK_STATS);
  const { isConnected, isInitialized } = useNetworkStatus();

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      showToast('Dashboard updated', 'success');
    }, 1000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const StatCard = ({ title, value, icon, color, onPress }: any) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Text style={styles.statValue}>{formatNumber(value)}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const SectionCard = ({ section }: { section: typeof ADMIN_SECTIONS[0] }) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: section.bgColor }]}>
          <Ionicons name={section.icon as any} size={24} color={section.color} />
        </View>
        <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
      </View>
      
      <View style={styles.sectionItems}>
        {section.screens.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.sectionItem}
            onPress={() => router.push(`/(admin)${item.path}` as any)}
          >
            <View style={styles.sectionItemLeft}>
              <Ionicons name={item.icon as any} size={18} color={section.color} />
              <Text style={styles.sectionItemText}>{item.name}</Text>
            </View>
            <View style={styles.sectionItemRight}>
              {'count' in item && (
                <View style={[styles.countBadge, { backgroundColor: `${section.color}20` }]}>
                  <Text style={[styles.countText, { color: section.color }]}>{item.count}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const QuickActionButton = ({ action }: { action: typeof QUICK_ACTIONS[0] }) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: action.color }]}
      onPress={() => router.push(`/(admin)${action.path}` as any)}
    >
      <Ionicons name={action.icon as any} size={24} color="#FFF" />
      <Text style={styles.quickActionText}>{action.name}</Text>
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
            colors={["#7E9AFF"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.adminName}>Admin</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#FFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Offline Banner */}
        {isInitialized && !isConnected && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={18} color="#D32F2F" />
            <Text style={styles.offlineBannerText}>You're offline. Showing cached data.</Text>
          </View>
        )}

        {/* Date */}
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="people"
            color="#3B82F6"
            onPress={() => router.push('/(admin)/users' as any)}
          />
          <StatCard
            title="Total Places"
            value={stats.totalPlaces}
            icon="location"
            color="#10B981"
            onPress={() => router.push('/(admin)/places' as any)}
          />
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon="calendar"
            color="#FF9800"
            onPress={() => router.push('/(admin)/events' as any)}
          />
          <StatCard
            title="Total Reviews"
            value={stats.totalReviews}
            icon="star"
            color="#FFC107"
            onPress={() => router.push('/(admin)/reviews' as any)}
          />
        </View>

        {/* Today's Activity */}
        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          <View style={styles.todayGrid}>
            <View style={styles.todayItem}>
              <Text style={styles.todayValue}>{stats.newToday.users}</Text>
              <Text style={styles.todayLabel}>New Users</Text>
            </View>
            <View style={styles.todayItem}>
              <Text style={styles.todayValue}>{stats.newToday.places}</Text>
              <Text style={styles.todayLabel}>New Places</Text>
            </View>
            <View style={styles.todayItem}>
              <Text style={styles.todayValue}>{stats.newToday.events}</Text>
              <Text style={styles.todayLabel}>New Events</Text>
            </View>
            <View style={styles.todayItem}>
              <Text style={styles.todayValue}>{stats.newToday.reviews}</Text>
              <Text style={styles.todayLabel}>New Reviews</Text>
            </View>
          </View>
        </View>

        {/* Pending Items Card */}
        <TouchableOpacity style={styles.pendingCard} onPress={() => router.push('/(admin)/reports' as any)}>
          <View style={styles.pendingContent}>
            <View style={styles.pendingLeft}>
              <View style={[styles.pendingIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="alert-circle" size={24} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.pendingTitle}>Pending Actions</Text>
                <Text style={styles.pendingSubtitle}>Reports & feedback need attention</Text>
              </View>
            </View>
            <View style={styles.pendingRight}>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{stats.pendingReports + stats.pendingFeedback}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action, index) => (
              <QuickActionButton key={index} action={action} />
            ))}
          </View>
        </View>

        {/* Admin Sections */}
        <View style={styles.sectionsContainer}>
          {ADMIN_SECTIONS.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </View>

        {/* System Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>System Status</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.statusLabel}>API Server</Text>
              <Text style={styles.statusValue}>Healthy</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.statusLabel}>Database</Text>
              <Text style={styles.statusValue}>Connected</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.statusLabel}>Cache</Text>
              <Text style={styles.statusValue}>85% used</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.statusLabel}>Storage</Text>
              <Text style={styles.statusValue}>42% used</Text>
            </View>
          </View>
        </View>

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
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
    marginBottom: 10,
    marginTop: -5,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  adminName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  offlineBannerText: {
    color: '#D32F2F',
    fontSize: 12,
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 13,
    color: '#666',
  },
  todaySection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  todayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  todayItem: {
    alignItems: 'center',
  },
  todayValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7E9AFF',
    marginBottom: 4,
  },
  todayLabel: {
    fontSize: 11,
    color: '#666',
  },
  pendingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  pendingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pendingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pendingSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  pendingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  pendingBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickActionsSection: {
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionsContainer: {
    gap: 16,
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionItems: {
    gap: 12,
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionItemText: {
    fontSize: 15,
    color: '#333',
  },
  sectionItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  lastUpdated: {
    textAlign: 'center',
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
  },
});