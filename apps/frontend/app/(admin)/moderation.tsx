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
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AdminScreenLayout } from '@/components/adminScreenLayout';

type UserStatus = 'active' | 'suspended' | 'banned';
type ActionType = 'ban' | 'suspend' | 'unsuspend' | null;

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: UserStatus;
  joinDate: string;
  reports: number;
  suspendedUntil?: string;
  lastActive?: string;
  banReason?: string;
}

// Mock Data - Replace with your API calls
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://i.pravatar.cc/150?u=1',
    status: 'active',
    joinDate: '2024-01-15',
    reports: 0,
    lastActive: '2024-03-15'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://i.pravatar.cc/150?u=2',
    status: 'active',
    joinDate: '2024-02-20',
    reports: 2,
    lastActive: '2024-03-14'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    avatar: 'https://i.pravatar.cc/150?u=3',
    status: 'suspended',
    joinDate: '2024-03-10',
    reports: 5,
    suspendedUntil: '2024-04-10',
    lastActive: '2024-03-10',
    banReason: 'Multiple violations of community guidelines'
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    avatar: 'https://i.pravatar.cc/150?u=4',
    status: 'banned',
    joinDate: '2024-01-05',
    reports: 8,
    lastActive: '2024-02-28',
    banReason: 'Harassment and inappropriate behavior'
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    avatar: 'https://i.pravatar.cc/150?u=5',
    status: 'active',
    joinDate: '2024-03-25',
    reports: 1,
    lastActive: '2024-03-15'
  }
];

export default function ModerationScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [suspendDays, setSuspendDays] = useState('7');
  const [banReason, setBanReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');
  const [loading, setLoading] = useState(false);

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    banned: users.filter(u => u.status === 'banned').length
  };

  const handleAction = (user: User, action: ActionType) => {
    setSelectedUser(user);
    setActionType(action);
    setModalVisible(true);
    setSuspendDays('7');
    setBanReason('');
  };

  const confirmAction = () => {
    if (!selectedUser || !actionType) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          switch (actionType) {
            case 'ban':
              return { ...user, status: 'banned' as UserStatus, banReason };
            case 'suspend': {
              const days = parseInt(suspendDays) || 7;
              const suspendUntil = new Date();
              suspendUntil.setDate(suspendUntil.getDate() + days);
              return {
                ...user,
                status: 'suspended' as UserStatus,
                suspendedUntil: suspendUntil.toISOString().split('T')[0],
                banReason
              };
            }
            case 'unsuspend':
              return { ...user, status: 'active' as UserStatus, suspendedUntil: undefined, banReason: undefined };
            default:
              return user;
          }
        }
        return user;
      });

      setUsers(updatedUsers);
      
      // Show success message
      const actionMessages = {
        ban: 'banned',
        suspend: 'suspended',
        unsuspend: 'unsuspended'
      };
      
      Alert.alert(
        'Success',
        `${selectedUser.name} has been ${actionMessages[actionType]}`,
        [{ text: 'OK' }]
      );

      setModalVisible(false);
      setSelectedUser(null);
      setActionType(null);
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'suspended': return '#FF9800';
      case 'banned': return '#F44336';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case 'active': return 'checkmark-circle';
      case 'suspended': return 'time';
      case 'banned': return 'ban';
      default: return 'help-circle';
    }
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Ionicons name={getStatusIcon(item.status)} size={14} color={getStatusColor(item.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.userMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.metaText}>Joined {item.joinDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="flag-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{item.reports} reports</Text>
          </View>
          {item.lastActive && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.metaText}>Active {item.lastActive}</Text>
            </View>
          )}
        </View>

        {item.suspendedUntil && (
          <View style={styles.suspendedInfo}>
            <Ionicons name="alert-circle" size={14} color="#FF9800" />
            <Text style={styles.suspendedText}>
              Suspended until {item.suspendedUntil}
            </Text>
          </View>
        )}

        {item.banReason && item.status === 'banned' && (
          <View style={styles.banReasonContainer}>
            <Ionicons name="information-circle" size={14} color="#F44336" />
            <Text style={styles.banReasonText}>Reason: {item.banReason}</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          {item.status !== 'banned' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.banButton]}
                onPress={() => handleAction(item, 'ban')}
              >
                <Ionicons name="ban" size={16} color="#F44336" />
                <Text style={[styles.actionButtonText, styles.banText]}>Ban</Text>
              </TouchableOpacity>

              {item.status === 'suspended' ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.unsuspendButton]}
                  onPress={() => handleAction(item, 'unsuspend')}
                >
                  <Ionicons name="refresh" size={16} color="#4CAF50" />
                  <Text style={[styles.actionButtonText, styles.unsuspendText]}>
                    Unsuspend
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.suspendButton]}
                  onPress={() => handleAction(item, 'suspend')}
                >
                  <Ionicons name="time" size={16} color="#FF9800" />
                  <Text style={[styles.actionButtonText, styles.suspendText]}>
                    Suspend
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {item.status === 'banned' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.unsuspendButton]}
              onPress={() => handleAction(item, 'unsuspend')}
            >
              <Ionicons name="refresh" size={16} color="#4CAF50" />
              <Text style={[styles.actionButtonText, styles.unsuspendText]}>
                Reactivate
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderActionModal = () => {
    if (!selectedUser || !actionType) return null;

    const getModalContent = () => {
      switch (actionType) {
        case 'ban':
          return {
            title: `Ban ${selectedUser.name}`,
            icon: 'ban',
            color: '#F44336',
            message: 'This user will lose all access permanently. This action cannot be undone.',
            confirmText: 'Ban User'
          };
        case 'suspend':
          return {
            title: `Suspend ${selectedUser.name}`,
            icon: 'time',
            color: '#FF9800',
            message: 'This user will be temporarily restricted from the platform.',
            confirmText: 'Suspend'
          };
        case 'unsuspend':
          return {
            title: `Unsuspend ${selectedUser.name}`,
            icon: 'refresh',
            color: '#4CAF50',
            message: 'This will restore full access to the user immediately.',
            confirmText: 'Unsuspend'
          };
        default:
          return null;
      }
    };

    const content = getModalContent();
    if (!content) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, { borderBottomColor: content.color + '30' }]}>
              <Ionicons name={content.icon as any} size={32} color={content.color} />
              <Text style={[styles.modalTitle, { color: content.color }]}>
                {content.title}
              </Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>{content.message}</Text>

              {actionType === 'suspend' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Suspension Period (days):</Text>
                  <TextInput
                    style={styles.input}
                    value={suspendDays}
                    onChangeText={setSuspendDays}
                    keyboardType="numeric"
                    placeholder="Enter number of days"
                    placeholderTextColor="#999"
                  />
                </View>
              )}

              {(actionType === 'ban' || actionType === 'suspend') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Reason (optional):</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={banReason}
                    onChangeText={setBanReason}
                    placeholder="Enter reason for this action..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}

              <View style={styles.userPreview}>
                <Image source={{ uri: selectedUser.avatar }} style={styles.previewAvatar} />
                <View>
                  <Text style={styles.previewName}>{selectedUser.name}</Text>
                  <Text style={styles.previewEmail}>{selectedUser.email}</Text>
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: content.color }]}
                onPress={confirmAction}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>{content.confirmText}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { borderLeftColor: '#4CAF50' }]}>
        <Text style={styles.statNumber}>{stats.active}</Text>
        <Text style={styles.statLabel}>Active</Text>
      </View>
      <View style={[styles.statCard, { borderLeftColor: '#FF9800' }]}>
        <Text style={styles.statNumber}>{stats.suspended}</Text>
        <Text style={styles.statLabel}>Suspended</Text>
      </View>
      <View style={[styles.statCard, { borderLeftColor: '#F44336' }]}>
        <Text style={styles.statNumber}>{stats.banned}</Text>
        <Text style={styles.statLabel}>Banned</Text>
      </View>
      <View style={[styles.statCard, { borderLeftColor: '#7d77f0' }]}>
        <Text style={styles.statNumber}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
    </View>
  );

  const renderFilters = () => {
    return (
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'active', 'suspended', 'banned'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                filterStatus === status && styles.filterChipActive
              ]}
              onPress={() => setFilterStatus(status as any)}
            >
              <Text style={[
                styles.filterChipText,
                filterStatus === status && styles.filterChipTextActive
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <AdminScreenLayout showBack={true}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Moderation</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
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

      {/* Stats */}
      {renderStats()}

      {/* Filters */}
      {renderFilters()}

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />

      {renderActionModal()}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 8,
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
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  userMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  suspendedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
    gap: 4,
  },
  suspendedText: {
    fontSize: 12,
    color: '#F57C00',
  },
  banReasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
    gap: 4,
  },
  banReasonText: {
    fontSize: 12,
    color: '#F44336',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
  },
  banButton: {
    borderColor: '#F44336',
    backgroundColor: '#F4433610',
  },
  suspendButton: {
    borderColor: '#FF9800',
    backgroundColor: '#FF980010',
  },
  unsuspendButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF5010',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  banText: {
    color: '#F44336',
  },
  suspendText: {
    color: '#FF9800',
  },
  unsuspendText: {
    color: '#4CAF50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 25,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  modalBody: {
    padding: 20,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DEE4FF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  userPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  previewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  previewEmail: {
    fontSize: 12,
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
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
});