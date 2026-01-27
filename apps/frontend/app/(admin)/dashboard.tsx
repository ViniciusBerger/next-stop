import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboard() {
  // Admin stats data
  const adminStats = {
    totalUsers: 1254,
    totalPlaces: 489,
    totalReviews: 2341,
    activeToday: 187,
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
      title: 'System',
      icon: '⚙️',
      items: [
        { label: 'Analytics', icon: '📈', screen: 'analytics' },
        { label: 'Settings', icon: '⚙️', screen: 'settings' },
        { label: 'Backup & Restore', icon: '💾', screen: 'backup' },
      ],
      color: '#8B5CF6',
    },
    {
      title: 'Moderation',
      icon: '🛡️',
      items: [
        { label: 'Flagged Content', icon: '🚩', screen: 'flagged' },
        { label: 'User Ban Appeals', icon: '⚖️', screen: 'appeals' },
        { label: 'Moderation Log', icon: '📋', screen: 'mod-log' },
      ],
      color: '#EF4444',
    },
  ];

  const handleNavigation = (screen: string) => {
    Alert.alert('Navigation', `Would navigate to: ${screen}`);
    // In real app: router.push(`/(admin)/${screen}`);
  };

  const handleAdminAction = (action: string) => {
    Alert.alert('Admin Action', `${action} clicked`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back, Admin</Text>
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
          <Text style={styles.statsTitle}>System Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>👥</Text>
              <Text style={styles.statNumber}>{adminStats.totalUsers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>📍</Text>
              <Text style={styles.statNumber}>{adminStats.totalPlaces.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Places</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>⭐</Text>
              <Text style={styles.statNumber}>{adminStats.totalReviews.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statIcon, { backgroundColor: '#E0E7FF' }]}>🔥</Text>
              <Text style={styles.statNumber}>{adminStats.activeToday}</Text>
              <Text style={styles.statLabel}>Active Today</Text>
            </View>
          </View>
        </View>

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
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
              onPress={() => handleAdminAction('Send Announcement')}
            >
              <Text style={styles.actionIcon}>📢</Text>
              <Text style={styles.actionText}>Announce</Text>
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
                    onPress={() => handleNavigation(item.screen)}
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
                <Text>🚩</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Review flagged for moderation</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    fontSize: 16,
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
  quickActions: {
    paddingHorizontal: 20,
    marginTop: 8,
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