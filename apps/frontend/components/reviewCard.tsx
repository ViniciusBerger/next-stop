import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

interface ReviewProps {
  userName: string;
  date: string;
  placeName: string;
  rating: number;
  likes: string | number;
  hasImage?: boolean;
  text: string;
  isOwnReview?: boolean;
  onDelete?: () => void;
}

export function ReviewCard({ 
  userName, date, placeName, rating, likes, hasImage, text, onDelete, isOwnReview 
}: ReviewProps) {
  
  const renderStars = (val: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let name: any = i <= val ? "star" : i - 0.5 === val ? "star-half" : "star-outline";
      stars.push(<Ionicons key={i} name={name} size={22} color="black" />);
    }
    return stars;
  };

  return (
    <View style={styles.reviewWrapper}>
      <View style={styles.userInfoRow}>
        <View style={styles.avatarPlaceholder} />
        <View>
          <Text style={styles.userNameText}>{userName}</Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>
      </View>

      <Text style={styles.placeNameText}>{placeName}</Text>

      {hasImage && (
        <View style={styles.imageBox}>
          <Ionicons name="image-outline" size={40} color="#ccc" />
        </View>
      )}

      <View style={styles.ratingRow}>
        <View style={styles.starsContainer}>{renderStars(rating)}</View>
        <View style={styles.likesContainer}>
          <Ionicons name="heart" size={18} color="#ff4d4d" />
          <Text style={styles.likesText}>{likes} likes</Text>
        </View>
      </View>

      <Text style={styles.reviewBodyText}>{text}</Text>

{/* Only show the button if it's the current user's review */}
      {isOwnReview && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete Review</Text>
        </TouchableOpacity>
      )}    </View>
  );
}

const styles = StyleSheet.create({
  reviewWrapper: { width: '100%', marginBottom: 10 },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#C4C4C4', marginRight: 12 },
  userNameText: { fontSize: 16, fontWeight: 'bold' },
  dateText: { fontSize: 13, color: '#666' },
  placeNameText: { fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  imageBox: { width: '70%', height: 130, backgroundColor: '#F5F5F5', borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  starsContainer: { flexDirection: 'row' },
  likesContainer: { flexDirection: 'row', alignItems: 'center' },
  likesText: { marginLeft: 4, fontSize: 16 },
  reviewBodyText: { fontSize: 14, lineHeight: 20, marginBottom: 15 },
  deleteButton: { backgroundColor: '#7d77f0', height: 48, borderRadius: 100, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#5962ff' },
  deleteButtonText: { fontWeight: 'bold', fontSize: 18, color: '#fff' },
});