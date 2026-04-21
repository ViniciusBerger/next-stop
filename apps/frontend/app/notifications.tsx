import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { ScreenLayout } from '@/components/screenLayout';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '@/src/config/firebase';
import { API_URL } from '@/src/config/api';
import { getToken } from '@/src/utils/auth';

type NotificationItem = {
  _id: string;
  type: 'friend_request' | 'friend_accepted' | 'event_invite';
  message: string;
  read: boolean;
  createdAt: string;
  sender: {
    _id: string;
    username: string;
    profile?: { profilePicture?: string };
  };
  relatedId?: string;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [mongoUserId, setMongoUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await getToken();
        const profileRes = await axios.get(`${API_URL}/profile?firebaseUid=${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const id = profileRes.data._id;
        setMongoUserId(id);

        const res = await axios.get(`${API_URL}/notifications?userId=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const token = await getToken();
      await axios.patch(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!mongoUserId) return;
    try {
      const token = await getToken();
      await axios.patch(`${API_URL}/notifications/read-all?userId=${mongoUserId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return 'person-add';
      case 'friend_accepted':
        return 'people';
      case 'event_invite':
        return 'calendar';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'friend_request':
        return '#5962ff';
      case 'friend_accepted':
        return '#45d5af';
      case 'event_invite':
        return '#F59E0B';
      default:
        return '#999';
    }
  };

  const handlePress = (notification: NotificationItem) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.type === 'friend_request' || notification.type === 'friend_accepted') {
      router.push('/friends');
    } else if (notification.type === 'event_invite') {
      router.push('/myevents');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = ({ item }: { item: NotificationItem }) => {
    const avatar = item.sender?.profile?.profilePicture
      || `https://i.pravatar.cc/150?u=${item.sender?._id}`;

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.unreadCard]}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={[styles.iconBadge, { backgroundColor: getIconColor(item.type) }]}>
              <Ionicons name={getIcon(item.type) as any} size={12} color="#FFF" />
            </View>
          </View>

          <View style={styles.textContent}>
            <Text style={styles.notificationText}>
              <Text style={styles.senderName}>{item.sender?.username || 'Someone'}</Text>
              {' '}{item.message}
            </Text>
            <Text style={styles.timeText}>{getTimeAgo(item.createdAt)}</Text>
          </View>

          {!item.read && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout showBack={true} title="Notifications">
      <View style={styles.container}>
        {unreadCount > 0 && (
          <View style={styles.headerRow}>
            <Text style={styles.unreadCountText}>{unreadCount} unread</Text>
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="notifications-outline" size={64} color="#ccc" />
                </View>
                <Text style={styles.emptyTitle}>No notifications</Text>
                <Text style={styles.emptyMessage}>
                  You're all caught up! Notifications for friend requests, accepted friends, and event invites will appear here.
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  unreadCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#45d5af',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  notificationCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  unreadCard: {
    backgroundColor: '#F0F3FF',
    borderColor: '#7E9AFF',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#DEE4FF',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  textContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  senderName: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5962ff',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 25,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    paddingTop: 25,
    marginTop: 25,
    lineHeight: 22,
  },
});
