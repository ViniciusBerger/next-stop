import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { AdminScreenLayout } from '@/components/adminScreenLayout';
import axios from 'axios';
import { API_URL } from '@/src/config/api';

type Announcement = {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
};

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function AnnouncementScreen() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [past, setPast] = useState<Announcement[]>([]);
  const [loadingPast, setLoadingPast] = useState(true);

  const fetchPast = async () => {
    try {
      const { data } = await axios.get<Announcement[]>(`${API_URL}/announcements`);
      setPast(data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoadingPast(false);
    }
  };

  useEffect(() => {
    fetchPast();
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      showAlert('Missing fields', 'Please fill in both title and message.');
      return;
    }
    setSending(true);
    try {
      await axios.post(`${API_URL}/announcements`, { title: title.trim(), message: message.trim() });
      showAlert('Sent', 'Announcement sent to all users.');
      setTitle('');
      setMessage('');
      fetchPast();
    } catch (err) {
      showAlert('Error', 'Failed to send announcement.');
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminScreenLayout showBack={true}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Schedule Announcement</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. App Maintenance Tonight"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write your announcement here..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Send to All Users</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>PAST ANNOUNCEMENTS</Text>

        {loadingPast ? (
          <ActivityIndicator color="#22D3EE" style={{ marginTop: 20 }} />
        ) : past.length === 0 ? (
          <Text style={styles.emptyText}>No announcements sent yet.</Text>
        ) : (
          past.map((item) => (
            <View key={item._id} style={styles.pastCard}>
              <Text style={styles.pastTitle}>{item.title}</Text>
              <Text style={styles.pastMessage}>{item.message}</Text>
              <Text style={styles.pastDate}>
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </AdminScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 0,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  textArea: {
    height: 110,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#22D3EE',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
    marginBottom: 12,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  pastCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  pastTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  pastMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  pastDate: {
    fontSize: 12,
    color: '#999',
  },
});
