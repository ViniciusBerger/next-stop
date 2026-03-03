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
import { FeedbackCard } from '@/components/ui/FeedbackCard';
import { showToast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/StateComponents';

// Types
type FeedbackStatus = 'pending' | 'in-review' | 'resolved' | 'dismissed';
type FeedbackType = 'bug' | 'feature' | 'report' | 'general';

interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt?: string;
  attachments?: string[];
  rating?: number;
}

// Mock Data - Replace with API calls
const MOCK_FEEDBACK: Feedback[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userAvatar: 'https://i.pravatar.cc/150?u=1',
    type: 'bug',
    title: 'App crashes when opening camera',
    description: 'The app crashes immediately when trying to use the camera feature. This happens on iOS 15.',
    status: 'pending',
    createdAt: '2024-03-15T10:30:00Z',
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    userAvatar: 'https://i.pravatar.cc/150?u=2',
    type: 'feature',
    title: 'Add dark mode support',
    description: 'Would love to see dark mode support for better night-time usage.',
    status: 'in-review',
    createdAt: '2024-03-14T15:45:00Z',
    rating: 4,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Bob Johnson',
    userEmail: 'bob@example.com',
    userAvatar: 'https://i.pravatar.cc/150?u=3',
    type: 'report',
    title: 'Inappropriate content in review',
    description: 'User posted offensive content in review for Central Park.',
    status: 'resolved',
    createdAt: '2024-03-13T09:15:00Z',
    updatedAt: '2024-03-14T11:20:00Z',
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Alice Brown',
    userEmail: 'alice@example.com',
    userAvatar: 'https://i.pravatar.cc/150?u=4',
    type: 'general',
    title: 'Great app!',
    description: 'Really enjoying the app, especially the discover feature.',
    status: 'resolved',
    createdAt: '2024-03-12T14:20:00Z',
    rating: 5,
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Charlie Wilson',
    userEmail: 'charlie@example.com',
    userAvatar: 'https://i.pravatar.cc/150?u=5',
    type: 'bug',
    title: 'Location not updating',
    description: 'The app shows my old location even after moving to a new area.',
    status: 'pending',
    createdAt: '2024-03-15T08:10:00Z',
  },
  {
    id: '6',
    userId: 'user6',
    userName: 'Diana Prince',
    userEmail: 'diana@example.com',
    userAvatar: 'https://i.pravatar.cc/150?u=6',
    type: 'feature',
    title: 'Add save for later',
    description: 'Would be great to save places to visit later.',
    status: 'in-review',
    createdAt: '2024-03-13T16:30:00Z',
    rating: 3,
  },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>(MOCK_FEEDBACK);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all');

  // Filter feedback based on search and filters
  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: feedback.length,
    pending: feedback.filter(f => f.status === 'pending').length,
    inReview: feedback.filter(f => f.status === 'in-review').length,
    resolved: feedback.filter(f => f.status === 'resolved').length,
    dismissed: feedback.filter(f => f.status === 'dismissed').length,
    bugs: feedback.filter(f => f.type === 'bug').length,
    features: feedback.filter(f => f.type === 'feature').length,
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: FeedbackStatus) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in-review': return '#2196F3';
      case 'resolved': return '#4CAF50';
      case 'dismissed': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getTypeIcon = (type: FeedbackType) => {
    switch (type) {
      case 'bug': return 'bug';
      case 'feature': return 'bulb';
      case 'report': return 'flag';
      case 'general': return 'chatbubble';
      default: return 'help-circle';
    }
  };

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feedback Management</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search feedback..."
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
            <Text style={styles.statNumber}>{stats.bugs}</Text>
            <Text style={styles.statLabel}>Bugs</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#9C27B0' }]}>
            <Text style={styles.statNumber}>{stats.features}</Text>
            <Text style={styles.statLabel}>Features</Text>
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

      {/* Type Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Type:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterChipText, filterType === 'all' && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'bug' && styles.filterChipActive]}
            onPress={() => setFilterType('bug')}
          >
            <Ionicons name="bug" size={14} color={filterType === 'bug' ? '#FFF' : '#666'} />
            <Text style={[styles.filterChipText, filterType === 'bug' && styles.filterChipTextActive]}>
              Bugs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'feature' && styles.filterChipActive]}
            onPress={() => setFilterType('feature')}
          >
            <Ionicons name="bulb" size={14} color={filterType === 'feature' ? '#FFF' : '#666'} />
            <Text style={[styles.filterChipText, filterType === 'feature' && styles.filterChipTextActive]}>
              Features
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'report' && styles.filterChipActive]}
            onPress={() => setFilterType('report')}
          >
            <Ionicons name="flag" size={14} color={filterType === 'report' ? '#FFF' : '#666'} />
            <Text style={[styles.filterChipText, filterType === 'report' && styles.filterChipTextActive]}>
              Reports
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'general' && styles.filterChipActive]}
            onPress={() => setFilterType('general')}
          >
            <Ionicons name="chatbubble" size={14} color={filterType === 'general' ? '#FFF' : '#666'} />
            <Text style={[styles.filterChipText, filterType === 'general' && styles.filterChipTextActive]}>
              General
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Feedback }) => (
    <FeedbackCard
      feedback={item}
      onPress={() => router.push(`/feedback/${item.id}` as any)}
    />
  );

  return (
    <AdminScreenLayout showBack={true}>
      <FlatList
        data={filteredFeedback}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubble-outline"
            title="No Feedback Found"
            message="No feedback matches your search criteria. Try adjusting your filters."
            buttonText="Clear Filters"
            onButtonPress={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setFilterType('all');
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#7E9AFF',
    borderColor: '#7E9AFF',
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