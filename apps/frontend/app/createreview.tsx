import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { ScreenLayout } from "@/components/screenLayout";
import { Ionicons } from '@expo/vector-icons';
import { auth } from "@/src/config/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker'; // Import picker
import { useLocalSearchParams, useRouter } from "expo-router";
import { API_URL } from "@/src/config/api";
import { showAlert } from '@/src/utils/alert';

export default function CreateReviewScreen() {
  const { placeId, placeName: initialPlaceName } = useLocalSearchParams(); // Catch the ID from navigation
  const [rating, setRating] = useState(0);
  const [placeName, setPlaceName] = useState((initialPlaceName as string) || "");
  const [reviewText, setReviewText] = useState("");
  const [image, setImage] = useState<string | null>(null); // State for the image URI
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("CreateReview auth user:", user?.uid ?? "NULL");
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!currentUser) {
      const msg = authLoading 
        ? "Verifying login, please wait..." 
        : "You must be logged in to post a review.";
      showAlert("Not Logged In", msg);
      return;
    }

    if (reviewText.length < 10) {
      const msg = "Review must be at least 10 characters long.";
      showAlert("Too Short", msg);
      return;
    }

    if (rating < 1) {
      const msg = "Please select a star rating.";
      showAlert("Rating Required", msg);
      return;
    }

    try {
      const payload = {
      // author must be string and not empty
      author: String(currentUser.uid), 
      // place must be string and not empty
      place: String(placeId),          
      // rating must be a number
      rating: Number(rating),         
      // reviewText must be string (min 10)
      reviewText: String(reviewText), 
      // date must be a valid ISO Date String
      date: new Date().toISOString(), 
      // images must be an array of strings (even if empty)
      images: image ? [image] : [],   
    };

      const response = await axios.post(`${API_URL}/reviews`, payload);

      if (response.status === 201) {
        const successMsg = "Review successfully posted!";
        showAlert("Success", successMsg);
        
        // Reset form state
        setPlaceName("");
        setReviewText("");
        setRating(0);
        setImage(null);

        router.push("/home"); // Navigate back to the home screen
      }
    } catch (error: any) {
      // NestJS usually sends an array of error messages
      const serverMessage = error.response?.data?.message;
      console.error("SERVER SAYS:", serverMessage);

      const finalMsg = Array.isArray(serverMessage) 
        ? serverMessage.join("\n") 
        : serverMessage || "Unknown Error";

      showAlert("Validation Failed", finalMsg);
    }
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

  const StarRating = () => {
    const stars = [1, 2, 3, 4, 5];

    return (
      <View style={styles.starRow}>
        {stars.map((index) => {
          // Determine which icon to show for this specific star position
          let iconName: any = "star-outline";
          if (rating >= index) {
            iconName = "star";
          } else if (rating >= index - 0.5) {
            iconName = "star-half";
          }

          return (
            <View key={index} style={styles.starContainer}>
              {/* Star Icon */}
              <Ionicons 
                name={iconName} 
                size={35} 
                color={rating >= index - 0.5 ? "#FFD700" : "#000"} 
              />

              {/* Hidden Hitboxes for interaction */}
              <View style={StyleSheet.absoluteFill}>
                <View style={styles.hitboxRow}>
                  {/* Left Half Hitbox */}
                  <TouchableOpacity 
                    style={styles.halfHitbox} 
                    onPress={() => setRating(index - 0.5)} 
                  />
                  {/* Right Half Hitbox */}
                  <TouchableOpacity 
                    style={styles.halfHitbox} 
                    onPress={() => setRating(index)} 
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

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
              placeholder={placeName || "Where did you go?"}
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
    marginTop: 0,
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
  starRow: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#C8D7FF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5962ff',
  },
  starContainer: {
    position: 'relative', // Allows absolute positioning of hitboxes
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hitboxRow: {
    flexDirection: 'row',
    flex: 1,
  },
  halfHitbox: {
    flex: 1, // Each takes exactly 50% of the star's width
    height: '100%',
  },
});