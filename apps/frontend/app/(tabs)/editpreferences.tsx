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

export default function EditPreferencesScreen() {
  const router = useRouter();

  const [cuisine, setCuisine] = useState('');
  const [dietary, setDietary] = useState('');
  const [allergies, setAllergies] = useState('');
  const [activities, setActivities] = useState('');

  const handleSave = () => {
    router.back();
  };

  return (
    <ScreenLayout showBack={true}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Text style={styles.title}>Edit Preferences</Text>

        {/* Card */}
        <View style={styles.card}>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: USER.avatar }} style={styles.avatar} />
          </View>

          {/* Cuisine */}
          <Text style={styles.fieldLabel}>Cuisine</Text>
          <TextInput
            style={styles.input}
            value={cuisine}
            onChangeText={setCuisine}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />

          {/* Dietary labels */}
          <Text style={styles.fieldLabel}>Dietary labels</Text>
          <TextInput
            style={styles.input}
            value={dietary}
            onChangeText={setDietary}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />

          {/* Allergies */}
          <Text style={styles.fieldLabel}>Allergies</Text>
          <TextInput
            style={styles.input}
            value={allergies}
            onChangeText={setAllergies}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />

          {/* Activities */}
          <Text style={styles.fieldLabel}>Activities</Text>
          <TextInput
            style={styles.input}
            value={activities}
            onChangeText={setActivities}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />

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
    marginBottom: 20,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 110,
    backgroundColor: '#B0B0B0',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 6,
    marginTop: 8,
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
  saveButton: {
    backgroundColor: '#7E9AFF',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});