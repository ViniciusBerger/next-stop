import { View, Text, StyleSheet } from "react-native";
import { ScreenLayout } from "@/components/screenLayout";
import { EventCard } from "@/components/eventCard";
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from "react";
import { auth } from "@/src/config/firebase";
import axios from "axios";
import { API_URL } from "@/src/config/api";
import { useFocusEffect } from "expo-router";
import { getToken } from "@/src/utils/auth";

export default function MyEvents() {
  const [createdEvents, setCreatedEvents] = useState<any[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mongoUserId, setMongoUserId] = useState<string | null>(null);

  const formatEvent = (event: any) => ({
    id: event._id,
    title: event.name,
    date: new Date(event.date).toLocaleDateString([], { 
      month: 'short', day: 'numeric', year: 'numeric' 
    }),
    location: event.location ?? event.place?.address ?? 'Unknown location',
  });

  useFocusEffect(
    useCallback(() => {
      const fetchEvents = async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;

          const token = await getToken();

          const profileRes = await axios.get(`${API_URL}/profile?firebaseUid=${user.uid}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const mongoId = profileRes.data._id;
          if (!mongoId) return;
          setMongoUserId(mongoId);

          const eventsRes = await axios.get(`${API_URL}/events/user/${mongoId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setCreatedEvents(eventsRes.data.created ?? []);
          setAttendingEvents(eventsRes.data.attending ?? []);
        } catch (error: any) {
          console.error("Failed to fetch events:", error.response?.data || error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchEvents();
    }, [])
  );

  const hasNoEvents = createdEvents.length === 0 && attendingEvents.length === 0;
  const now = new Date();

  const upcomingCreated = createdEvents.filter(e => new Date(e.date) > now);
  const upcomingAttending = attendingEvents.filter(
    e => new Date(e.date) > now &&
    e.host?._id?.toString() !== mongoUserId &&
    e.host?.toString() !== mongoUserId
  );
  const pastEvents = [
    ...createdEvents.filter(e => new Date(e.date) <= now),
    ...attendingEvents.filter(e => new Date(e.date) <= now),
  ];

  return (
    <ScreenLayout showBack={true}>
      <View style={styles.contentContainer}>
        <Text style={styles.titleText}>My Events</Text>

        <View style={styles.iconContainer}>
          <Ionicons name="calendar-outline" size={80} color="#ffffff" />
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading events...</Text>
        ) : hasNoEvents ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events scheduled yet.</Text>
          </View>
        ) : (
          <View>
            {upcomingCreated.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeaderDark}>Upcoming (Hosting)</Text>
                {upcomingCreated.map(event => (
                  <EventCard key={event._id} {...formatEvent(event)} />
                ))}
              </View>
            )}

            {upcomingAttending.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Upcoming (Attending)</Text>
                {upcomingAttending.map(event => (
                  <EventCard key={event._id} {...formatEvent(event)} />
                ))}
              </View>
            )}

            {pastEvents.length > 0 && (
            <View style={[styles.section, { marginTop: 20 }]}>
              <Text style={styles.sectionHeader}>Past Events</Text>
              {pastEvents.map(event => (
                <EventCard key={event._id} {...formatEvent(event)} />
              ))}
            </View>
            )}
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  titleText: {
    marginTop: 0,
    marginBottom: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  emptyContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#ffffff',
  },
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 15,
    marginLeft: 5,
  },
  sectionHeaderDark: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 15,
    marginLeft: 5,
  },
});