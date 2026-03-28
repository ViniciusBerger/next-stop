import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AdminScreenLayout } from '@/components/adminScreenLayout';
import { showToast } from '@/components/ui/Toast';

// Mock data - replace with API call
const MOCK_FEEDBACK = {
  '1': {
    id: '1',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userAvatar: 'https://i.pravatar.cc/150?u=1',
    type: 'bug',
    title: 'App crashes when opening camera',
    description: 'The app crashes immediately when trying to use the camera feature. This happens on iOS 15. I\'ve tried restarting the app and my phone, but the issue persists.',
    status: 'pending',
    createdAt: '2024-03-15T10:30:00Z',
    deviceInfo: 'iPhone 13, iOS 15.4',
    appVersion: '1.2.3',
    steps: '1. Open app\n2. Go to camera\n3. App crashes',
    expectedBehavior: 'Camera should open normally',
    actualBehavior: 'App crashes immediately',
  },
  '2': {
    id: '2',
    userId: 'user2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    userAvatar: 'https://i.pravatar.cc/150?u=2',
    type: 'feature',
    title: 'Add dark mode support',
    description: 'Would love to see dark mode support for better night-time usage.',
    status: 'in-review',
    createdAt: '2024-03-14T15:45:00Z',
    rating: 4,
  },
  // Add more mock data as needed
};

export default function FeedbackDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resolution, setResolution] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadFeedback();
  }, [id]);

  const loadFeedback = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFeedback(MOCK_FEEDBACK[id as keyof typeof MOCK_FEEDBACK]);
      setStatus(MOCK_FEEDBACK[id as keyof typeof MOCK_FEEDBACK]?.status || '');
      setLoading(false);
    }, 500);
  };

  const handleStatusUpdate = (newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to mark this feedback as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setStatus(newStatus);
            showToast(`Feedback marked as ${newStatus}`, 'success');
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in-review': return '#2196F3';
      case 'resolved': return '#4CAF50';
      case 'dismissed': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return { name: 'bug', color: '#F44336' };
      case 'feature': return { name: 'bulb', color: '#FFC107' };
      case 'report': return { name: 'flag', color: '#FF9800' };
      case 'general': return { name: 'chatbubble', color: '#2196F3' };
      default: return { name: 'help-circle', color: '#666' };
    }
  };

  if (loading || !feedback) {
    return (
      <AdminScreenLayout showBack={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7E9AFF" />
          <Text style={styles.loadingText}>Loading feedback...</Text>
        </View>
      </AdminScreenLayout>
    );
  }

  const typeIcon = getTypeIcon(feedback.type);

  return (
    <AdminScreenLayout showBack={true}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Feedback Details</Text>
        </View>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor(status) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
          <Text style={[styles.statusBannerText, { color: getStatusColor(status) }]}>
            Status: {status.toUpperCase()}
          </Text>
        </View>

        {/* User Info Card */}
        <View style={styles.card}>
          <View style={styles.userInfoRow}>
            <Image source={{ uri: feedback.userAvatar }} style={styles.userAvatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{feedback.userName}</Text>
              <Text style={styles.userEmail}>{feedback.userEmail}</Text>
              <Text style={styles.userId}>ID: {feedback.userId}</Text>
            </View>
          </View>
        </View>

        {/* Feedback Type Card */}
        <View style={styles.card}>
          <View style={styles.typeHeader}>
            <View style={[styles.typeIconContainer, { backgroundColor: typeIcon.color + '20' }]}>
              <Ionicons name={typeIcon.name as any} size={24} color={typeIcon.color} />
            </View>
            <View>
              <Text style={styles.typeLabel}>Type</Text>
              <Text style={[styles.typeValue, { color: typeIcon.color }]}>
                {feedback.type.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(feedback.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Feedback Content Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Title</Text>
          <Text style={styles.titleText}>{feedback.title}</Text>

          <Text style={[styles.sectionTitle, styles.marginTop]}>Description</Text>
          <Text style={styles.descriptionText}>{feedback.description}</Text>

          {feedback.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rating: </Text>
              <Text style={styles.ratingValue}>{'⭐'.repeat(feedback.rating)}</Text>
            </View>
          )}
        </View>

        {/* Additional Info (if available) */}
        {feedback.deviceInfo && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            {feedback.deviceInfo && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Device:</Text>
                <Text style={styles.infoValue}>{feedback.deviceInfo}</Text>
              </View>
            )}
            
            {feedback.appVersion && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>App Version:</Text>
                <Text style={styles.infoValue}>{feedback.appVersion}</Text>
              </View>
            )}
            
            {feedback.steps && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Steps to Reproduce:</Text>
                <Text style={styles.infoValue}>{feedback.steps}</Text>
              </View>
            )}
            
            {feedback.expectedBehavior && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Expected:</Text>
                <Text style={styles.infoValue}>{feedback.expectedBehavior}</Text>
              </View>
            )}
            
            {feedback.actualBehavior && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Actual:</Text>
                <Text style={styles.infoValue}>{feedback.actualBehavior}</Text>
              </View>
            )}
          </View>
        )}

        {/* Resolution Notes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resolution Notes</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add notes about how this feedback was resolved..."
            value={resolution}
            onChangeText={setResolution}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {status !== 'resolved' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.resolveButton]}
              onPress={() => handleStatusUpdate('resolved')}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Mark Resolved</Text>
            </TouchableOpacity>
          )}
          
          {status !== 'in-review' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.reviewButton]}
              onPress={() => handleStatusUpdate('in-review')}
            >
              <Ionicons name="time" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Start Review</Text>
            </TouchableOpacity>
          )}
          
          {status !== 'dismissed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.dismissButton]}
              onPress={() => handleStatusUpdate('dismissed')}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
              <Text style={[styles.actionButtonText, styles.dismissButtonText]}>Dismiss</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </AdminScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#7E9AFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userId: {
    fontSize: 12,
    color: '#999',
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeLabel: {
    fontSize: 12,
    color: '#666',
  },
  typeValue: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateText: {
    flex: 1,
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  marginTop: {
    marginTop: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
  },
  ratingValue: {
    fontSize: 14,
    color: '#FFC107',
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#DEE4FF',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F8F9FA',
  },
  actionsContainer: {
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  resolveButton: {
    backgroundColor: '#4CAF50',
  },
  reviewButton: {
    backgroundColor: '#2196F3',
  },
  dismissButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dismissButtonText: {
    color: '#666',
  },
});