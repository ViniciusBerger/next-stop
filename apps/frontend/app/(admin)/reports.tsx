import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import axios from 'axios';
import { AdminScreenLayout } from '@/components/adminScreenLayout';
import { ReportCard, Report } from '@/components/ui/ReportCard';
import { EmptyState } from '@/components/ui/StateComponents';
import { API_URL } from '@/src/config/api';
import { getToken } from '@/src/utils/auth';
import { showAlert } from '@/src/utils/alert';

type StatusFilter = 'all' | 'pending' | 'completed';
type TypeFilter = 'all' | 'feedback' | 'issue';

export default function ReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterType, setFilterType] = useState<TypeFilter>('all');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.get<Report[]>(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(data);
    } catch (err) {
      showAlert('Error', 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, []),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const token = await getToken();
      const { data } = await axios.get<Report[]>(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(data);
    } catch (err) {
      showAlert('Error', 'Failed to refresh reports.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleComplete = async (id: string) => {
    const token = await getToken();
    axios
      .put(`${API_URL}/reports/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(({ data }) => {
        setReports(prev => prev.map(r => (r._id === id ? data : r)));
      })
      .catch(() => showAlert('Error', 'Failed to mark report as complete.'));
  };

  const handleDelete = (id: string) => {
    showAlert(
      'Delete Report',
      'Are you sure you want to delete this report? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.delete(`${API_URL}/reports/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setReports(prev => prev.filter(r => r._id !== id));
            } catch (err) {
              showAlert('Error', 'Failed to delete report.');
            }
          },
        },
      ],
    );
  };

  const filteredReports = reports.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reportedBy.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    completed: reports.filter(r => r.status === 'completed').length,
    feedback: reports.filter(r => r.type === 'feedback').length,
    issues: reports.filter(r => r.type === 'issue').length,
  };

  const renderHeader = () => (
    <View>

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
          <View style={[styles.statCard, { borderLeftColor: '#4CAF50' }]}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#7E9AFF' }]}>
            <Text style={styles.statNumber}>{stats.feedback}</Text>
            <Text style={styles.statLabel}>Feedback</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#F44336' }]}>
            <Text style={styles.statNumber}>{stats.issues}</Text>
            <Text style={styles.statLabel}>Issues</Text>
          </View>
        </View>
      </ScrollView>

      {/* Status Filter */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Status:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['all', 'pending', 'completed'] as StatusFilter[]).map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, filterStatus === s && styles.filterChipActive]}
              onPress={() => setFilterStatus(s)}
            >
              <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Type Filter */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Type:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['all', 'feedback', 'issue'] as TypeFilter[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.filterChip, filterType === t && styles.filterChipActive]}
              onPress={() => setFilterType(t)}
            >
              <Text style={[styles.filterChipText, filterType === t && styles.filterChipTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <AdminScreenLayout showBack={true} title="Report Management">
      <FlatList
        data={filteredReports}
        renderItem={({ item }) => (
          <ReportCard
            report={item}
            onComplete={() => handleComplete(item._id)}
            onDelete={() => handleDelete(item._id)}
          />
        )}
        keyExtractor={item => item._id}
        ListHeaderComponent={renderHeader()}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="flag-outline"
              title="No Reports Found"
              message="No reports match your search criteria. Try adjusting your filters."
              buttonText="Clear Filters"
              onButtonPress={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setFilterType('all');
              }}
            />
          )
        }
      />
    </AdminScreenLayout>
  );
}

const styles = StyleSheet.create({
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
