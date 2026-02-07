import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { ScreenLayout } from "@/components/screenLayout";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Import picker

export default function CreateReviewScreen() {
  const [rating, setRating] = useState(0);
  const [placeName, setPlaceName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [image, setImage] = useState<string | null>(null); // State for the image URI

  const handlePost = () => {
    // UI Only for now
    console.log("Posting Review:", { placeName, rating, reviewText });
  };

  const pickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Open the picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Updated for newer versions
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const StarRating = () => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <Ionicons 
            name={star <= rating ? "star" : "star-outline"} 
            size={35} 
            color={star <= rating ? "#FFD700" : "#000"} 
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScreenLayout showBack={true}>
      <View style={styles.contentContainer}>
        <Text style={styles.headerTitle}>Create Review</Text>

        {/* The Main Card */}
        <View style={styles.reviewCard}>
          <Ionicons name="create-outline" size={70} color="#5962ff" style={styles.mainIcon} />

          {/* Input: Place Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Place Name</Text>
            <TextInput 
              style={styles.input}
              placeholder="Where did you go?"
              value={placeName}
              onChangeText={setPlaceName}
            />
          </View>

          {/* Star Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rating</Text>
            <StarRating />
          </View>

{/* Image Upload Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Add Photo</Text>
            <TouchableOpacity 
              style={styles.imageUploadBox} 
              activeOpacity={0.6} 
              onPress={pickImage}
            >
              {image ? (
                // If an image is selected, show it
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image }} style={styles.selectedImage} />
                  <View style={styles.changeImageOverlay}>
                     <Ionicons name="camera" size={24} color="#FFF" />
                     <Text style={{color: '#FFF', fontWeight: 'bold'}}>Change</Text>
                  </View>
                </View>
              ) : (
                // Otherwise show the placeholder
                <>
                  <Ionicons name="camera-outline" size={40} color="#5962ff" />
                  <Text style={styles.uploadText}>Upload Image</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Input: Review Text */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Review</Text>
            <TextInput 
              style={[styles.input, styles.textArea]}
              placeholder="Tell others about your experience..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={reviewText}
              onChangeText={setReviewText}
            />
          </View>
        </View>

        {/* Post Button */}
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Post Review</Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -10,
  },
  reviewCard: {
    backgroundColor: '#E7EEFF',
    borderRadius: 35,
    padding: 25,
    borderWidth: 1,
    alignItems: 'center',
  },
  mainIcon: {
    marginBottom: 10,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#C8D7FF',
    borderWidth: 1,
    borderColor: '#5962ff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#C8D7FF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5962ff',
  },
  textArea: {
    height: 120,
  },
  postButton: {
    backgroundColor: '#7d77f0',
    height: 60,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  postButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageUploadBox: {
    height: 150, // Slightly taller to fit the image nicely
    backgroundColor: '#C8D7FF',
    borderWidth: 2,
    borderColor: '#5962ff',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensures the image doesn't bleed out of corners
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 5
  },
  uploadText: {
    color: '#5962ff',
    fontWeight: '600',
    marginTop: 5,
  },
});