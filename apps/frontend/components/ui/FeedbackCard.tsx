import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FeedbackStatus = 'pending' | 'in-review' | 'resolved' | 'dismissed';
type FeedbackType = 'bug' | 'feature' | 'report' | 'general';

interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt?: string;
  attachments?: string[];
  rating?: number;
}

interface FeedbackCardProps {
  feedback: Feedback;
  onPress: () => void;
}

export const FeedbackCard = ({ feedback, onPress }: FeedbackCardProps) => {
  const getStatusColor = (status: FeedbackStatus) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in-review': return '#2196F3';
      case 'resolved': return '#4CAF50';
      case 'dismissed': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getTypeIcon = (type: FeedbackType) => {
    switch (type) {
      case 'bug': return { name: 'bug', color: '#F44336' };
      case 'feature': return { name: 'bulb', color: '#FFC107' };
      case 'report': return { name: 'flag', color: '#FF9800' };
      case 'general': return { name: 'chatbubble', color: '#2196F3' };
      default: return { name: 'help-circle', color: '#666' };
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

  const typeIcon = getTypeIcon(feedback.type);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: feedback.userAvatar || 'https://i.pravatar.cc/150?u=' + feedback.userId }} 
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>{feedback.userName}</Text>
            <Text style={styles.userEmail}>{feedback.userEmail}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(feedback.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(feedback.status) }]}>
            {feedback.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.typeRow}>
          <Ionicons name={typeIcon.name as any} size={16} color={typeIcon.color} />
          <Text style={[styles.typeText, { color: typeIcon.color }]}>{feedback.type}</Text>
          <Text style={styles.dateText}>{formatDate(feedback.createdAt)}</Text>
        </View>

        <Text style={styles.title}>{feedback.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{feedback.description}</Text>

        {feedback.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Rating: </Text>
            <Text style={styles.ratingValue}>{'⭐'.repeat(feedback.rating)}</Text>
          </View>
        )}

        {feedback.attachments && feedback.attachments.length > 0 && (
          <View style={styles.attachmentContainer}>
            <Ionicons name="attach" size={14} color="#666" />
            <Text style={styles.attachmentText}>{feedback.attachments.length} attachment(s)</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Ionicons name="chevron-forward" size={20} color="#999" />
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
  userInfo: {
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
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    gap: 8,
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    color: '#999',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 13,
    color: '#666',
  },
  ratingValue: {
    fontSize: 13,
    color: '#FFC107',
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attachmentText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
});