import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

// Mock API functions for admin check (ADD THIS)
const API = {
  checkAdminStatus: async () => {
    // TODO: Replace with your actual API call
    // const response = await fetch('/api/auth/check-admin');
    // return response.ok;
    
    // Mock response - always true for testing
    // In production, this should check actual admin status
    return true;
  }
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // ADD THIS
  
  // Analytics data state
  const [analytics, setAnalytics] = useState({
    users: {
      total: 1254,
      activeToday: 187,
      activeThisWeek: 892,
      newToday: 12,
      newThisWeek: 78,
      newThisMonth: 345,
    },
    places: {
      total: 489,
      pendingApproval: 23,
      newToday: 5,
      categories: {
        restaurant: 156,
        cafe: 98,
        park: 67,
        museum: 45,
        shopping: 89,
        other: 34,
      },
    },
    reviews: {
      total: 2341,
      pendingModeration: 42,
      flagged: 18,
      averageRating: 4.3,
      newToday: 28,
    },
    reports: {
      total: 67,
      pending: 12,
      resolved: 48,
      byType: {
        user: 28,
        place: 22,
        review: 17,
      },
    },
    feedback: {
      total: 156,
      pending: 23,
      resolved: 118,
    },
    growth: {
      userGrowth: 12.5,
      placeGrowth: 8.3,
      reviewGrowth: 15.2,
    },
  });

  // Check admin status on mount (ADD THIS)
  useEffect(() => {
    checkAdminAccess();
  }, []);

  // Admin access check function (ADD THIS)
  const checkAdminAccess = async () => {
    try {
      const admin = await API.checkAdminStatus();
      setIsAdmin(admin);
      if (!admin) {
        Alert.alert(
          'Access Denied',
          'You do not have permission to access the admin dashboard.',
          [
            { 
              text: 'OK', 
              onPress: () => router.back() 
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      Alert.alert('Error', 'Failed to verify admin access');
      router.back();
    }
  };

  const adminStats = {
    totalUsers: 1254,
    totalPlaces: 489,
    totalReviews: 2341,
    activeToday: 187,
  };

  // Mock feedback stats
  const feedbackStats = {
    pending: 8,
    inReview: 3,
    resolved: 15,
    total: 26,
  };

  // Mock report stats
  const reportStats = {
    pending: 12,
    highPriority: 5,
    total: 67,
  };

  // Load analytics data
  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Data is already set in initial state
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (isAdmin) { // ADD THIS CONDITION
      loadAnalyticsData();
    }
  }, [isAdmin]); // ADD isAdmin dependency

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
  };

  // Format number with K/M suffix
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Get growth color
  const getGrowthColor = (value: number) => {
    if (value > 0) return '#4CAF50';
    if (value < 0) return '#F44336';
    return '#666';
  };

  // Helper function for category colors
  const getCategoryColor = (category: string) => {
    const colors = {
      restaurant: '#FF6B6B',
      cafe: '#4ECDC4',
      park: '#95E1D3',
      museum: '#F9D56E',
      shopping: '#E36387',
      other: '#A8A7A7',
    };
    return colors[category as keyof typeof colors] || '#A8A7A7';
  };

  // Admin navigation sections
  const adminSections = [
    {
      title: 'User Management',
      icon: '👥',
      items: [
        { label: 'View All Users', icon: '👁️', screen: 'users' },
        { label: 'Add New User', icon: '➕', screen: 'add-user' },
        { label: 'User Reports', icon: '📊', screen: 'user-reports' },
      ],
      color: '#3B82F6',
    },
    {
      title: 'Content Management',
      icon: '🏢',
      items: [
        { label: 'Manage Places', icon: '📍', screen: 'places' },
        { label: 'Approve Submissions', icon: '✅', screen: 'approvals' },
        { label: 'Content Reports', icon: '🚩', screen: 'reports' },
      ],
      color: '#10B981',
    },
    {
      title: 'Moderation',
      icon: '🛡️',
      items: [
        { label: 'User Moderation', icon: '⚖️', screen: 'moderation' },
        { label: 'Flagged Content', icon: '🚩', screen: 'flagged' },
        { label: 'Appeals', icon: '📋', screen: 'appeals' },
      ],
      color: '#EF4444',
    },
    {
      title: 'Feedback & Reports',
      icon: '💬',
      items: [
        { label: 'User Feedback', icon: '💭', screen: 'feedback' },
        { label: 'Content Reports', icon: '🚩', screen: 'reports' },
        { label: 'Feature Requests', icon: '💡', screen: 'features' },
      ],
      color: '#9C27B0',
    },
    {
      title: 'System',
      icon: '⚙️',
      items: [
        { label: 'Analytics', icon: '📈', screen: 'analytics' },
        { label: 'Settings', icon: '⚙️', screen: 'settings' },
        { label: 'Backup & Restore', icon: '💾', screen: 'backup' },
      ],
      color: '#8B5CF6',
    }
  ];

  const handleNavigation = (screen: string) => {
    if (screen === 'reports') {
      router.push('/(admin)/reports' as any);
    } else if (screen === 'analytics') {
      router.push('/(admin)/analytics' as any);
    } else {
      Alert.alert('Navigation', `Would navigate to: ${screen}`);
    }
  };

  const handleAdminAction = (action: string) => {
    if (action === 'View Reports') {
      router.push('/(admin)/reports' as any);
    } else if (action === 'View Analytics') {
      router.push('/(admin)/analytics' as any);
    } else {
      Alert.alert('Admin Action', `${action} clicked`);
    }
  };

  // Show loading while checking admin status (ADD THIS)
  if (loading && !isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Verifying access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render anything if not admin (ADD THIS)
  if (!isAdmin) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => handleAdminAction('Notifications')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>👥</Text>
              <Text style={styles.statNumber}>{formatNumber(adminStats.totalUsers)}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
              <View style={styles.growthIndicator}>
                <Ionicons 
                  name={analytics.growth.userGrowth > 0 ? 'trending-up' : 'trending-down'} 
                  size={12} 
                  color={getGrowthColor(analytics.growth.userGrowth)} 
                />
                <Text style={[styles.growthText, { color: getGrowthColor(analytics.growth.userGrowth) }]}>
                  {analytics.growth.userGrowth > 0 ? '+' : ''}{analytics.growth.userGrowth}%
                </Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>📍</Text>
              <Text style={styles.statNumber}>{formatNumber(adminStats.totalPlaces)}</Text>
              <Text style={styles.statLabel}>Places</Text>
              <View style={styles.growthIndicator}>
                <Ionicons 
                  name={analytics.growth.placeGrowth > 0 ? 'trending-up' : 'trending-down'} 
                  size={12} 
                  color={getGrowthColor(analytics.growth.placeGrowth)} 
                />
                <Text style={[styles.growthText, { color: getGrowthColor(analytics.growth.placeGrowth) }]}>
                  {analytics.growth.placeGrowth > 0 ? '+' : ''}{analytics.growth.placeGrowth}%
                </Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>⭐</Text>
              <Text style={styles.statNumber}>{formatNumber(adminStats.totalReviews)}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
              <View style={styles.growthIndicator}>
                <Ionicons 
                  name={analytics.growth.reviewGrowth > 0 ? 'trending-up' : 'trending-down'} 
                  size={12} 
                  color={getGrowthColor(analytics.growth.reviewGrowth)} 
                />
                <Text style={[styles.growthText, { color: getGrowthColor(analytics.growth.reviewGrowth) }]}>
                  {analytics.growth.reviewGrowth > 0 ? '+' : ''}{analytics.growth.reviewGrowth}%
                </Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statIcon, { backgroundColor: '#E0E7FF' }]}>🔥</Text>
              <Text style={styles.statNumber}>{adminStats.activeToday}</Text>
              <Text style={styles.statLabel}>Active Today</Text>
            </View>
          </View>
        </View>

        {/* Today's Activity */}
        <View style={styles.todayContainer}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          <View style={styles.todayGrid}>
            <View style={styles.todayItem}>
              <Text style={styles.todayNumber}>{analytics.users.newToday}</Text>
              <Text style={styles.todayLabel}>New Users</Text>
            </View>
            <View style={styles.todayItem}>
              <Text style={styles.todayNumber}>{analytics.places.newToday}</Text>
              <Text style={styles.todayLabel}>New Places</Text>
            </View>
            <View style={styles.todayItem}>
              <Text style={styles.todayNumber}>{analytics.reviews.newToday}</Text>
              <Text style={styles.todayLabel}>New Reviews</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickStatsScroll}>
          <View style={styles.quickStatsContainer}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatLabel}>Avg Rating</Text>
              <Text style={styles.quickStatValue}>{analytics.reviews.averageRating.toFixed(1)} ⭐</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatLabel}>Pending Approval</Text>
              <Text style={styles.quickStatValue}>{analytics.places.pendingApproval}</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatLabel}>Flagged Reviews</Text>
              <Text style={styles.quickStatValue}>{analytics.reviews.flagged}</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatLabel}>Active This Week</Text>
              <Text style={styles.quickStatValue}>{formatNumber(analytics.users.activeThisWeek)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Category Distribution */}
        <View style={styles.categoryContainer}>
          <Text style={styles.sectionTitle}>Places by Category</Text>
          <View style={styles.categoryGrid}>
            {Object.entries(analytics.places.categories).map(([key, value]) => (
              <View key={key} style={styles.categoryRow}>
                <Text style={styles.categoryLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <View style={styles.categoryBarContainer}>
                  <View 
                    style={[
                      styles.categoryBar, 
                      { 
                        width: `${(value / analytics.places.total) * 100}%`,
                        backgroundColor: getCategoryColor(key)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.categoryValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reports Breakdown */}
        <View style={styles.reportsBreakdown}>
          <Text style={styles.sectionTitle}>Reports Breakdown</Text>
          <View style={styles.reportsGrid}>
            <View style={styles.reportType}>
              <Text style={styles.reportTypeLabel}>User Reports</Text>
              <Text style={styles.reportTypeValue}>{analytics.reports.byType.user}</Text>
            </View>
            <View style={styles.reportType}>
              <Text style={styles.reportTypeLabel}>Place Reports</Text>
              <Text style={styles.reportTypeValue}>{analytics.reports.byType.place}</Text>
            </View>
            <View style={styles.reportType}>
              <Text style={styles.reportTypeLabel}>Review Reports</Text>
              <Text style={styles.reportTypeValue}>{analytics.reports.byType.review}</Text>
            </View>
          </View>
          <View style={styles.reportStatus}>
            <View style={styles.reportStatusItem}>
              <Text style={[styles.reportStatusDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.reportStatusLabel}>Pending: {analytics.reports.pending}</Text>
            </View>
            <View style={styles.reportStatusItem}>
              <Text style={[styles.reportStatusDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.reportStatusLabel}>Resolved: {analytics.reports.resolved}</Text>
            </View>
          </View>
        </View>

        {/* Feedback Stats Card */}
        <TouchableOpacity 
          style={styles.feedbackStatsCard}
          onPress={() => router.push('/(admin)/feedback' as any)}
        >
          <View style={styles.feedbackStatsHeader}>
            <View style={styles.feedbackStatsTitleContainer}>
              <Text style={styles.feedbackStatsTitle}>📊 Feedback Overview</Text>
              <Text style={styles.feedbackStatsSubtitle}>User submissions & reports</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9C27B0" />
          </View>
          
          <View style={styles.feedbackStatsGrid}>
            <View style={styles.feedbackStatItem}>
              <Text style={[styles.feedbackStatNumber, { color: '#FF9800' }]}>{feedbackStats.pending}</Text>
              <Text style={styles.feedbackStatLabel}>Pending</Text>
            </View>
            <View style={styles.feedbackStatItem}>
              <Text style={[styles.feedbackStatNumber, { color: '#2196F3' }]}>{feedbackStats.inReview}</Text>
              <Text style={styles.feedbackStatLabel}>In Review</Text>
            </View>
            <View style={styles.feedbackStatItem}>
              <Text style={[styles.feedbackStatNumber, { color: '#4CAF50' }]}>{feedbackStats.resolved}</Text>
              <Text style={styles.feedbackStatLabel}>Resolved</Text>
            </View>
            <View style={styles.feedbackStatItem}>
              <Text style={[styles.feedbackStatNumber, { color: '#9C27B0' }]}>{feedbackStats.total}</Text>
              <Text style={styles.feedbackStatLabel}>Total</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Report Stats Card */}
        <TouchableOpacity 
          style={styles.reportStatsCard}
          onPress={() => router.push('/(admin)/reports' as any)}
        >
          <View style={styles.feedbackStatsHeader}>
            <View style={styles.feedbackStatsTitleContainer}>
              <Text style={styles.feedbackStatsTitle}>🚩 Report Overview</Text>
              <Text style={styles.feedbackStatsSubtitle}>User reports & flags</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#F44336" />
          </View>
          
          <View style={styles.feedbackStatsGrid}>
            <View style={styles.feedbackStatItem}>
              <Text style={[styles.feedbackStatNumber, { color: '#FF9800' }]}>{reportStats.pending}</Text>
              <Text style={styles.feedbackStatLabel}>Pending</Text>
            </View>
            <View style={styles.feedbackStatItem}>
              <Text style={[styles.feedbackStatNumber, { color: '#F44336' }]}>{reportStats.highPriority}</Text>
              <Text style={styles.feedbackStatLabel}>High Priority</Text>
            </View>
            <View style={styles.feedbackStatItem}>
              <Text style={[styles.feedbackStatNumber, { color: '#9C27B0' }]}>{reportStats.total}</Text>
              <Text style={styles.feedbackStatLabel}>Total</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
              onPress={() => handleAdminAction('Add Place')}
            >
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionText}>Add Place</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={() => handleAdminAction('View Reports')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Reports</Text>
            </TouchableOpacity>
            
            {/* Moderation Quick Action */}
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
              onPress={() => router.push('/(admin)/moderation' as any)}
            >
              <Text style={styles.actionIcon}>🛡️</Text>
              <Text style={styles.actionText}>Moderate</Text>
            </TouchableOpacity>
          </View>
          
          {/* Second row of quick actions */}
          <View style={[styles.actionsRow, { marginTop: 8 }]}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
              onPress={() => router.push('/(admin)/feedback' as any)}
            >
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>Feedback</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              onPress={() => router.push('/(admin)/reports' as any)}
            >
              <Text style={styles.actionIcon}>🚩</Text>
              <Text style={styles.actionText}>Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              onPress={() => handleAdminAction('View Analytics')}
            >
              <Text style={styles.actionIcon}>📈</Text>
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Sections */}
        <View style={styles.sectionsContainer}>
          {adminSections.map((section, index) => (
            <View key={index} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
                  <Text style={[styles.sectionIconText, { color: section.color }]}>
                    {section.icon}
                  </Text>
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              
              <View style={styles.sectionItems}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={styles.sectionItem}
                    onPress={() => {
                      if (item.screen === 'moderation') {
                        router.push('/(admin)/moderation' as any);
                      } else if (item.screen === 'feedback') {
                        router.push('/(admin)/feedback' as any);
                      } else if (item.screen === 'reports') {
                        router.push('/(admin)/reports' as any);
                      } else if (item.screen === 'analytics') {
                        router.push('/(admin)/analytics' as any);
                      } else {
                        handleNavigation(item.screen);
                      }
                    }}
                  >
                    <View style={styles.sectionItemLeft}>
                      <Text style={styles.itemIcon}>{item.icon}</Text>
                      <Text style={styles.itemText}>{item.label}</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <Text>👤</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>New user registration: John Doe</Text>
                <Text style={styles.activityTime}>10 minutes ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <Text>📍</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>New place submitted: "Coffee Hub"</Text>
                <Text style={styles.activityTime}>1 hour ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <Text>💬</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>New feedback submitted: "App crash report"</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <Text>🚩</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>User reported for inappropriate behavior</Text>
                <Text style={styles.activityTime}>3 hours ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ADD THESE STYLES at the end of the StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // ADD THIS NEW STYLE
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ADD THIS NEW STYLE
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  growthText: {
    fontSize: 11,
    fontWeight: '500',
  },
  todayContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  todayGrid: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  todayItem: {
    alignItems: 'center',
  },
  todayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  todayLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quickStatsScroll: {
    marginTop: 16,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickStatItem: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 120,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 4,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  categoryGrid: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
  },
  categoryBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  categoryBar: {
    height: 8,
    borderRadius: 4,
  },
  categoryValue: {
    width: 40,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'right',
  },
  reportsBreakdown: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  reportsGrid: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportType: {
    flex: 1,
    alignItems: 'center',
  },
  reportTypeLabel: {
    fontSize: 12,
    color: '#666',
  },
  reportTypeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 4,
  },
  reportStatus: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reportStatusLabel: {
    fontSize: 13,
    color: '#666',
  },
  feedbackStatsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportStatsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  feedbackStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackStatsTitleContainer: {
    flex: 1,
  },
  feedbackStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  feedbackStatsSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  feedbackStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  feedbackStatItem: {
    alignItems: 'center',
  },
  feedbackStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  feedbackStatLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionsContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionIconText: {
    fontSize: 20,
  },
  sectionItems: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  sectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  itemText: {
    fontSize: 16,
    color: '#374151',
  },
  arrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  activityContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 32,
  },
  activityList: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});