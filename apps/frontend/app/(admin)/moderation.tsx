import React, { useState, useEffect } from 'react';
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
  ScrollView,
  RefreshControl // Added RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Types
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
  banReason?: string; // Added banReason
  role?: 'user' | 'moderator' | 'admin'; // Added role
}

// Mock Data - Replace with your API calls
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://i.pravatar.cc/150?u=1',
    status: 'active',
    role: 'user',
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
    role: 'user',
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
    role: 'user',
    joinDate: '2024-03-10',
    reports: 5,
    suspendedUntil: '2024-04-10',
    lastActive: '2024-03-10'
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    avatar: 'https://i.pravatar.cc/150?u=4',
    status: 'banned',
    role: 'user',
    joinDate: '2024-01-05',
    reports: 8,
    lastActive: '2024-02-28',
    banReason: 'Multiple violations of community guidelines'
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    avatar: 'https://i.pravatar.cc/150?u=5',
    status: 'active',
    role: 'user',
    joinDate: '2024-03-25',
    reports: 1,
    lastActive: '2024-03-15'
  }
];

// Mock API functions - Replace with your actual API calls
const API = {
  // Fetch users from backend
  getUsers: async (params?: { status?: string; search?: string }) => {
    // TODO: Replace with your actual API endpoint
    // const queryParams = new URLSearchParams(params as any).toString();
    // const response = await fetch(`/api/admin/users?${queryParams}`, {
    //   headers: {
    //     'Authorization': `Bearer ${await getToken()}`,
    //   },
    // });
    // return response.json();
    
    // Mock response for now
    await new Promise(resolve => setTimeout(resolve, 1000));
    return MOCK_USERS;
  },

  // Ban user
  banUser: async (userId: string, reason?: string) => {
    // TODO: Replace with your actual API call
    // const response = await fetch(`/api/admin/users/${userId}/ban`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${await getToken()}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ reason }),
    // });
    // return response.json();
    
    // Mock response
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'User banned successfully' };
  },

  // Suspend user
  suspendUser: async (userId: string, days: number, reason?: string) => {
    // TODO: Replace with your actual API call
    // const response = await fetch(`/api/admin/users/${userId}/suspend`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${await getToken()}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ days, reason }),
    // });
    // return response.json();
    
    // Mock response
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'User suspended successfully' };
  },

  // Unsuspend user
  unsuspendUser: async (userId: string) => {
    // TODO: Replace with your actual API call
    // const response = await fetch(`/api/admin/users/${userId}/unsuspend`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${await getToken()}`,
    //   },
    // });
    // return response.json();
    
    // Mock response
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'User unsuspended successfully' };
  },

  // Check if current user is admin
  checkAdminStatus: async () => {
    // TODO: Replace with your actual API call
    // const response = await fetch('/api/auth/check-admin');
    // return response.ok;
    
    // Mock response - always true for testing
    return true;
  }
};

// Helper to get auth token (implement based on your auth system)
const getToken = async (): Promise<string> => {
  // TODO: Replace with your actual token retrieval
  // e.g., from AsyncStorage, SecureStore, etc.
  // return await AsyncStorage.getItem('userToken') || '';
  return 'mock-token';
};

export default function ModerationScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // Added refreshing state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [suspendDays, setSuspendDays] = useState('7');
  const [banReason, setBanReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');
  const [isAdmin, setIsAdmin] = useState(false); // Added admin check

  // Check admin status on mount
  useEffect(() => {
    checkAdminAccess();
  }, []);

  // Load users on mount and when filters change
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, filterStatus, searchQuery]);

  const checkAdminAccess = async () => {
    const admin = await API.checkAdminStatus();
    setIsAdmin(admin);
    if (!admin) {
      Alert.alert(
        'Access Denied',
        'You do not have permission to access this page.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await API.getUsers({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined,
      });
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

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
    // Double-check admin status before allowing action
    if (!isAdmin) {
      Alert.alert('Error', 'Admin access required');
      return;
    }
    
    setSelectedUser(user);
    setActionType(action);
    setModalVisible(true);
    setSuspendDays('7');
    setBanReason('');
  };

  const confirmAction = async () => {
    if (!selectedUser || !actionType || !isAdmin) return;

    setLoading(true);
    
    try {
      let result;
      
      switch (actionType) {
        case 'ban':
          result = await API.banUser(selectedUser.id, banReason);
          // Update local state
          setUsers(prev => prev.map(user => 
            user.id === selectedUser.id 
              ? { ...user, status: 'banned', banReason }
              : user
          ));
          Alert.alert('Success', `User banned successfully`);
          break;
          
        case 'suspend': {
          const days = parseInt(suspendDays) || 7;
          result = await API.suspendUser(selectedUser.id, days, banReason);
          const suspendUntil = new Date();
          suspendUntil.setDate(suspendUntil.getDate() + days);
          
          setUsers(prev => prev.map(user => 
            user.id === selectedUser.id 
              ? { 
                  ...user, 
                  status: 'suspended', 
                  suspendedUntil: suspendUntil.toISOString().split('T')[0],
                  banReason
                }
              : user
          ));
          Alert.alert('Success', `User suspended for ${days} days`);
          break;
        }
        
        case 'unsuspend':
          result = await API.unsuspendUser(selectedUser.id);
          setUsers(prev => prev.map(user => 
            user.id === selectedUser.id 
              ? { ...user, status: 'active', suspendedUntil: undefined, banReason: undefined }
              : user
          ));
          Alert.alert('Success', `User unsuspended successfully`);
          break;
      }

      setModalVisible(false);
      setSelectedUser(null);
      setActionType(null);
    } catch (error) {
      console.error('Error performing action:', error);
      Alert.alert('Error', 'Failed to perform action. Please try again.');
    } finally {
      setLoading(false);
    }
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
            {item.role && item.role !== 'user' && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{item.role}</Text>
              </View>
            )}
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
      <View style={[styles.statCard, { borderLeftColor: '#2196F3' }]}>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Moderation</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />

      {renderActionModal()}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
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
  roleBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  roleText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '500',
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
    borderRadius: 16,
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
    borderColor: '#e1e1e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  userPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    gap: 12,
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