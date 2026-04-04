import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '@/components/screenLayout';

const USER = {
  avatar: 'https://i.pravatar.cc/150?img=12',
};

export default function EditInformationScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
  });

  const validate = () => {
    const newErrors = { username: '', email: '', password: '' };
    let valid = true;

    if (!username || username.trim().length < 3) {
      newErrors.username = 'Invalid username';
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = 'Invalid email';
      valid = false;
    }

    if (newPassword && newPassword !== confirmPassword) {
      newErrors.password = 'Invalid Password';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = () => {
    if (validate()) {
      router.back();
    }
  };

  return (
    <ScreenLayout showBack={true} title="Edit Information">
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Card */}
        <View style={styles.card}>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: USER.avatar }} style={styles.avatar} />
          </View>
          <Text style={styles.editPictureText}>Edit picture</Text>

          {/* Username */}
          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            style={[styles.input, errors.username ? styles.inputError : null]}
            value={username}
            onChangeText={setUsername}
            placeholder=""
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
          {errors.username ? (
            <Text style={styles.fieldError}>{errors.username}</Text>
          ) : null}

          {/* Email */}
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

          {/* New Password */}
          <Text style={styles.fieldLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder=""
            placeholderTextColor="#9CA3AF"
          />

          {/* Confirm New Password */}
          <Text style={styles.fieldLabel}>Confirm New Password</Text>
          <TextInput
            style={[styles.input, errors.password ? styles.inputError : null]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder=""
            placeholderTextColor="#9CA3AF"
          />
          {errors.password ? (
            <Text style={styles.fieldError}>{errors.password}</Text>
          ) : null}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save changes</Text>
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
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 110,
    backgroundColor: '#B0B0B0',
  },
  editPictureText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
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