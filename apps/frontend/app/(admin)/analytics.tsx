import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AdminScreenLayout } from '@/components/adminScreenLayout';
import { AnalyticsCard } from '@/components/ui/AnalyticsCard';
import { Chart } from '@/components/ui/Chart';
import { showToast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/StateComponents';

// Types
interface AnalyticsData {
  users: {
    total: number;
    activeToday: number;
    activeThisWeek: number;
    activeThisMonth: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    growth: number;
    byRole: {
      admins: number;
      users: number;
      moderators: number;
    };
  };
  places: {
    total: number;
    pendingApproval: number;
    approved: number;
    rejected: number;
    newToday: number;
    newThisWeek: number;
    growth: number;
    categories: {
      [key: string]: number;
    };
  };
  events: {
    total: number;
    upcoming: number;
    ongoing: number;
    past: number;
    newToday: number;
    newThisWeek: number;
    growth: number;
  };
  reviews: {
    total: number;
    pendingModeration: number;
    approved: number;
    flagged: number;
    averageRating: number;
    newToday: number;
    newThisWeek: number;
    growth: number;
  };
  reports: {
    total: number;
    pending: number;
    resolved: number;
    dismissed: number;
    byType: {
      user: number;
      place: number;
      review: number;
    };
  };
  feedback: {
    total: number;
    pending: number;
    resolved: number;
    byType: {
      bug: number;
      feature: number;
      general: number;
    };
  };
  timeline: {
    labels: string[];
    users: number[];
    places: number[];
    events: number[];
    reviews: number[];
  };
}

// Mock Data - Replace with API calls
const MOCK_ANALYTICS: AnalyticsData = {
  users: {
    total: 12547,
    activeToday: 843,
    activeThisWeek: 5231,
    activeThisMonth: 9876,
    newToday: 42,
    newThisWeek: 287,
    newThisMonth: 1243,
    growth: 12.5,
    byRole: {
      admins: 8,
      users: 12450,
      moderators: 89
    }
  },
  places: {
    total: 3892,
    pendingApproval: 124,
    approved: 3642,
    rejected: 126,
    newToday: 15,
    newThisWeek: 98,
    growth: 8.3,
    categories: {
      restaurant: 1245,
      cafe: 876,
      park: 543,
      museum: 321,
      shopping: 654,
      other: 253
    }
  },
  events: {
    total: 567,
    upcoming: 234,
    ongoing: 45,
    past: 288,
    newToday: 8,
    newThisWeek: 42,
    growth: 15.2
  },
  reviews: {
    total: 8234,
    pendingModeration: 156,
    approved: 7892,
    flagged: 186,
    averageRating: 4.3,
    newToday: 67,
    newThisWeek: 423,
    growth: 18.7
  },
  reports: {
    total: 234,
    pending: 78,
    resolved: 124,
    dismissed: 32,
    byType: {
      user: 98,
      place: 76,
      review: 60
    }
  },
  feedback: {
    total: 456,
    pending: 134,
    resolved: 289,
    byType: {
      bug: 187,
      feature: 156,
      general: 113
    }
  },
  timeline: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    users: [980, 1050, 1120, 1250, 1380, 1520, 1680, 1820, 1980, 2150, 2350, 2600],
    places: [320, 350, 380, 420, 460, 510, 560, 610, 670, 730, 800, 870],
    events: [45, 52, 48, 62, 58, 72, 85, 78, 92, 88, 104, 112],
    reviews: [520, 580, 640, 710, 780, 860, 940, 1030, 1130, 1240, 1360, 1490]
  }
};

export default function AnalyticsScreen() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedChart, setSelectedChart] = useState<'users' | 'places' | 'events' | 'reviews'>('users');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnalytics(MOCK_ANALYTICS);
    } catch (error) {
      console.error('Error loading analytics:', error);
      showToast('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return '#4CAF50';
    if (growth < 0) return '#F44336';
    return '#666';
  };

  if (loading && !refreshing) {
    return (
      <AdminScreenLayout showBack={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7E9AFF" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </AdminScreenLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminScreenLayout showBack={true}>
        <EmptyState
          icon="bar-chart-outline"
          title="No Data Available"
          message="Unable to load analytics data. Please try again."
          buttonText="Retry"
          onButtonPress={loadAnalytics}
        />
      </AdminScreenLayout>
    );
  }

  return (
    <AdminScreenLayout showBack={true}>
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
          <Text style={styles.headerTitle}>Analytics Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric',
              day: 'numeric'
            })}
          </Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === 'week' && styles.timeRangeActive]}
            onPress={() => setTimeRange('week')}
          >
            <Text style={[styles.timeRangeText, timeRange === 'week' && styles.timeRangeTextActive]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === 'month' && styles.timeRangeActive]}
            onPress={() => setTimeRange('month')}
          >
            <Text style={[styles.timeRangeText, timeRange === 'month' && styles.timeRangeTextActive]}>
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === 'year' && styles.timeRangeActive]}
            onPress={() => setTimeRange('year')}
          >
            <Text style={[styles.timeRangeText, timeRange === 'year' && styles.timeRangeTextActive]}>
              Year
            </Text>
          </TouchableOpacity>
        </View>

        {/* Key Metrics Row */}
        <View style={styles.metricsRow}>
          <AnalyticsCard
            title="Total Users"
            value={formatNumber(analytics.users.total)}
            change={analytics.users.growth}
            icon="people"
            color="#7E9AFF"
            onPress={() => {}}
          />
          <AnalyticsCard
            title="Total Places"
            value={formatNumber(analytics.places.total)}
            change={analytics.places.growth}
            icon="location"
            color="#45d5af"
            onPress={() => {}}
          />
        </View>

        <View style={styles.metricsRow}>
          <AnalyticsCard
            title="Total Events"
            value={formatNumber(analytics.events.total)}
            change={analytics.events.growth}
            icon="calendar"
            color="#FF9800"
            onPress={() => {}}
          />
          <AnalyticsCard
            title="Total Reviews"
            value={formatNumber(analytics.reviews.total)}
            change={analytics.reviews.growth}
            icon="star"
            color="#FFC107"
            onPress={() => {}}
          />
        </View>

        {/* Today's Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          <View style={styles.activityGrid}>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>{analytics.users.newToday}</Text>
              <Text style={styles.activityLabel}>New Users</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>{analytics.places.newToday}</Text>
              <Text style={styles.activityLabel}>New Places</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>{analytics.events.newToday}</Text>
              <Text style={styles.activityLabel}>New Events</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>{analytics.reviews.newToday}</Text>
              <Text style={styles.activityLabel}>New Reviews</Text>
            </View>
          </View>
        </View>

        {/* Active Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Users</Text>
          <View style={styles.activeUsersContainer}>
            <View style={styles.activeUserItem}>
              <Text style={styles.activeUserValue}>{formatNumber(analytics.users.activeToday)}</Text>
              <Text style={styles.activeUserLabel}>Today</Text>
            </View>
            <View style={styles.activeUserItem}>
              <Text style={styles.activeUserValue}>{formatNumber(analytics.users.activeThisWeek)}</Text>
              <Text style={styles.activeUserLabel}>This Week</Text>
            </View>
            <View style={styles.activeUserItem}>
              <Text style={styles.activeUserValue}>{formatNumber(analytics.users.activeThisMonth)}</Text>
              <Text style={styles.activeUserLabel}>This Month</Text>
            </View>
          </View>
        </View>

        {/* Growth Chart */}
        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Growth Trends</Text>
            <View style={styles.chartLegend}>
              <TouchableOpacity
                style={[styles.legendItem, selectedChart === 'users' && styles.legendItemActive]}
                onPress={() => setSelectedChart('users')}
              >
                <View style={[styles.legendDot, { backgroundColor: '#7E9AFF' }]} />
                <Text style={styles.legendText}>Users</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.legendItem, selectedChart === 'places' && styles.legendItemActive]}
                onPress={() => setSelectedChart('places')}
              >
                <View style={[styles.legendDot, { backgroundColor: '#45d5af' }]} />
                <Text style={styles.legendText}>Places</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.legendItem, selectedChart === 'events' && styles.legendItemActive]}
                onPress={() => setSelectedChart('events')}
              >
                <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.legendText}>Events</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Chart
            data={analytics.timeline[selectedChart]}
            labels={analytics.timeline.labels}
            color={
              selectedChart === 'users' ? '#7E9AFF' :
              selectedChart === 'places' ? '#45d5af' :
              selectedChart === 'events' ? '#FF9800' : '#FFC107'
            }
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsSection}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickStatsContainer}>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>Avg Rating</Text>
                <Text style={styles.quickStatValue}>{analytics.reviews.averageRating.toFixed(1)} ⭐</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>Pending Places</Text>
                <Text style={styles.quickStatValue}>{analytics.places.pendingApproval}</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>Flagged Reviews</Text>
                <Text style={styles.quickStatValue}>{analytics.reviews.flagged}</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>Pending Reports</Text>
                <Text style={styles.quickStatValue}>{analytics.reports.pending}</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>Upcoming Events</Text>
                <Text style={styles.quickStatValue}>{analytics.events.upcoming}</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Reports Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reports by Type</Text>
          <View style={styles.reportsGrid}>
            <View style={styles.reportTypeItem}>
              <Text style={styles.reportTypeLabel}>User Reports</Text>
              <Text style={styles.reportTypeValue}>{analytics.reports.byType.user}</Text>
            </View>
            <View style={styles.reportTypeItem}>
              <Text style={styles.reportTypeLabel}>Place Reports</Text>
              <Text style={styles.reportTypeValue}>{analytics.reports.byType.place}</Text>
            </View>
            <View style={styles.reportTypeItem}>
              <Text style={styles.reportTypeLabel}>Review Reports</Text>
              <Text style={styles.reportTypeValue}>{analytics.reports.byType.review}</Text>
            </View>
          </View>
          <View style={styles.reportStatusContainer}>
            <View style={styles.reportStatusItem}>
              <View style={[styles.statusDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.reportStatusLabel}>Pending: {analytics.reports.pending}</Text>
            </View>
            <View style={styles.reportStatusItem}>
              <View style={[styles.statusDot, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.reportStatusLabel}>In Review: 0</Text>
            </View>
            <View style={styles.reportStatusItem}>
              <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.reportStatusLabel}>Resolved: {analytics.reports.resolved}</Text>
            </View>
          </View>
        </View>

        {/* Feedback Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback by Type</Text>
          <View style={styles.feedbackGrid}>
            <View style={styles.feedbackItem}>
              <Ionicons name="bug" size={20} color="#F44336" />
              <Text style={styles.feedbackLabel}>Bugs</Text>
              <Text style={styles.feedbackValue}>{analytics.feedback.byType.bug}</Text>
            </View>
            <View style={styles.feedbackItem}>
              <Ionicons name="bulb" size={20} color="#FFC107" />
              <Text style={styles.feedbackLabel}>Features</Text>
              <Text style={styles.feedbackValue}>{analytics.feedback.byType.feature}</Text>
            </View>
            <View style={styles.feedbackItem}>
              <Ionicons name="chatbubble" size={20} color="#2196F3" />
              <Text style={styles.feedbackLabel}>General</Text>
              <Text style={styles.feedbackValue}>{analytics.feedback.byType.general}</Text>
            </View>
          </View>
        </View>

        {/* Category Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Places by Category</Text>
          {Object.entries(analytics.places.categories).map(([key, value]) => {
            const percentage = (value / analytics.places.total) * 100;
            return (
              <View key={key} style={styles.categoryRow}>
                <Text style={styles.categoryLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <View style={styles.categoryBarContainer}>
                  <View 
                    style={[
                      styles.categoryBar, 
                      { 
                        width: `${percentage}%`,
                        backgroundColor: getCategoryColor(key)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.categoryValue}>{value}</Text>
              </View>
            );
          })}
        </View>

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </ScrollView>
    </AdminScreenLayout>
  );
}

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    restaurant: '#FF6B6B',
    cafe: '#4ECDC4',
    park: '#95E1D3',
    museum: '#F9D56E',
    shopping: '#E36387',
    other: '#A8A7A7'
  };
  return colors[category] || '#A8A7A7';
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 21,
  },
  timeRangeActive: {
    backgroundColor: '#7E9AFF',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  timeRangeTextActive: {
    color: '#FFF',
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  activityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7E9AFF',
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 12,
    color: '#666',
  },
  activeUsersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activeUserItem: {
    alignItems: 'center',
  },
  activeUserValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  activeUserLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  legendItemActive: {
    backgroundColor: '#F0F3FF',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
  quickStatsSection: {
    marginBottom: 16,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickStatItem: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    minWidth: 120,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reportsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  reportTypeItem: {
    alignItems: 'center',
  },
  reportTypeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  reportTypeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
  },
  reportStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  reportStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reportStatusLabel: {
    fontSize: 12,
    color: '#666',
  },
  feedbackGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  feedbackItem: {
    alignItems: 'center',
    gap: 4,
  },
  feedbackLabel: {
    fontSize: 12,
    color: '#666',
  },
  feedbackValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    width: 80,
    fontSize: 13,
    color: '#666',
  },
  categoryBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  categoryBar: {
    height: 8,
    borderRadius: 4,
  },
  categoryValue: {
    width: 40,
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  lastUpdated: {
    textAlign: 'center',
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
  },
});