import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { ScreenLayout } from '@/components/screenLayout';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { showToast } from '@/components/ui/Toast';

// Mock user data
const MOCK_USER = {
  id: '1',
  name: 'Sarah Johnson',
  username: '@sarahj',
  email: 'sarah.johnson@example.com',
  avatar: 'https://i.pravatar.cc/150?img=12',
  bio: 'Food lover | Coffee addict | Always exploring new places ☕️',
  location: 'New York, NY',
  joinDate: 'January 2026',
  stats: {
    events: 23,
    reviews: 42,
    badges: 8,
    friends: 156
  }
};

// Menu items
const MENU_ITEMS = [
  { id: 'profile', icon: 'person-outline', label: 'My Profile', screen: 'edit-profile' },
  { id: 'events', icon: 'calendar-outline', label: 'My Events', screen: 'myevents', count: 23 },
  { id: 'reviews', icon: 'star-outline', label: 'My Reviews', screen: 'myreviews', count: 42 },
  { id: 'badges', icon: 'ribbon-outline', label: 'Badges', screen: 'badges', count: 8 },
  { id: 'favorites', icon: 'heart-outline', label: 'Favorites', screen: 'favorites' },
  { id: 'wishlist', icon: 'bookmark-outline', label: 'Wishlist', screen: 'wishlist' },
  { id: 'friends', icon: 'people-outline', label: 'Friends', screen: 'friends', count: 156 },
  { id: 'history', icon: 'time-outline', label: 'History', screen: 'history' },
  { id: 'feedback', icon: 'chatbubble-outline', label: 'Feedback', screen: 'feedback' },
  { id: 'settings', icon: 'settings-outline', label: 'Settings', screen: 'settings' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(MOCK_USER);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio);
  const [editLocation, setEditLocation] = useState(user.location);

  const handleEditProfile = () => {
    setEditModalVisible(true);
    setEditName(user.name);
    setEditBio(user.bio);
    setEditLocation(user.location);
  };

  const handleSaveProfile = () => {
    // Validate inputs
    if (!editName.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    // Update user data
    setUser({
      ...user,
      name: editName,
      bio: editBio,
      location: editLocation
    });

    setEditModalVisible(false);
    showToast('Profile updated successfully', 'success');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            showToast('Logged out successfully', 'success');
            router.replace('/login');
          }
        }
      ]
    );
  };

  const EditProfileModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Avatar Preview */}
            <View style={styles.avatarEditContainer}>
              <Image source={{ uri: user.avatar }} style={styles.avatarEdit} />
              <TouchableOpacity style={styles.changePhotoButton}>
                <Ionicons name="camera" size={20} color="#FFF" />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Bio Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Tell us about yourself"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Location Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={editLocation}
                onChangeText={setEditLocation}
                placeholder="City, State"
                placeholderTextColor="#999"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScreenLayout showBack={false}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Edit Button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
            <Ionicons name="create-outline" size={22} color="#7E9AFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.onlineDot} />
          </View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userUsername}>{user.username}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          <View style={styles.bioContainer}>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
          
          <View style={styles.locationJoinContainer}>
            <View style={styles.locationItem}>
              <Ionicons name="location-outline" size={16} color="#7E9AFF" />
              <Text style={styles.locationText}>{user.location}</Text>
            </View>
            <View style={styles.joinItem}>
              <Ionicons name="calendar-outline" size={16} color="#7E9AFF" />
              <Text style={styles.joinText}>Joined {user.joinDate}</Text>
            </View>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.stats.events}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.stats.reviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.stats.badges}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.stats.friends}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          {MENU_ITEMS.slice(0, 5).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(`/${item.screen}` as any)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: '#F0F3FF' }]}>
                  <Ionicons name={item.icon as any} size={20} color="#7E9AFF" />
                </View>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.count && (
                  <View style={styles.menuItemBadge}>
                    <Text style={styles.menuItemBadgeText}>{item.count}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Social</Text>
          {MENU_ITEMS.slice(5, 8).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(`/${item.screen}` as any)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: '#F0F3FF' }]}>
                  <Ionicons name={item.icon as any} size={20} color="#7E9AFF" />
                </View>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.count && (
                  <View style={styles.menuItemBadge}>
                    <Text style={styles.menuItemBadgeText}>{item.count}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Support</Text>
          {MENU_ITEMS.slice(8, 10).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(`/${item.screen}` as any)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: '#F0F3FF' }]}>
                  <Ionicons name={item.icon as any} size={20} color="#7E9AFF" />
                </View>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>NextStop v1.0.0</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#7E9AFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#7E9AFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  bioContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  bioText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  locationJoinContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  joinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  joinText: {
    fontSize: 12,
    color: '#666',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7E9AFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#DEE4FF',
  },
  menuSection: {
    marginBottom: 20,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemBadge: {
    backgroundColor: '#7E9AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  menuItemBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    gap: 8,
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    minHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE4FF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  avatarEditContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarEdit: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#7E9AFF',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7E9AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  changePhotoText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
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
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#F8F9FA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#7E9AFF',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});