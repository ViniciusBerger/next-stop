import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ReportStatus = 'pending' | 'in-review' | 'resolved' | 'dismissed';
type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'fake' | 'other';
type ReportType = 'user' | 'place' | 'review';

interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterAvatar?: string;
  reportedType: ReportType;
  reportedId: string;
  reportedName: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  priority: 'low' | 'medium' | 'high';
}

interface ReportCardProps {
  report: Report;
  onPress: () => void;
}

export const ReportCard = ({ report, onPress }: ReportCardProps) => {
  const getStatusColor = (status: ReportStatus) => {
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

  const getReasonIcon = (reason: ReportReason) => {
    switch (reason) {
      case 'spam': return 'megaphone';
      case 'harassment': return 'hand-right';
      case 'inappropriate': return 'warning';
      case 'fake': return 'eye-off';
      case 'other': return 'flag';
      default: return 'flag';
    }
  };

  const getTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'user': return 'person';
      case 'place': return 'location';
      case 'review': return 'chatbubble';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.reporterInfo}>
          <Image 
            source={{ uri: report.reporterAvatar || 'https://i.pravatar.cc/150?u=' + report.reporterId }} 
            style={styles.avatar}
          />
          <View>
            <Text style={styles.reporterName}>{report.reporterName}</Text>
            <Text style={styles.reporterEmail}>{report.reporterEmail}</Text>
          </View>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) + '20' }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(report.priority) }]}>
            {report.priority.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.typeRow}>
          <View style={styles.reportedTypeContainer}>
            <Ionicons name={getTypeIcon(report.reportedType) as any} size={14} color="#666" />
            <Text style={styles.reportedTypeText}>{report.reportedType}</Text>
          </View>
          <View style={styles.reasonContainer}>
            <Ionicons name={getReasonIcon(report.reason) as any} size={14} color="#F44336" />
            <Text style={styles.reasonText}>{report.reason}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(report.createdAt)}</Text>
        </View>

        <View style={styles.reportedItem}>
          <Text style={styles.reportedLabel}>Reported: </Text>
          <Text style={styles.reportedName}>{report.reportedName}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {report.description}
        </Text>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
              {report.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#7E9AFF',
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reporterEmail: {
    fontSize: 11,
    color: '#666',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardBody: {
    gap: 8,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportedTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportedTypeText: {
    fontSize: 11,
    color: '#666',
    textTransform: 'capitalize',
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reasonText: {
    fontSize: 11,
    color: '#F44336',
    textTransform: 'capitalize',
  },
  dateText: {
    flex: 1,
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
  },
  reportedItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportedLabel: {
    fontSize: 13,
    color: '#666',
  },
  reportedName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});