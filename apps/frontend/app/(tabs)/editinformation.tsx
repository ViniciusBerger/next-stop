import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '@/components/screenLayout';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '@/src/config/firebase';
import { API_URL } from '@/src/config/api';
import { getToken } from '@/src/utils/auth';
import axios from 'axios';

const SUPABASE_URL = 'https://nooqsabykmeoajdgefhg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_9tmTWqEKEeEH6Gnk_8UTtQ_TAB6Ynz-';
const BUCKET = 'profile-pictures';

export default function EditInformationScreen() {
  const router = useRouter();

  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?img=12');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firebaseUid, setFirebaseUid] = useState('');

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        setFirebaseUid(user.uid);
        const token = await getToken();

        const res = await axios.get(
          `${API_URL}/profile?firebaseUid=${user.uid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUsername(res.data.username || '');
        setEmail(res.data.email || '');
        if (res.data.profile?.profilePicture) {
          setAvatar(res.data.profile.profilePicture);
        }
      } catch (err) {
        console.log("Load profile error:", err);
      }
    };

    loadProfile();
  }, []);

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], //  FIXED
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadToSupabase(result.assets[0].uri);
      }
    } catch (err) {
      console.log("Image pick error:", err);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadToSupabase = async (uri: string) => {
  try {
    setUploading(true);

    // SAFE filename (avoid blob extension issue)
    const fileName = `${firebaseUid}_${Date.now()}.jpg`;

    // Convert image to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Upload to Supabase
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'image/jpeg',
          'x-upsert': 'true',
        },
        body: blob,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.log("Supabase upload error:", errText);
      throw new Error('Upload failed');
    }

    // Generate clean public URL
    const publicUrl =
`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;

    // Update UI immediately
    setAvatar(publicUrl);

  } catch (err) {

    console.error("Upload error:", err);

    Alert.alert(
      'Upload Failed',
      'Image upload failed. Try again.'
    );

  } finally {
    setUploading(false);
  }
};

  const validate = () => {
    const newErrors = { username: '', email: '', password: '' };
    let valid = true;

    if (!username || username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = 'Invalid email';
      valid = false;
    }

    if (newPassword && newPassword !== confirmPassword) {
      newErrors.password = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {

  if (!validate()) return;

  try {

    setSaving(true);

    const token = await getToken();

    // SAFE payload (only send valid fields)
    const payload:any = {};

    if (username?.trim() && username.trim().length >= 3) {
      payload.username = username.trim();
    }

    if (avatar) {
      payload.profilePicture = avatar;
    }

    await axios.put(
      `${API_URL}/profile?firebaseUid=${firebaseUid}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    Alert.alert('Success', 'Profile updated successfully!');

    router.back();

  } catch (err:any) {

    console.error("Save error:", err?.response?.data || err);

    Alert.alert(
      'Error',
      err?.response?.data?.message || 'Failed to save profile'
    );

  } finally {

    setSaving(false);

  }

};
  return (
    <ScreenLayout showBack={true} title="Edit Information">
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.card}>

          <View style={styles.avatarWrapper}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#FFF" size="large" />
              </View>
            )}
          </View>

          <TouchableOpacity onPress={handlePickImage} disabled={uploading}>
            <Text style={styles.editPictureText}>
              {uploading ? 'Uploading...' : 'Edit picture'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            style={[styles.input, errors.username ? styles.inputError : null]}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
          {errors.username ? (
            <Text style={styles.fieldError}>{errors.username}</Text>
          ) : null}

          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email ? (
            <Text style={styles.fieldError}>{errors.email}</Text>
          ) : null}

          <Text style={styles.fieldLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Leave blank to keep current"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.fieldLabel}>Confirm New Password</Text>
          <TextInput
            style={[styles.input, errors.password ? styles.inputError : null]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirm new password"
            placeholderTextColor="#9CA3AF"
          />
          {errors.password ? (
            <Text style={styles.fieldError}>{errors.password}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.saveButton, (saving || uploading) && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving || uploading}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save changes</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 110,
    backgroundColor: '#B0B0B0',
  },
  uploadingOverlay: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 110,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPictureText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#7E9AFF',
    marginBottom: 20,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FAFAFA',
    marginBottom: 4,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  fieldError: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 8,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: '#7E9AFF',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});