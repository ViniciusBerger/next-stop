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
const MOCK_REPORTS = {
  '1': {
    id: '1',
    reporterId: 'user2',
    reporterName: 'Jane Smith',
    reporterEmail: 'jane@example.com',
    reporterAvatar: 'https://i.pravatar.cc/150?u=2',
    reportedType: 'user',
    reportedId: 'user6',
    reportedName: 'Mike Ross',
    reportedEmail: 'mike@example.com',
    reason: 'harassment',
    description: 'User is posting harassing comments on multiple reviews. They have targeted several users with offensive language.',
    status: 'pending',
    createdAt: '2024-03-15T11:20:00Z',
    priority: 'high',
    evidence: ['https://example.com/screenshot1.png'],
    previousReports: 2,
  },
  '2': {
    id: '2',
    reporterId: 'user3',
    reporterName: 'Bob Johnson',
    reporterEmail: 'bob@example.com',
    reporterAvatar: 'https://i.pravatar.cc/150?u=3',
    reportedType: 'place',
    reportedId: 'place123',
    reportedName: 'Sunset Cafe',
    reportedAddress: '123 Beach Rd, Santa Monica, CA',
    reason: 'fake',
    description: 'This place appears to be fake - address doesn\'t exist and photos are stolen from another business.',
    status: 'in-review',
    createdAt: '2024-03-14T16:30:00Z',
    priority: 'medium',
  },
  // Add more mock data as needed
};

export default function ReportDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resolution, setResolution] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReport(MOCK_REPORTS[id as keyof typeof MOCK_REPORTS]);
      setStatus(MOCK_REPORTS[id as keyof typeof MOCK_REPORTS]?.status || '');
      setLoading(false);
    }, 500);
  };

  const handleStatusUpdate = (newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to mark this report as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setStatus(newStatus);
            showToast(`Report marked as ${newStatus}`, 'success');
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'spam': return 'megaphone';
      case 'harassment': return 'hand-right';
      case 'inappropriate': return 'warning';
      case 'fake': return 'eye-off';
      case 'other': return 'flag';
      default: return 'flag';
    }
  };

  if (loading || !report) {
    return (
      <AdminScreenLayout showBack={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7E9AFF" />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      </AdminScreenLayout>
    );
  }

  return (
    <AdminScreenLayout showBack={true}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Report Details</Text>
        </View>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor(status) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
          <Text style={[styles.statusBannerText, { color: getStatusColor(status) }]}>
            Status: {status.toUpperCase()}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(report.priority) }]}>
              {report.priority.toUpperCase()} PRIORITY
            </Text>
          </View>
        </View>

        {/* Reporter Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reported By</Text>
          <View style={styles.userInfoRow}>
            <Image source={{ uri: report.reporterAvatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{report.reporterName}</Text>
              <Text style={styles.userEmail}>{report.reporterEmail}</Text>
              <Text style={styles.userId}>ID: {report.reporterId}</Text>
            </View>
          </View>
        </View>

        {/* Reported Content Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reported {report.reportedType}</Text>
          
          <View style={styles.reportedContent}>
            <View style={styles.reportedHeader}>
              <Ionicons 
                name={report.reportedType === 'user' ? 'person' : report.reportedType === 'place' ? 'location' : 'chatbubble'} 
                size={20} 
                color="#7E9AFF" 
              />
              <Text style={styles.reportedName}>{report.reportedName}</Text>
            </View>
            
            {report.reportedEmail && (
              <Text style={styles.reportedDetail}>Email: {report.reportedEmail}</Text>
            )}
            {report.reportedAddress && (
              <Text style={styles.reportedDetail}>Address: {report.reportedAddress}</Text>
            )}
          </View>
        </View>

        {/* Report Details Card */}
        <View style={styles.card}>
          <View style={styles.reasonHeader}>
            <Ionicons name={getReasonIcon(report.reason) as any} size={20} color="#F44336" />
            <Text style={styles.reasonTitle}>{report.reason.toUpperCase()}</Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{report.description}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Reported on:</Text>
            <Text style={styles.metaValue}>
              {new Date(report.createdAt).toLocaleString()}
            </Text>
          </View>

          {report.previousReports && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Previous reports:</Text>
              <Text style={styles.metaValue}>{report.previousReports}</Text>
            </View>
          )}
        </View>

        {/* Evidence Card */}
        {report.evidence && report.evidence.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Evidence</Text>
            {report.evidence.map((item: string, index: number) => (
              <TouchableOpacity key={index} style={styles.evidenceItem}>
                <Ionicons name="image" size={20} color="#7E9AFF" />
                <Text style={styles.evidenceText}>Screenshot {index + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Resolution Notes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resolution Notes</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add notes about how this report was resolved..."
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
    marginTop: -10,
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
    flexWrap: 'wrap',
    gap: 8,
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
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#7E9AFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  userId: {
    fontSize: 11,
    color: '#999',
  },
  reportedContent: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  reportedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reportedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reportedDetail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  metaValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  evidenceText: {
    fontSize: 14,
    color: '#7E9AFF',
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