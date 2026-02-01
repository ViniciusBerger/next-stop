import { View, Text, StyleSheet, FlatList } from "react-native";
import { ScreenLayout } from "@/components/screenLayout";
import { EventCard } from "@/components/eventCard";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
// import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function MyEvents() {

  // const [events, setEvents] = useState<any[]>([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const user = auth.currentUser;
  //   if (!user) return;

  //   // 1. Point to your 'events' collection
  //   // 2. Filter where 'organizerId' matches the current user
  //   const q = query(
  //     collection(db, "events"), 
  //     where("organizerId", "==", user.uid)
  //   );

  //   // 3. Listen for real-time updates
  //   const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //     const eventsData: any[] = [];
  //     querySnapshot.forEach((doc) => {
  //       eventsData.push({ id: doc.id, ...doc.data() });
  //     });
      
  //     setEvents(eventsData);
  //     setLoading(false);
  //   }, (error) => {
  //     console.error("Firestore Error:", error);
  //     setLoading(false);
  //   });

  //   return () => unsubscribe(); // Cleanup listener on unmount
  // }, []);

  // // Use the real 'events' state for filtering
  // const upcomingEvents = events.filter(e => e.status === 'upcoming');
  // const pastEvents = events.filter(e => e.status === 'past' || e.status === 'completed');

  // Mock data for demonstration
  const MOCK_EVENTS = [
  { id: '1', title: 'Beach Cleanup', date: 'Oct 12, 2026', location: 'Santa Monica', status: 'upcoming' },
  { id: '2', title: 'Tech Talk', date: 'Jan 15, 2026', location: 'Online', status: 'past' },
  { id: '3', title: 'Charity Run', date: 'Dec 01, 2026', location: 'Central Park', status: 'upcoming' },
  { id: '4', title: 'Coffee Meetup', date: 'Jan 01, 2026', location: 'Starbucks', status: 'past' },
];
  //Separate data
  const upcomingEvents = MOCK_EVENTS.filter(e => e.status === 'upcoming');
  const pastEvents = MOCK_EVENTS.filter(e => e.status === 'past' || e.status === 'completed');

  return (
    <ScreenLayout showBack={true}>
      <View style={styles.contentContainer}>
        <Text style={styles.titleText}>My Events</Text>

        <View style={styles.iconContainer}>
          <Ionicons name="calendar-outline" size={80} color="#ffffff" />
        </View>
        {MOCK_EVENTS.length === 0 ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholder}>No events scheduled yet.</Text>
          </View>
        ) : (
          <View>
            {/*Upcoming Section*/}
            {upcomingEvents.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeaderDark}>Upcoming</Text>
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} {...event} />
                ))}
              </View>
            )}

            {/*Past Section*/}
            {pastEvents.length > 0 && (
              <View style={[styles.section, { marginTop: 20 }]}>
                <Text style={styles.sectionHeader}>Past Events</Text>
                {pastEvents.map(event => (
                  <EventCard key={event.id} {...event} />
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
    marginTop: -10,
    marginBottom: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    marginTop: 20,
    alignItems: 'center',
    fontSize: 16,
    color: '#ffffff',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
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