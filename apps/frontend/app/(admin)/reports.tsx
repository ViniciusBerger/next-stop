import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AdminScreenLayout } from '@/components/adminScreenLayout';
import { ReportCard } from '@/components/ui/ReportCard';
import { showToast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/StateComponents';

// Types
type ReportStatus = 'pending' | 'in-review' | 'resolved' | 'dismissed';
type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'fake' | 'other';
type ReportType = 'user' | 'place' | 'review';

interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterAvatar?: string;
  reportedType: ReportType;
  reportedId: string;
  reportedName: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  priority: 'low' | 'medium' | 'high';
}

// Mock Data - Replace with API calls
const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    reporterId: 'user2',
    reporterName: 'Jane Smith',
    reporterEmail: 'jane@example.com',
    reporterAvatar: 'https://i.pravatar.cc/150?u=2',
    reportedType: 'user',
    reportedId: 'user6',
    reportedName: 'Mike Ross',
    reason: 'harassment',
    description: 'User is posting harassing comments on multiple reviews. They have targeted several users with offensive language.',
    status: 'pending',
    createdAt: '2024-03-15T11:20:00Z',
    priority: 'high',
  },
  {
    id: '2',
    reporterId: 'user3',
    reporterName: 'Bob Johnson',
    reporterEmail: 'bob@example.com',
    reporterAvatar: 'https://i.pravatar.cc/150?u=3',
    reportedType: 'place',
    reportedId: 'place123',
    reportedName: 'Sunset Cafe',
    reason: 'fake',
    description: 'This place appears to be fake - address doesn\'t exist and photos are stolen from another business.',
    status: 'in-review',
    createdAt: '2024-03-14T16:30:00Z',
    priority: 'medium',
  },
  {
    id: '3',
    reporterId: 'user4',
    reporterName: 'Alice Brown',
    reporterEmail: 'alice@example.com',
    reporterAvatar: 'https://i.pravatar.cc/150?u=4',
    reportedType: 'review',
    reportedId: 'review123',
    reportedName: 'Review by John Doe',
    reason: 'inappropriate',
    description: 'Review contains offensive language and personal attacks against the business owner.',
    status: 'pending',
    createdAt: '2024-03-14T09:15:00Z',
    priority: 'high',
  },
  {
    id: '4',
    reporterId: 'user5',
    reporterName: 'Charlie Wilson',
    reporterEmail: 'charlie@example.com',
    reporterAvatar: 'https://i.pravatar.cc/150?u=5',
    reportedType: 'user',
    reportedId: 'user7',
    reportedName: 'Sarah Connor',
    reason: 'spam',
    description: 'User keeps posting promotional content in reviews for their own business.',
    status: 'resolved',
    createdAt: '2024-03-13T14:20:00Z',
    updatedAt: '2024-03-14T10:30:00Z',
    resolvedBy: 'admin1',
    resolution: 'Warned user about promotional content',
    priority: 'medium',
  },
  {
    id: '5',
    reporterId: 'user1',
    reporterName: 'John Doe',
    reporterEmail: 'john@example.com',
    reporterAvatar: 'https://i.pravatar.cc/150?u=1',
    reportedType: 'place',
    reportedId: 'place456',
    reportedName: 'Tech Hub',
    reason: 'other',
    description: 'The business has permanently closed but still appears as open.',
    status: 'dismissed',
    createdAt: '2024-03-12T11:45:00Z',
    updatedAt: '2024-03-13T09:20:00Z',
    resolvedBy: 'admin2',
    resolution: 'Business confirmed still operating',
    priority: 'low',
  },
  {
    id: '6',
    reporterId: 'user8',
    reporterName: 'Diana Prince',
    reporterEmail: 'diana@example.com',
    reporterAvatar: 'https://i.pravatar.cc/150?u=8',
    reportedType: 'review',
    reportedId: 'review456',
    reportedName: 'Review by Mike Ross',
    reason: 'harassment',
    description: 'Review contains personal attacks against another user in the comments section.',
    status: 'pending',
    createdAt: '2024-03-15T08:30:00Z',
    priority: 'high',
  },
];

export default function ReportsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Filter reports based on search and filters
  const filteredReports = reports.filter(item => {
    const matchesSearch = item.reportedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    inReview: reports.filter(r => r.status === 'in-review').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
    highPriority: reports.filter(r => r.priority === 'high').length,
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in-review': return '#2196F3';
      case 'resolved': return '#4CAF50';
      case 'dismissed': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Report Management</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderLeftColor: '#7E9AFF' }]}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#FF9800' }]}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#2196F3' }]}>
            <Text style={styles.statNumber}>{stats.inReview}</Text>
            <Text style={styles.statLabel}>In Review</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#4CAF50' }]}>
            <Text style={styles.statNumber}>{stats.resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#F44336' }]}>
            <Text style={styles.statNumber}>{stats.highPriority}</Text>
            <Text style={styles.statLabel}>High Priority</Text>
          </View>
        </View>
      </ScrollView>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Status:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'all' && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'pending' && styles.filterChipActive]}
            onPress={() => setFilterStatus('pending')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'pending' && styles.filterChipTextActive]}>
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'in-review' && styles.filterChipActive]}
            onPress={() => setFilterStatus('in-review')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'in-review' && styles.filterChipTextActive]}>
              In Review
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'resolved' && styles.filterChipActive]}
            onPress={() => setFilterStatus('resolved')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'resolved' && styles.filterChipTextActive]}>
              Resolved
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'dismissed' && styles.filterChipActive]}
            onPress={() => setFilterStatus('dismissed')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'dismissed' && styles.filterChipTextActive]}>
              Dismissed
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Priority Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Priority:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, filterPriority === 'all' && styles.filterChipActive]}
            onPress={() => setFilterPriority('all')}
          >
            <Text style={[styles.filterChipText, filterPriority === 'all' && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, { borderColor: '#F44336' }, filterPriority === 'high' && styles.filterChipActiveHigh]}
            onPress={() => setFilterPriority('high')}
          >
            <Text style={[styles.filterChipText, filterPriority === 'high' && styles.filterChipTextActive]}>
              High
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, { borderColor: '#FF9800' }, filterPriority === 'medium' && styles.filterChipActiveMedium]}
            onPress={() => setFilterPriority('medium')}
          >
            <Text style={[styles.filterChipText, filterPriority === 'medium' && styles.filterChipTextActive]}>
              Medium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, { borderColor: '#4CAF50' }, filterPriority === 'low' && styles.filterChipActiveLow]}
            onPress={() => setFilterPriority('low')}
          >
            <Text style={[styles.filterChipText, filterPriority === 'low' && styles.filterChipTextActive]}>
              Low
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Report }) => (
    <ReportCard
      report={item}
      onPress={() => router.push(`/reports/${item.id}` as any)}
    />
  );

  return (
    <AdminScreenLayout showBack={true}>
      <FlatList
        data={filteredReports}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <EmptyState
            icon="flag-outline"
            title="No Reports Found"
            message="No reports match your search criteria. Try adjusting your filters."
            buttonText="Clear Filters"
            onButtonPress={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setFilterPriority('all');
            }}
          />
        }
      />
    </AdminScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  statsScroll: {
    maxHeight: 100,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  statCard: {
    minWidth: 80,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  filterChipActive: {
    backgroundColor: '#7E9AFF',
    borderColor: '#7E9AFF',
  },
  filterChipActiveHigh: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  filterChipActiveMedium: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  filterChipActiveLow: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: 'white',
  },
  listContent: {
    paddingBottom: 20,
  },
});