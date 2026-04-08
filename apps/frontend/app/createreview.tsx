import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator } from "react-native"; //  added ActivityIndicator
import { ScreenLayout } from "@/components/screenLayout";
import { Ionicons } from '@expo/vector-icons';
import { auth } from "@/src/config/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import { API_URL } from "@/src/config/api";
import { getToken } from "@/src/utils/auth";
import { showAlert } from '@/src/utils/alert';

//  ADDED
const SUPABASE_URL = 'https://nooqsabykmeoajdgefhg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_9tmTWqEKEeEH6Gnk_8UTtQ_TAB6Ynz-';
const BUCKET = 'review-images';

export default function CreateReviewScreen() {
  const { placeId, placeName: initialPlaceName } = useLocalSearchParams();
  const [rating, setRating] = useState(0);
  const [placeName, setPlaceName] = useState((initialPlaceName as string) || "");
  const [reviewText, setReviewText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null); //  ADDED - stores Supabase URL
  const [uploading, setUploading] = useState(false); //  ADDED
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  //  ADDED - upload to Supabase
  const uploadToSupabase = async (uri: string): Promise<string | null> => {
    try {
      setUploading(true);
      const fileName = `review_${currentUser?.uid}_${Date.now()}.jpg`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'image/jpeg',
            'x-upsert': 'true',
          },
          body: blob,
        }
      );

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error("Supabase error:", errText);
        return null;
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;
      return publicUrl;

    } catch (err) {
      console.error("Upload error:", err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handlePost = async () => {
    if (!currentUser) {
      const msg = authLoading 
        ? "Verifying login, please wait..." 
        : "You must be logged in to post a review.";
      showAlert("Not Logged In", msg);
      return;
    }

    if (reviewText.length < 10) {
      showAlert("Too Short", "Review must be at least 10 characters long.");
      return;
    }

    if (rating < 1) {
      showAlert("Rating Required", "Please select a star rating.");
      return;
    }

    try {
      // ADDED - upload image to Supabase first if exists
      let finalImageUrl = null;
      if (image) {
        finalImageUrl = await uploadToSupabase(image);
      }

      const payload = {
        author: String(currentUser.uid), 
        place: String(placeId),          
        rating: Number(rating),         
        reviewText: String(reviewText), 
        date: new Date().toISOString(), 
        images: finalImageUrl ? [finalImageUrl] : [], // CHANGED - use Supabase URL
      };

      const token = await getToken();
      const response = await axios.post(`${API_URL}/reviews`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 201) {
        showAlert("Success", "Review successfully posted!");
        setPlaceName("");
        setReviewText("");
        setRating(0);
        setImage(null);
        setImageUrl(null); // ADDED
        router.push("/home");
      }
    } catch (error: any) {
      const serverMessage = error.response?.data?.message;
      console.error("SERVER SAYS:", serverMessage);
      const finalMsg = Array.isArray(serverMessage) 
        ? serverMessage.join("\n") 
        : serverMessage || "Unknown Error";
      showAlert("Validation Failed", finalMsg);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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
          let iconName: any = "star-outline";
          if (rating >= index) {
            iconName = "star";
          } else if (rating >= index - 0.5) {
            iconName = "star-half";
          }

          return (
            <View key={index} style={styles.starContainer}>
              <Ionicons 
                name={iconName} 
                size={35} 
                color={rating >= index - 0.5 ? "#FFD700" : "#000"} 
              />
              <View style={StyleSheet.absoluteFill}>
                <View style={styles.hitboxRow}>
                  <TouchableOpacity 
                    style={styles.halfHitbox} 
                    onPress={() => setRating(index - 0.5)} 
                  />
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
    <ScreenLayout showBack={true} title="Create Review">
      <View style={styles.contentContainer}>

        <View style={styles.reviewCard}>
          <Ionicons name="create-outline" size={70} color="#5962ff" style={styles.mainIcon} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Place Name</Text>
            <TextInput 
              style={styles.input}
              placeholder={placeName || "Where did you go?"}
              value={placeName}
              onChangeText={setPlaceName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rating</Text>
            <StarRating />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Add Photo</Text>
            <TouchableOpacity 
              style={styles.imageUploadBox} 
              activeOpacity={0.6} 
              onPress={pickImage}
              disabled={uploading} //ADDED
            >
              {uploading ? ( //  ADDED - show spinner while uploading
                <ActivityIndicator size="large" color="#5962ff" />
              ) : image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image }} style={styles.selectedImage} />
                  <View style={styles.changeImageOverlay}>
                    <Ionicons name="camera" size={24} color="#FFF" />
                    <Text style={{color: '#FFF', fontWeight: 'bold'}}>Change</Text>
                  </View>
                </View>
              ) : (
                <>
                  <Ionicons name="camera-outline" size={40} color="#5962ff" />
                  <Text style={styles.uploadText}>Upload Image</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

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

        <TouchableOpacity
          style={[styles.postButton, uploading && { opacity: 0.7 }]} //  ADDED opacity
          onPress={handlePost}
          disabled={uploading} // ADDED
        >
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
    height: 150,
    backgroundColor: '#C8D7FF',
    borderWidth: 2,
    borderColor: '#5962ff',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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
    position: 'relative',
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
    flex: 1,
    height: '100%',
  },
});