import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ReportStatus = 'pending' | 'completed';
export type ReportType = 'feedback' | 'issue';

export interface Report {
  _id: string;
  type: ReportType;
  title: string;
  description: string;
  reportedBy: { username: string; email: string };
  reportedItem?: { itemType: string; itemId: string };
  status: ReportStatus;
  createdAt: string;
  completedAt?: string;
}

interface ReportCardProps {
  report: Report;
  onComplete: () => void;
  onDelete: () => void;
}

const getStatusColor = (status: ReportStatus) => {
  return status === 'pending' ? '#FF9800' : '#4CAF50';
};

const getTypeColor = (type: ReportType) => {
  return type === 'issue' ? '#F44336' : '#7E9AFF';
};

const getTypeIcon = (type: ReportType): any => {
  return type === 'issue' ? 'warning-outline' : 'chatbubble-ellipses-outline';
};

const getItemTypeIcon = (itemType?: string): any => {
  switch (itemType?.toLowerCase()) {
    case 'user': return 'person-outline';
    case 'review': return 'chatbubble-outline';
    case 'place': return 'location-outline';
    case 'event': return 'calendar-outline';
    default: return 'help-circle-outline';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

export const ReportCard = ({ report, onComplete, onDelete }: ReportCardProps) => (
  <View style={styles.card}>
    {/* Header: reporter + type badge */}
    <View style={styles.cardHeader}>
      <View style={styles.reporterInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {report.reportedBy.username?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <View>
          <Text style={styles.reporterName}>{report.reportedBy.username}</Text>
          <Text style={styles.reporterEmail}>{report.reportedBy.email}</Text>
        </View>
      </View>
      <View style={[styles.typeBadge, { backgroundColor: getTypeColor(report.type) + '20' }]}>
        <Ionicons name={getTypeIcon(report.type)} size={12} color={getTypeColor(report.type)} />
        <Text style={[styles.typeText, { color: getTypeColor(report.type) }]}>
          {report.type.toUpperCase()}
        </Text>
      </View>
    </View>

    {/* Body */}
    <View style={styles.cardBody}>
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{report.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{report.description}</Text>

      <View style={styles.metaRow}>
        {report.reportedItem && (
          <View style={styles.itemTypeBadge}>
            <Ionicons name={getItemTypeIcon(report.reportedItem.itemType)} size={12} color="#666" />
            <Text style={styles.itemTypeText}>{report.reportedItem.itemType}</Text>
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
            {report.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(report.createdAt)}</Text>
      </View>
    </View>

    {/* Actions */}
    <View style={styles.actions}>
      {report.status === 'pending' && (
        <TouchableOpacity style={styles.completeBtn} onPress={onComplete} activeOpacity={0.8}>
          <Ionicons name="checkmark-circle-outline" size={15} color="#4CAF50" />
          <Text style={styles.completeBtnText}>Mark Complete</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.8}>
        <Ionicons name="trash-outline" size={15} color="#F44336" />
        <Text style={styles.deleteBtnText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

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
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DEE4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7E9AFF',
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reporterEmail: {
    fontSize: 11,
    color: '#888',
    marginTop: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    gap: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  itemTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  itemTypeText: {
    fontSize: 11,
    color: '#666',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  dateText: {
    flex: 1,
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  completeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4CAF5015',
  },
  completeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F4433615',
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F44336',
  },
});
