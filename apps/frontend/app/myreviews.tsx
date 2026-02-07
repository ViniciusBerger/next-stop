import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { ScreenLayout } from "@/components/screenLayout";
import { ReviewCard } from "@/components/reviewCard";
import { Ionicons } from '@expo/vector-icons';

export default function MyReviewsScreen() {
  const reviews = [
    { id: "1", userName: "User's name", date: "Month-year", placeName: "Place's name", rating: 4.5, likes: 12, hasImage: true, text: "Review text..." },
    { id: "2", userName: "User's name", date: "Month-year", placeName: "Place's name", rating: 4, likes: 5, hasImage: false, text: "Another review..." },
    { id: "3", userName: "User's name", date: "Month-year", placeName: "Place's name", rating: 5, likes: 20, hasImage: true, text: "Yet another review..." }  
];

const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={50} color="#ccc" />
      <Text style={styles.emptyTitle}>No reviews yet</Text>
      <Text style={styles.emptySubtitle}>
        Your thoughts on the places you've visited will appear here.
      </Text>
    </View>
  );

  // 1. The Top of the Card
  const Header = () => (
    <View style={styles.cardTop}>
      <Text style={styles.headerTitle}>My Reviews</Text>
      <View style={styles.whiteCardTop}>
        <Ionicons name="hand-right-outline" size={80} color="#5962ff" style={styles.topIcon} />
      </View>
    </View>
  );

  // 2. The Bottom of the Card
  const Footer = () => (
    <View style={styles.cardBottom} />
  );

  return (
    <ScreenLayout showBack={true}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardBody}>
            <ReviewCard {...item} onDelete={() => {}} />
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
    paddingBottom: 40,
  },
  cardTop: {
    alignItems: 'center',
    marginTop: -10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  whiteCardTop: {
    backgroundColor: '#FFF',
    width: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    alignItems: 'center',
    paddingTop: 20,
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
  topIcon: {
    transform: [{ rotate: '-15deg' }],
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#000000',
    width: '100%',
    marginVertical: 10,
  },
  emptyContainer: {
    backgroundColor: '#FFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  }
});