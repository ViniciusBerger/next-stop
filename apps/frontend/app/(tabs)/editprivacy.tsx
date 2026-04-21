import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '@/components/screenLayout';
import { auth } from '@/src/config/firebase';
import { API_URL } from '@/src/config/api';
import { getToken } from '@/src/utils/auth';
import axios from 'axios';

const OPTIONS = ['All', 'Friends', 'None'] as const;
type PrivacyOption = typeof OPTIONS[number] | '';

const FIELDS = [
  { key: 'activityFeed', label: 'See activity feed' },
  { key: 'myEvents',     label: 'My events' },
  { key: 'badges',       label: 'Badges' },
] as const;

type FieldKey = typeof FIELDS[number]['key'];

export default function EditPrivacyScreen() {
  const router = useRouter();
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?img=12');
  const [saving, setSaving] = useState(false);
  const [firebaseUid, setFirebaseUid] = useState('');

  const [selected, setSelected] = useState<Record<FieldKey, PrivacyOption>>({
    activityFeed: '',
    myEvents: '',
    badges: '',
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

        if (res.data.profile?.profilePicture) {
          setAvatar(res.data.profile.profilePicture);
        }
        if (res.data.profile?.privacy) {
          const p = res.data.profile.privacy;
          setSelected({
            activityFeed: p.activityFeed || '',
            myEvents: p.myEvents || '',
            badges: p.badges || '',
          });
        }
      } catch (err) {
        console.log("Load privacy error:", err);
      }
    };
    loadProfile();
  }, []);

  const handleSelect = (field: FieldKey, option: PrivacyOption) => {
    setSelected(prev => ({ ...prev, [field]: option }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await getToken();

      await axios.put(
        `${API_URL}/profile?firebaseUid=${firebaseUid}`,
        { privacy: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Privacy settings updated!');
      router.back();
    } catch (err: any) {
      console.error("Save privacy error:", err?.response?.data || err);
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout showBack={true} title="Edit Privacy">
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* Card */}
        <View style={styles.card}>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
          </View>

          {/* Privacy Fields */}
          {FIELDS.map((field, index) => (
            <View key={field.key} style={[styles.fieldBlock, index < FIELDS.length - 1 && styles.fieldBlockBorder]}>
              <Text style={styles.fieldLabel}>{field.label}</Text>

              {/* Select option box — shows current selection */}
              <View style={styles.selectBox}>
                <Text style={styles.selectBoxText}>
                  {selected[field.key] || 'Select option'}
                </Text>
              </View>

              {/* Options: All, Friends, None — right aligned */}
              {OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.optionRow}
                  onPress={() => handleSelect(field.key, option)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionRight}>
                    <View style={[
                      styles.optionIndicator,
                      selected[field.key] === option && styles.optionIndicatorActive,
                    ]} />
                    <Text style={[
                      styles.optionText,
                      selected[field.key] === option && styles.optionTextActive,
                    ]}>
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
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

  // Card
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

  // Avatar
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 110,
    backgroundColor: '#B0B0B0',
  },

  // Each privacy field block
  fieldBlock: {
    marginBottom: 16,
    paddingBottom: 16,
  },
  fieldBlockBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },

  // Select box (shows current value)
  selectBox: {
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 6,
  },
  selectBoxText: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Option rows — right aligned like Figma
  optionRow: {
    alignItems: 'flex-end',
    paddingVertical: 4,
    backgroundColor: '#EEF2FF',
    marginBottom: 2,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    backgroundColor: 'transparent',
  },
  optionIndicatorActive: {
    borderColor: '#7E9AFF',
    backgroundColor: '#7E9AFF',
  },
  optionText: {
    fontSize: 13,
    color: '#374151',
  },
  optionTextActive: {
    color: '#7E9AFF',
    fontWeight: '600',
  },

  // Save button
  saveButton: {
    backgroundColor: '#7E9AFF',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});