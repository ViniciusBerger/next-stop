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

// Mock feedback data
const MOCK_FEEDBACK = [
  {
    id: '1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    type: 'bug',
    title: 'App crashes on startup',
    description: 'The app crashes immediately when I try to open it on iOS',
    status: 'pending',
    date: '2024-03-15',
    rating: null,
  },
  {
    id: '2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    type: 'feature',
    title: 'Add dark mode',
    description: 'Would love to see dark mode support for night usage',
    status: 'in-review',
    date: '2024-03-14',
    rating: 4,
  },
  {
    id: '3',
    userName: 'Bob Johnson',
    userEmail: 'bob@example.com',
    type: 'report',
    title: 'Inappropriate content',
    description: 'User posted offensive content in review section',
    status: 'resolved',
    date: '2024-03-13',
    rating: null,
  },
  {
    id: '4',
    userName: 'Alice Brown',
    userEmail: 'alice@example.com',
    type: 'general',
    title: 'Great app!',
    description: 'Really enjoying the app, keep up the good work',
    status: 'resolved',
    date: '2024-03-12',
    rating: 5,
  },
  {
    id: '5',
    userName: 'Charlie Wilson',
    userEmail: 'charlie@example.com',
    type: 'bug',
    title: 'Location not updating',
    description: 'The location doesn\'t update when I move to a new area',
    status: 'pending',
    date: '2024-03-11',
    rating: null,
  },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const [feedback, setFeedback] = useState(MOCK_FEEDBACK);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState('all');
  const [resolution, setResolution] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in-review': return '#2196F3';
      case 'resolved': return '#4CAF50';
      default: return '#666';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return 'bug';
      case 'feature': return 'bulb';
      case 'report': return 'flag';
      case 'general': return 'chatbubble';
      default: return 'help-circle';
    }
  };

  const handleStatusUpdate = (id: string, newStatus: string) => {
    setFeedback(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status: newStatus } 
          : item
      )
    );
    setModalVisible(false);
    Alert.alert('Success', `Feedback marked as ${newStatus}`);
  };

  const filteredFeedback = feedback.filter(item => 
    filter === 'all' ? true : item.status === filter
  );

  const stats = {
    total: feedback.length,
    pending: feedback.filter(f => f.status === 'pending').length,
    inReview: feedback.filter(f => f.status === 'in-review').length,
    resolved: feedback.filter(f => f.status === 'resolved').length,
  };

  const renderFeedbackItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setSelectedFeedback(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={styles.avatarText}>{item.userName[0]}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.userEmail}>{item.userEmail}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.typeRow}>
          <Ionicons name={getTypeIcon(item.type)} size={14} color="#666" />
          <Text style={styles.typeText}>{item.type}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        {item.rating && (
          <Text style={styles.rating}>Rating: {'⭐'.repeat(item.rating)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback & Reports</Text>
        <TouchableOpacity onPress={() => setFeedback([...MOCK_FEEDBACK])} style={styles.refreshButton}>
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

      {/* Filter Tabs */}
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
        </ScrollView>
      </View>

      {/* Feedback List */}
      <FlatList
        data={filteredFeedback}
        renderItem={renderFeedbackItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No feedback found</Text>
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
              <Text style={styles.modalTitle}>Feedback Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedFeedback && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>User</Text>
                  <Text style={styles.modalText}>{selectedFeedback.userName}</Text>
                  <Text style={styles.modalSubtext}>{selectedFeedback.userEmail}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Type</Text>
                  <View style={styles.modalTypeRow}>
                    <Ionicons name={getTypeIcon(selectedFeedback.type)} size={20} color="#666" />
                    <Text style={styles.modalTypeText}>{selectedFeedback.type}</Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Title</Text>
                  <Text style={styles.modalText}>{selectedFeedback.title}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Description</Text>
                  <Text style={styles.modalDescription}>{selectedFeedback.description}</Text>
                </View>

                {selectedFeedback.rating && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Rating</Text>
                    <Text style={styles.modalRating}>{'⭐'.repeat(selectedFeedback.rating)}</Text>
                  </View>
                )}

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Status</Text>
                  <View style={[styles.modalStatus, { backgroundColor: getStatusColor(selectedFeedback.status) + '20' }]}>
                    <Text style={[styles.modalStatusText, { color: getStatusColor(selectedFeedback.status) }]}>
                      {selectedFeedback.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

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
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                {selectedFeedback?.status !== 'resolved' && (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.resolveButton]}
                    onPress={() => handleStatusUpdate(selectedFeedback.id, 'resolved')}
                  >
                    <Text style={styles.resolveButtonText}>Resolve</Text>
                  </TouchableOpacity>
                )}
                
                {selectedFeedback?.status !== 'dismissed' && (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.dismissButton]}
                    onPress={() => handleStatusUpdate(selectedFeedback.id, 'dismissed')}
                  >
                    <Text style={styles.dismissButtonText}>Dismiss</Text>
                  </TouchableOpacity>
                )}
              </View>
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  userEmail: {
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
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 'auto',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  rating: {
    fontSize: 14,
    color: '#FFC107',
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
    maxHeight: '80%',
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
  modalTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTypeText: {
    fontSize: 16,
    color: '#1a1a1a',
    textTransform: 'capitalize',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalRating: {
    fontSize: 16,
    color: '#FFC107',
  },
  modalStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: '600',
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
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  modalActions: {
    flexDirection: 'row',
    gap: 8,
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