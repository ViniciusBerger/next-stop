import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Type definitions
type ReportStatus = 'pending' | 'in-review' | 'resolved' | 'dismissed';
type ReportPriority = 'low' | 'medium' | 'high';

// Mock reports data
const MOCK_REPORTS = [
  {
    id: 'r1',
    reporterName: 'Jane Smith',
    reporterEmail: 'jane@example.com',
    reportedUser: 'Mike Ross',
    reportedUserEmail: 'mike@example.com',
    reason: 'harassment',
    description: 'User is posting harassing comments on multiple reviews.',
    status: 'pending' as ReportStatus,
    date: '2024-03-15',
    priority: 'high' as ReportPriority,
  },
  {
    id: 'r2',
    reporterName: 'Bob Johnson',
    reporterEmail: 'bob@example.com',
    reportedPlace: 'Sunset Cafe',
    reportedPlaceId: 'place123',
    reason: 'fake',
    description: 'This place appears to be fake - address doesn\'t exist and photos are stolen.',
    status: 'in-review' as ReportStatus,
    date: '2024-03-14',
    priority: 'medium' as ReportPriority,
  },
  {
    id: 'r3',
    reporterName: 'Alice Brown',
    reporterEmail: 'alice@example.com',
    reportedUser: 'John Doe',
    reportedUserEmail: 'john@example.com',
    reason: 'spam',
    description: 'User keeps posting promotional content in reviews.',
    status: 'pending' as ReportStatus,
    date: '2024-03-14',
    priority: 'medium' as ReportPriority,
  },
  {
    id: 'r4',
    reporterName: 'Charlie Wilson',
    reporterEmail: 'charlie@example.com',
    reportedReview: 'Review #1234',
    reportedReviewId: 'rev123',
    reason: 'inappropriate',
    description: 'Review contains offensive language and personal attacks.',
    status: 'resolved' as ReportStatus,
    date: '2024-03-13',
    priority: 'high' as ReportPriority,
    resolution: 'Review removed, user warned',
  },
  {
    id: 'r5',
    reporterName: 'Diana Prince',
    reporterEmail: 'diana@example.com',
    reportedUser: 'Bruce Wayne',
    reportedUserEmail: 'bruce@example.com',
    reason: 'impersonation',
    description: 'User is impersonating a known figure.',
    status: 'dismissed' as ReportStatus,
    date: '2024-03-12',
    priority: 'low' as ReportPriority,
    resolution: 'No violation found',
  },
];

export default function ReportsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<ReportStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ReportPriority | 'all'>('all');
  const [resolution, setResolution] = useState('');
  const [actionType, setActionType] = useState<'resolve' | 'dismiss' | null>(null);

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in-review': return '#2196F3';
      case 'resolved': return '#4CAF50';
      case 'dismissed': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: ReportPriority) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'harassment': return 'hand-right';
      case 'fake': return 'eye-off';
      case 'spam': return 'megaphone';
      case 'inappropriate': return 'warning';
      case 'impersonation': return 'person-remove';
      default: return 'flag';
    }
  };

  const handleStatusUpdate = (id: string, newStatus: ReportStatus, resolutionNote?: string) => {
    setReports((prev: any[]) => 
      prev.map((item: any) => 
        item.id === id 
          ? { 
              ...item, 
              status: newStatus, 
              resolution: resolutionNote || item.resolution,
              resolvedAt: new Date().toISOString() 
            } 
          : item
      )
    );
    setModalVisible(false);
    setResolution('');
    setActionType(null);
    Alert.alert('Success', `Report marked as ${newStatus}`);
  };

  const filteredReports = reports.filter(item => {
    const statusMatch = filter === 'all' ? true : item.status === filter;
    const priorityMatch = priorityFilter === 'all' ? true : item.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    inReview: reports.filter(r => r.status === 'in-review').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
    highPriority: reports.filter(r => r.priority === 'high').length,
  };

  const renderReportItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setSelectedReport(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.reporterInfo}>
          <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{item.priority[0].toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.reporterName}>{item.reporterName}</Text>
            <Text style={styles.reporterEmail}>{item.reporterEmail}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.reasonRow}>
          <Ionicons name={getReasonIcon(item.reason)} size={16} color="#F44336" />
          <Text style={styles.reasonText}>{item.reason}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>

        {item.reportedUser && (
          <View style={styles.reportedItem}>
            <Ionicons name="person" size={14} color="#666" />
            <Text style={styles.reportedText}>Reported user: {item.reportedUser}</Text>
          </View>
        )}

        {item.reportedPlace && (
          <View style={styles.reportedItem}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.reportedText}>Reported place: {item.reportedPlace}</Text>
          </View>
        )}

        {item.reportedReview && (
          <View style={styles.reportedItem}>
            <Ionicons name="chatbubble" size={14} color="#666" />
            <Text style={styles.reportedText}>Reported review: {item.reportedReview}</Text>
          </View>
        )}

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {item.resolution && (
          <View style={styles.resolutionPreview}>
            <Text style={styles.resolutionPreviewText}>✓ {item.resolution}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPriorityFilter = () => (
    <View style={styles.priorityFilterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.priorityChip, priorityFilter === 'all' && styles.priorityChipActive]}
          onPress={() => setPriorityFilter('all')}
        >
          <Text style={[styles.priorityChipText, priorityFilter === 'all' && styles.priorityChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.priorityChip, { borderColor: '#F44336' }, priorityFilter === 'high' && styles.priorityChipActiveHigh]}
          onPress={() => setPriorityFilter('high')}
        >
          <Text style={[styles.priorityChipText, priorityFilter === 'high' && styles.priorityChipTextActive]}>
            High
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.priorityChip, { borderColor: '#FF9800' }, priorityFilter === 'medium' && styles.priorityChipActiveMedium]}
          onPress={() => setPriorityFilter('medium')}
        >
          <Text style={[styles.priorityChipText, priorityFilter === 'medium' && styles.priorityChipTextActive]}>
            Medium
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.priorityChip, { borderColor: '#4CAF50' }, priorityFilter === 'low' && styles.priorityChipActiveLow]}
          onPress={() => setPriorityFilter('low')}
        >
          <Text style={[styles.priorityChipText, priorityFilter === 'low' && styles.priorityChipTextActive]}>
            Low
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Management</Text>
        <TouchableOpacity onPress={() => setReports([...MOCK_REPORTS])} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderLeftColor: '#9C27B0' }]}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#F44336' }]}>
            <Text style={styles.statNumber}>{stats.highPriority}</Text>
            <Text style={styles.statLabel}>High Priority</Text>
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
        </View>
      </ScrollView>

      {/* Status Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'pending' && styles.filterChipActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'in-review' && styles.filterChipActive]}
            onPress={() => setFilter('in-review')}
          >
            <Text style={[styles.filterText, filter === 'in-review' && styles.filterTextActive]}>In Review</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'resolved' && styles.filterChipActive]}
            onPress={() => setFilter('resolved')}
          >
            <Text style={[styles.filterText, filter === 'resolved' && styles.filterTextActive]}>Resolved</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'dismissed' && styles.filterChipActive]}
            onPress={() => setFilter('dismissed')}
          >
            <Text style={[styles.filterText, filter === 'dismissed' && styles.filterTextActive]}>Dismissed</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Priority Filters */}
      {renderPriorityFilter()}

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        renderItem={renderReportItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="flag-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No reports found</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setActionType(null);
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedReport && (
              <ScrollView style={styles.modalBody}>
                {/* Reporter Info */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Reported By</Text>
                  <Text style={styles.modalText}>{selectedReport.reporterName}</Text>
                  <Text style={styles.modalSubtext}>{selectedReport.reporterEmail}</Text>
                </View>

                {/* Priority & Status */}
                <View style={styles.modalRow}>
                  <View style={styles.modalHalfSection}>
                    <Text style={styles.modalLabel}>Priority</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedReport.priority) + '20' }]}>
                      <Text style={[styles.priorityBadgeText, { color: getPriorityColor(selectedReport.priority) }]}>
                        {selectedReport.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.modalHalfSection}>
                    <Text style={styles.modalLabel}>Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReport.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(selectedReport.status) }]}>
                        {selectedReport.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Reason */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Reason</Text>
                  <View style={styles.reasonContainer}>
                    <Ionicons name={getReasonIcon(selectedReport.reason)} size={20} color="#F44336" />
                    <Text style={styles.reasonText}>{selectedReport.reason}</Text>
                  </View>
                </View>

                {/* Reported Content */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Reported Content</Text>
                  {selectedReport.reportedUser && (
                    <View style={styles.reportedContentItem}>
                      <Ionicons name="person" size={16} color="#666" />
                      <View>
                        <Text style={styles.reportedContentLabel}>User</Text>
                        <Text style={styles.reportedContentValue}>{selectedReport.reportedUser}</Text>
                        <Text style={styles.reportedContentSub}>{selectedReport.reportedUserEmail}</Text>
                      </View>
                    </View>
                  )}
                  {selectedReport.reportedPlace && (
                    <View style={styles.reportedContentItem}>
                      <Ionicons name="location" size={16} color="#666" />
                      <View>
                        <Text style={styles.reportedContentLabel}>Place</Text>
                        <Text style={styles.reportedContentValue}>{selectedReport.reportedPlace}</Text>
                        <Text style={styles.reportedContentSub}>ID: {selectedReport.reportedPlaceId}</Text>
                      </View>
                    </View>
                  )}
                  {selectedReport.reportedReview && (
                    <View style={styles.reportedContentItem}>
                      <Ionicons name="chatbubble" size={16} color="#666" />
                      <View>
                        <Text style={styles.reportedContentLabel}>Review</Text>
                        <Text style={styles.reportedContentValue}>{selectedReport.reportedReview}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Description */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Description</Text>
                  <Text style={styles.modalDescription}>{selectedReport.description}</Text>
                </View>

                {/* Date */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Reported On</Text>
                  <Text style={styles.modalText}>{selectedReport.date}</Text>
                </View>

                {/* Resolution Notes */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Resolution Notes</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Add resolution notes..."
                    value={resolution}
                    onChangeText={setResolution}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Previous Resolution (if any) */}
                {selectedReport.resolution && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Previous Resolution</Text>
                    <View style={styles.previousResolution}>
                      <Text style={styles.previousResolutionText}>{selectedReport.resolution}</Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setActionType(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>

              {selectedReport?.status !== 'resolved' && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.resolveButton]}
                  onPress={() => handleStatusUpdate(selectedReport.id, 'resolved', resolution)}
                >
                  <Text style={styles.resolveButtonText}>Resolve</Text>
                </TouchableOpacity>
              )}
              
              {selectedReport?.status !== 'dismissed' && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.dismissButton]}
                  onPress={() => handleStatusUpdate(selectedReport.id, 'dismissed', resolution)}
                >
                  <Text style={styles.dismissButtonText}>Dismiss</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsScroll: {
    maxHeight: 100,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
  },
  priorityFilterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
  },
  priorityChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  priorityChipActive: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  priorityChipActiveHigh: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  priorityChipActiveMedium: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  priorityChipActiveLow: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  priorityChipText: {
    fontSize: 12,
    color: '#666',
  },
  priorityChipTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reporterEmail: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    gap: 8,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#F44336',
    textTransform: 'capitalize',
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  reportedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
  },
  reportedText: {
    fontSize: 13,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  resolutionPreview: {
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 6,
  },
  resolutionPreviewText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modalHalfSection: {
    flex: 1,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  modalText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  modalSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  reportedContentItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reportedContentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  reportedContentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reportedContentSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  previousResolution: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  previousResolutionText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  resolveButton: {
    backgroundColor: '#4CAF50',
  },
  resolveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: '#f0f0f0',
  },
  dismissButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
});