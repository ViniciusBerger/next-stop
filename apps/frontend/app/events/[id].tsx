import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenLayout } from "@/components/screenLayout";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import { auth } from "@/src/config/firebase";
import { API_URL } from "@/src/config/api";
import { Platform, Linking } from 'react-native';
import { getToken } from "@/src/utils/auth";

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const [mongoUserId, setMongoUserId] = useState<string | null>(null);
  const isPast = event ? new Date(event.date) < new Date() : false;

  const showAlert = (title: string, message: string, buttons?: { text: string; style?: string; onPress?: () => void }[]) => {
    if (Platform.OS === 'web') {
        if (buttons && buttons.length > 1) {
        // Confirm dialog for destructive actions
        const confirmed = window.confirm(`${title}\n\n${message}`);
        if (confirmed) {
            const confirmButton = buttons.find(b => b.style === 'destructive' || b.text !== 'No');
            confirmButton?.onPress?.();
        }
        } else {
        window.alert(`${title}\n\n${message}`);
        }
    } else {
        Alert.alert(title, message, buttons as any);
    }
    };

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
          headers: { Authorization: `Bearer ${token}`,
                    'user-id': mongoId
                    }
          
        });

        setEvent(eventRes.data);

        // Check if user is attending
        const attending = eventRes.data.attendees?.some(
          (a: any) => (a._id ?? a) === mongoId
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

  const handleToggleAttendance = async () => {
    try {
      const token = await getToken();
      await axios.post(`${API_URL}/events/${id}/attend`, 
        { userId: mongoUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsAttending(!isAttending);
    } catch (error: any) {
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
    <ScreenLayout showBack={true}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Event Details</Text>

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
            const destination = encodeURIComponent(
                `${event.place.name}, ${event.place.address ?? ''}`
            );
            const url = Platform.select({
                ios: `maps://0,0?q=${destination}`,
                android: `geo:0,0?q=${destination}`,
                default: `https://www.google.com/maps/search/?api=1&query=${destination}`
            });
            Linking.openURL(url);
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
                    const res = await axios.delete(`${API_URL}/events/${id}`, {
                      headers: { 
                        Authorization: `Bearer ${token}`,
                        'user-id': mongoUserId 
                      }
                    });
                    console.log("Delete response:", res.data);
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
                    const res = await axios.delete(`${API_URL}/events/${id}`, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'user-id': mongoUserId 
                    }
                    });
                    console.log("Delete response:", res.data);
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
    marginTop: -10,
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
});