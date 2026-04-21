import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenLayout } from "@/components/screenLayout";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import { auth } from "@/src/config/firebase";
import { API_URL } from "@/src/config/api";
import { getToken } from "@/src/utils/auth";
import { showAlert } from '@/src/utils/alert';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const [mongoUserId, setMongoUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const isPast = event ? new Date(event.date) < new Date() : false;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await getToken();
        // Get MongoDB _id
        const profileRes = await axios.get(`${API_URL}/profile?firebaseUid=${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const mongoId = profileRes.data._id;
        setMongoUserId(mongoId);

        // Get event details
        const eventRes = await axios.get(`${API_URL}/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setEvent(eventRes.data);

        // Check if user is attending
        const attending = eventRes.data.attendees?.some(
          (a: any) => String(a?._id ?? a) === String(mongoId)
        );
        setIsAttending(attending);
      } catch (error: any) {
        console.error("Failed to fetch event:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const loadFriends = async () => {
    if (!mongoUserId) return;
    try {
      const token = await getToken();
      const friendsRes = await axios.get(`${API_URL}/friends?userId=${mongoUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formatted = friendsRes.data.map((f: any) => ({
        id: f._id,
        name: f.username || "User",
        username: f.username ? `@${f.username}` : "",
        avatar: f.profile?.profilePicture || `https://i.pravatar.cc/150?u=${f._id}`,
      }));
      setFriends(formatted);
    } catch (err: any) {
      console.error("Failed to load friends:", err.response?.data || err.message);
    }
  };

  const openInviteModal = async () => {
    setSelectedFriends([]);
    setShowInviteModal(true);
    if (friends.length === 0) await loadFriends();
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId) ? prev.filter((f) => f !== friendId) : [...prev, friendId]
    );
  };

  const handleSendInvites = async () => {
    if (selectedFriends.length === 0) {
      setShowInviteModal(false);
      return;
    }
    setInviting(true);
    try {
      const token = await getToken();
      const res = await axios.post(
        `${API_URL}/events/${id}/invite`,
        { friendIds: selectedFriends },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvent(res.data);
      setShowInviteModal(false);
      setSelectedFriends([]);
      showAlert(
        "Invites Sent",
        `Invited ${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''} to this event.`
      );
    } catch (err: any) {
      showAlert("Error", err.response?.data?.message || "Failed to send invites.");
    } finally {
      setInviting(false);
    }
  };

  const invitableFriends = friends.filter((f) => {
    const alreadyInvited = (event?.invitedFriends ?? []).some(
      (inv: any) => String(inv?._id ?? inv) === String(f.id)
    );
    const alreadyAttending = (event?.attendees ?? []).some(
      (a: any) => String(a?._id ?? a) === String(f.id)
    );
    return !alreadyInvited && !alreadyAttending;
  });

  const handleToggleAttendance = async () => {
    if (!mongoUserId) return;
    const wasAttending = isAttending;
    setIsAttending(!wasAttending);
    try {
      const token = await getToken();
      const res = await axios.post(`${API_URL}/events/${id}/attend`,
        { userId: mongoUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvent(res.data);
      const attending = res.data.attendees?.some(
        (a: any) => String(a?._id ?? a) === String(mongoUserId)
      );
      setIsAttending(!!attending);
    } catch (error: any) {
      setIsAttending(wasAttending);
      showAlert("Error", error.response?.data?.message || "Failed to update attendance.");
    }
  };

  const isHost = event?.host?._id === mongoUserId || event?.host === mongoUserId;

  if (loading) {
    return (
      <ScreenLayout showBack={true}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!event) {
    return (
      <ScreenLayout showBack={true}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Event not found.</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout showBack={true} title="Event Details">
      <ScrollView contentContainerStyle={styles.container}>

        {/* Main Info Card */}
        <View style={styles.card}>
            {/* Status + Privacy badges */}
            <View style={styles.badgeRow}>
                <View style={[styles.badge, !isPast ? styles.badgeGreen : styles.badgeGray]}>
                    <Text style={styles.badgeText}>{isPast ? 'past' : 'upcoming'}</Text>
                </View>
                <View style={[styles.badge, styles.badgeBlue]}>
                    <Ionicons 
                        name={event.privacy === 'Public Event' ? 'earth' : 'lock-closed'} 
                        size={12} color="#fff" style={{ marginRight: 4 }} 
                    />
                    <Text style={styles.badgeText}>{event.privacy}</Text>
                </View>
            </View>

          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.description}>{event.description}</Text>

          <View style={styles.divider} />

          {/* Date */}
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#5962ff" />
            <Text style={styles.detailText}>
              {new Date(event.date).toLocaleDateString([], { 
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
              })} at {new Date(event.date).toLocaleTimeString([], { 
                hour: '2-digit', minute: '2-digit' 
              })}
            </Text>
          </View>

          {/* Place */}
        {event.place?.name && (
        <TouchableOpacity
            style={styles.detailRow}
            onPress={() => {
              router.push({
                pathname: "/locationdetails",
                params: { place: JSON.stringify(event.place) },
              });
            }}
            activeOpacity={0.7}
        >
            <Ionicons name="business-outline" size={20} color="#5962ff" />
            <View style={{ flex: 1, marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.detailText}>{event.place.name}</Text>
            <Ionicons name="open-outline" size={14} color="#5962ff" style={{ marginLeft: 4 }} />
            </View>
        </TouchableOpacity>
        )}

          {/* Host */}
          <View style={styles.detailRowBottom}>
            <Ionicons name="person-outline" size={20} color="#5962ff" />
            <Text style={styles.detailText}>
              Hosted by {event.host?.username ?? 'Unknown'}
              {isHost ? ' (You)' : ''}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Attendees */}
          <View style={styles.attendeesRow}>
            <Ionicons name="people-outline" size={20} color="#5962ff" />
            <Text style={styles.detailText}>
              {event.attendees?.length ?? 0} attending
            </Text>
          </View>
        </View>

        {/* RSVP Button — only for non-hosts on upcoming events */}
        {!isHost && !isPast &&event.status === 'upcoming' && (
          <TouchableOpacity
            style={[styles.rsvpButton, isAttending && styles.rsvpButtonCancel]}
            onPress={handleToggleAttendance}
          >
            <Ionicons 
              name={isAttending ? "close-circle-outline" : "checkmark-circle-outline"} 
              size={22} color="#fff" style={{ marginRight: 8 }} 
            />
            <Text style={styles.rsvpButtonText}>
              {isAttending ? "Cancel RSVP" : "RSVP to this event"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Host: Invite Friends */}
        {isHost && !isPast && event.status === 'upcoming' && (
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={openInviteModal}
          >
            <Ionicons name="person-add-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.rsvpButtonText}>Invite Friends</Text>
          </TouchableOpacity>
        )}

        {/* Host actions */}
        {isHost && !isPast &&event.status === 'upcoming' && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => showAlert(
              "Cancel Event",
              "Are you sure you want to cancel this event?",
              [
                { text: "No", style: "cancel" },
                { text: "Yes, cancel", style: "destructive", onPress: async () => {
                  try {
                    const token = await getToken();
                    await axios.delete(`${API_URL}/events/${id}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    showAlert("Cancelled", "Event has been cancelled.");
                    router.back();
                  } catch (err: any) {
                    showAlert("Error", "Failed to cancel event.");
                  }
                }}
              ]
            )}
          >
            <Ionicons name="trash-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.rsvpButtonText}>Cancel Event</Text>
          </TouchableOpacity>
        )}

        {isPast && isHost && (
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => showAlert(
            "Delete Event",
            "Are you sure you want to delete this event?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes, delete", style: "destructive", onPress: async () => {
                try {
                    const token = await getToken();
                    await axios.delete(`${API_URL}/events/${id}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    showAlert("Deleted", "Event has been deleted.", [{ text: "OK" }]);
                    router.back();
                } catch (err: any) {
                    console.error("Delete error:", err.response?.data);
                    showAlert("Error", "Failed to delete event.", [{ text: "OK" }]);
                }
                }}
            ]
            )}
        >
            <Ionicons name="trash-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.rsvpButtonText}>Delete Event</Text>
        </TouchableOpacity>
        )}

        {/* Invite Friends Modal */}
        <Modal
          visible={showInviteModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowInviteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Invite Friends</Text>
                <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {invitableFriends.length === 0 ? (
                <View style={styles.emptyFriends}>
                  <Ionicons name="people-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyFriendsText}>No friends to invite</Text>
                  <Text style={styles.emptyFriendsSubtext}>
                    {friends.length === 0
                      ? "Add friends to invite them to events"
                      : "All your friends are already invited or attending"}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={invitableFriends}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const isSelected = selectedFriends.includes(item.id);
                    return (
                      <TouchableOpacity
                        style={[styles.friendRow, isSelected && styles.friendRowSelected]}
                        onPress={() => toggleFriendSelection(item.id)}
                        activeOpacity={0.7}
                      >
                        <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
                        <View style={styles.friendInfo}>
                          <Text style={styles.friendName}>{item.name}</Text>
                          <Text style={styles.friendUsername}>{item.username}</Text>
                        </View>
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                          {isSelected && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  contentContainerStyle={styles.friendsList}
                />
              )}

              <TouchableOpacity
                style={[styles.modalDoneButton, (selectedFriends.length === 0 || inviting) && { opacity: 0.5 }]}
                onPress={handleSendInvites}
                disabled={selectedFriends.length === 0 || inviting}
              >
                <Text style={styles.modalDoneText}>
                  {inviting
                    ? "Sending..."
                    : `Send Invite${selectedFriends.length !== 1 ? 's' : ''}${selectedFriends.length > 0 ? ` (${selectedFriends.length})` : ''}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeGreen: { backgroundColor: '#45d5af' },
  badgeGray: { backgroundColor: '#999' },
  badgeBlue: { backgroundColor: '#5962ff' },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailText: {
    fontSize: 15,
    color: '#555',
    marginLeft: 10,
    flex: 1,
  },
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rsvpButton: {
    backgroundColor: '#45d5af',
    height: 60,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  rsvpButtonCancel: {
    backgroundColor: '#ff6b6b',
  },
  rsvpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff4b4b',
    height: 60,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteButton: {
    backgroundColor: '#5962ff',
    height: 60,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  friendsList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  friendRowSelected: {
    backgroundColor: '#F0F3FF',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderBottomColor: 'transparent',
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#DEE4FF',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  friendUsername: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#5962ff',
    borderColor: '#5962ff',
  },
  modalDoneButton: {
    backgroundColor: '#5962ff',
    marginHorizontal: 20,
    marginTop: 15,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDoneText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyFriends: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyFriendsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyFriendsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
});