import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import axios from 'axios';
import { auth } from '@/src/config/firebase';
import { AdminScreenLayout } from '@/components/adminScreenLayout';
import { API_URL } from '@/src/config/api';

interface ModerationUser {
  _id: string;
  firebaseUid: string;
  username: string;
  email: string;
  role: string;
  isBanned: boolean;
  isSuspended: boolean;
  suspendedUntil?: string;
  banReason?: string;
  createdAt: string;
  lastLogin?: string;
}

type UserStatus = 'active' | 'suspended' | 'banned';
type ActionType = 'ban' | 'unban' | 'suspend' | 'unsuspend' | null;

const getStatus = (user: ModerationUser): UserStatus => {
  if (user.isBanned) return 'banned';
  if (user.isSuspended) return 'suspended';
  return 'active';
};

const getStatusColor = (status: UserStatus) => {
  switch (status) {
    case 'active': return '#4CAF50';
    case 'suspended': return '#FF9800';
    case 'banned': return '#F44336';
  }
};

const getStatusIcon = (status: UserStatus): any => {
  switch (status) {
    case 'active': return 'checkmark-circle';
    case 'suspended': return 'time';
    case 'banned': return 'ban';
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString();
};

const showAlert = (
  title: string,
  message: string,
  buttons?: { text: string; style?: string; onPress?: () => void }[],
) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed) {
        const confirmButton = buttons.find(
          b => b.style === 'destructive' || (b.style !== 'cancel' && !!b.onPress),
        );
        confirmButton?.onPress?.();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons as any);
  }
};

const getAuthHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function ModerationScreen() {
  const [users, setUsers] = useState<ModerationUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');

  const [activeTab, setActiveTab] = useState<'members' | 'admins'>('members');

  const [selectedUser, setSelectedUser] = useState<ModerationUser | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [suspendDays, setSuspendDays] = useState('7');
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const { data } = await axios.get<ModerationUser[]>(`${API_URL}/admin/users`, { headers });
      setUsers(data);
    } catch (err) {
      showAlert('Error', 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, []),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const headers = await getAuthHeader();
      const { data } = await axios.get<ModerationUser[]>(`${API_URL}/admin/users`, { headers });
      setUsers(data);
    } catch {
      showAlert('Error', 'Failed to refresh.');
    } finally {
      setRefreshing(false);
    }
  };

  const openModal = (user: ModerationUser, action: ActionType) => {
    setSelectedUser(user);
    setActionType(action);
    setSuspendDays('7');
    setActionReason('');
    setModalVisible(true);
  };

  const confirmAction = async () => {
    if (!selectedUser || !actionType) return;
    setActionLoading(true);

    try {
      const headers = await getAuthHeader();
      const uid = selectedUser.firebaseUid;
      let updated: ModerationUser;

      if (actionType === 'ban') {
        const { data } = await axios.patch<ModerationUser>(
          `${API_URL}/admin/users/${uid}/ban`,
          { reason: actionReason || undefined },
          { headers },
        );
        updated = data;
      } else if (actionType === 'unban') {
        const { data } = await axios.patch<ModerationUser>(
          `${API_URL}/admin/users/${uid}/unban`,
          {},
          { headers },
        );
        updated = data;
      } else if (actionType === 'suspend') {
        const { data } = await axios.patch<ModerationUser>(
          `${API_URL}/admin/users/${uid}/suspend`,
          { days: parseInt(suspendDays) || 7, reason: actionReason || undefined },
          { headers },
        );
        updated = data;
      } else {
        const { data } = await axios.patch<ModerationUser>(
          `${API_URL}/admin/users/${uid}/unsuspend`,
          {},
          { headers },
        );
        updated = data;
      }

      setUsers(prev => prev.map(u => (u.firebaseUid === updated.firebaseUid ? updated : u)));
      setModalVisible(false);
    } catch {
      showAlert('Error', 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const members = users.filter(u => u.role !== 'admin');
  const admins = users.filter(u => u.role === 'admin');
  const tabUsers = activeTab === 'members' ? members : admins;

  const filteredUsers = tabUsers.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getStatus(user);
    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: members.length,
    active: members.filter(u => !u.isBanned && !u.isSuspended).length,
    suspended: members.filter(u => u.isSuspended).length,
    banned: members.filter(u => u.isBanned).length,
  };

  const getModalConfig = () => {
    if (!selectedUser || !actionType) return null;
    switch (actionType) {
      case 'ban':    return { title: `Ban ${selectedUser.username}`, icon: 'ban', color: '#F44336', message: 'This user will lose all access permanently.', confirmText: 'Ban User', showReason: true, showDays: false };
      case 'unban':  return { title: `Unban ${selectedUser.username}`, icon: 'checkmark-circle', color: '#4CAF50', message: 'This will restore full access to the user.', confirmText: 'Unban', showReason: false, showDays: false };
      case 'suspend': return { title: `Suspend ${selectedUser.username}`, icon: 'time', color: '#FF9800', message: 'User will be temporarily restricted.', confirmText: 'Suspend', showReason: true, showDays: true };
      case 'unsuspend': return { title: `Unsuspend ${selectedUser.username}`, icon: 'checkmark-circle', color: '#4CAF50', message: 'Suspension will be lifted immediately.', confirmText: 'Unsuspend', showReason: false, showDays: false };
    }
  };

  const renderUserCard = ({ item }: { item: ModerationUser }) => {
    const status = getStatus(item);
    const color = getStatusColor(status);

    return (
      <View style={styles.userCard}>
        {/* Avatar + info */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {item.username?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.username}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
            <Ionicons name={getStatusIcon(status)} size={13} color={color} />
            <Text style={[styles.statusText, { color }]}>{status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color="#888" />
            <Text style={styles.metaText}>Joined {formatDate(item.createdAt)}</Text>
          </View>
          {item.lastLogin && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color="#888" />
              <Text style={styles.metaText}>Last active {formatDate(item.lastLogin)}</Text>
            </View>
          )}
        </View>

        {/* Suspension / ban reason info */}
        {item.isSuspended && item.suspendedUntil && (
          <View style={styles.infoBar}>
            <Ionicons name="alert-circle" size={13} color="#FF9800" />
            <Text style={styles.infoBarText}>Suspended until {formatDate(item.suspendedUntil)}</Text>
          </View>
        )}
        {item.isBanned && item.banReason && (
          <View style={[styles.infoBar, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="information-circle" size={13} color="#F44336" />
            <Text style={[styles.infoBarText, { color: '#F44336' }]}>Reason: {item.banReason}</Text>
          </View>
        )}

        {/* Actions — hidden for admin accounts */}
        {activeTab !== 'admins' && (
          <View style={styles.actionRow}>
            {status === 'active' && (
              <>
                <TouchableOpacity style={[styles.actionBtn, styles.suspendBtn]} onPress={() => openModal(item, 'suspend')}>
                  <Ionicons name="time" size={14} color="#FF9800" />
                  <Text style={[styles.actionBtnText, { color: '#FF9800' }]}>Suspend</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.banBtn]} onPress={() => openModal(item, 'ban')}>
                  <Ionicons name="ban" size={14} color="#F44336" />
                  <Text style={[styles.actionBtnText, { color: '#F44336' }]}>Ban</Text>
                </TouchableOpacity>
              </>
            )}
            {status === 'suspended' && (
              <>
                <TouchableOpacity style={[styles.actionBtn, styles.restoreBtn]} onPress={() => openModal(item, 'unsuspend')}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  <Text style={[styles.actionBtnText, { color: '#4CAF50' }]}>Unsuspend</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.banBtn]} onPress={() => openModal(item, 'ban')}>
                  <Ionicons name="ban" size={14} color="#F44336" />
                  <Text style={[styles.actionBtnText, { color: '#F44336' }]}>Ban</Text>
                </TouchableOpacity>
              </>
            )}
            {status === 'banned' && (
              <TouchableOpacity style={[styles.actionBtn, styles.restoreBtn, { flex: 1 }]} onPress={() => openModal(item, 'unban')}>
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                <Text style={[styles.actionBtnText, { color: '#4CAF50' }]}>Unban</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const modalConfig = getModalConfig();

  return (
    <AdminScreenLayout showBack={true}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Moderation</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'members' && styles.tabActive]}
          onPress={() => { setActiveTab('members'); setFilterStatus('all'); setSearchQuery(''); }}
        >
          <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
            Members ({members.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'admins' && styles.tabActive]}
          onPress={() => { setActiveTab('admins'); setFilterStatus('all'); setSearchQuery(''); }}
        >
          <Text style={[styles.tabText, activeTab === 'admins' && styles.tabTextActive]}>
            Admins ({admins.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
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
      <View style={styles.statsRow}>
        {[
          { label: 'Total', value: stats.total, color: '#7E9AFF' },
          { label: 'Active', value: stats.active, color: '#4CAF50' },
          { label: 'Suspended', value: stats.suspended, color: '#FF9800' },
          { label: 'Banned', value: stats.banned, color: '#F44336' },
        ].map(s => (
          <View key={s.label} style={[styles.statCard, { borderLeftColor: s.color }]}>
            <Text style={styles.statNumber}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['all', 'active', 'suspended', 'banned'] as const).map(s => (
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

      {/* List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color="#7E9AFF" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={56} color="#ccc" />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          )
        }
      />

      {/* Action Modal */}
      {modalConfig && (
        <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={[styles.modalHeader, { borderBottomColor: modalConfig.color + '30' }]}>
                <Ionicons name={modalConfig.icon as any} size={32} color={modalConfig.color} />
                <Text style={[styles.modalTitle, { color: modalConfig.color }]}>{modalConfig.title}</Text>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>{modalConfig.message}</Text>

                {modalConfig.showDays && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Suspension period (days):</Text>
                    <TextInput
                      style={styles.input}
                      value={suspendDays}
                      onChangeText={setSuspendDays}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                  </View>
                )}

                {modalConfig.showReason && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Reason (optional):</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={actionReason}
                      onChangeText={setActionReason}
                      placeholder="Enter reason..."
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                )}

                {/* User preview */}
                <View style={styles.userPreview}>
                  <View style={styles.previewAvatar}>
                    <Text style={styles.previewAvatarText}>
                      {selectedUser?.username?.[0]?.toUpperCase() ?? '?'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.previewName}>{selectedUser?.username}</Text>
                    <Text style={styles.previewEmail}>{selectedUser?.email}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setModalVisible(false)}
                  disabled={actionLoading}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: modalConfig.color }]}
                  onPress={confirmAction}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.confirmBtnText}>{modalConfig.confirmText}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 10,
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
    fontSize: 11,
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
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DEE4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 17,
    fontWeight: '700',
    color: '#7E9AFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  userEmail: {
    fontSize: 12,
    color: '#888',
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaRow: {
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
    color: '#888',
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 8,
  },
  infoBarText: {
    fontSize: 12,
    color: '#F57C00',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  suspendBtn: {
    borderColor: '#FF9800',
    backgroundColor: '#FF980015',
  },
  banBtn: {
    borderColor: '#F44336',
    backgroundColor: '#F4433615',
  },
  restoreBtn: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF5015',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 90,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 24,
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
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DEE4FF',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#F8F9FA',
    color: '#333',
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DEE4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7E9AFF',
  },
  previewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  previewEmail: {
    fontSize: 12,
    color: '#888',
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F8F9FA',
  },
  cancelBtnText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmBtnText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  tabTextActive: {
    color: '#7E9AFF',
  },
});
