import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { ScreenLayout } from "@/components/screenLayout";
import { ReviewCard } from "@/components/reviewCard";
import { Ionicons } from '@expo/vector-icons';

export default function LocationReviewsScreen() {
  const reviews = [
    { id: "1", userName: "Alex Rivera", date: "Feb 2026", placeName: "The Chill Spot", rating: 4.5, likes: 12, hasImage: true, text: "The atmosphere here is incredible. Definitely coming back!" },
    { id: "2", userName: "Jordan Smith", date: "Jan 2026", placeName: "The Chill Spot", rating: 4, likes: 5, hasImage: false, text: "Great drinks, but the music was a bit loud for a Monday." },
    { id: "3", userName: "Casey Doe", date: "Dec 2025", placeName: "The Chill Spot", rating: 5, likes: 8, hasImage: true, text: "Best spot in town for a weekend hangout." },
  ];

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={60} color="#4750ff" />
      <Text style={styles.emptyTitle}>No reviews yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to tell the community about your visit to this location!
      </Text>
    </View>
  );

  const Header = () => (
    <View style={styles.cardTop}>
      <Text style={styles.headerTitle}>The Chill Spot</Text>
      <View style={styles.whiteCardTop} />
    </View>
  );

  const Footer = () => <View style={styles.cardBottom} />;

  return (
    <ScreenLayout showBack={true}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardBody}>
            <ReviewCard {...item} />
          </View>
        )}
        ListHeaderComponent={Header}
        ListFooterComponent={Footer}
        ListEmptyComponent={EmptyState}
        ItemSeparatorComponent={() => <View style={styles.cardBody}><View style={styles.divider} /></View>}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  listPadding: { 
    paddingBottom: 40 
  },
  cardTop: { 
    alignItems: 'center', 
    marginTop: -10 
  },
  headerTitle: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    marginBottom: 20,
    marginTop: 3
  },
  whiteCardTop: {
    backgroundColor: '#FFF',
    width: '100%',
    height: 40, // Reduced height since there's no content
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  cardBody: {
    backgroundColor: '#FFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cardBottom: {
    backgroundColor: '#FFF',
    height: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  divider: { 
    height: 1, 
    backgroundColor: '#EEE', 
    width: '100%', 
    marginVertical: 10 
  },
  emptyContainer: {
    backgroundColor: '#FFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
});