import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface FeedItem {
  id: string;
  type: 'friend_review' | 'event' | 'visit' | 'favorite_review';
  actor: { _id: string; username: string; profilePicture: string | null };
  activityText: string;
  place: { _id: string; name: string; address: string; category: string };
  rating: number | null;
  reviewText: string | null;
  images: string[];
  likes: number | null;
  likedBy: string[];
  eventName: string | null;
  eventDate: string | null;
  eventId: string | null;
  attendeeCount: number | null;
  privacy: string | null;
  timestamp: string;
}

interface ActivityCardProps {
  item: FeedItem;
  currentUserId?: string | null;
  onLike?: (reviewId: string) => void;
  onEventPress?: (eventId: string) => void;
  onPlacePress?: (place: FeedItem['place']) => void;
}

// Relative time helper
function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// Star rendering (same pattern as reviewCard.tsx)
function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const name: any =
      i <= rating ? 'star' : i - 0.5 === rating ? 'star-half' : 'star-outline';
    stars.push(<Ionicons key={i} name={name} size={16} color="#FFD700" />);
  }
  return stars;
}

const BADGE_CONFIG: Record<FeedItem['type'], { label: string; color: string }> = {
  friend_review: { label: 'Review', color: '#7E9AFF' },
  event: { label: 'Event', color: '#8737e9' },
  visit: { label: 'Visit', color: '#4CAF50' },
  favorite_review: { label: 'New Review', color: '#FF9800' },
};

export function ActivityCard({
  item,
  currentUserId,
  onLike,
  onEventPress,
  onPlacePress,
}: ActivityCardProps) {
  const badge = BADGE_CONFIG[item.type];
  const isLiked = currentUserId
    ? (item.likedBy ?? []).some((u: any) => String(u?._id ?? u) === String(currentUserId))
    : false;
  const isReviewType = item.type === 'friend_review' || item.type === 'favorite_review';

  return (
    <View style={styles.card}>
      {/* Header: Avatar + Activity text + Time */}
      <View style={styles.header}>
        {item.actor.profilePicture ? (
          <Image source={{ uri: item.actor.profilePicture }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <View style={styles.headerText}>
          <Text style={styles.activityText} numberOfLines={2}>
            {item.activityText}
          </Text>
          <Text style={styles.timeText}>{timeAgo(item.timestamp)}</Text>
        </View>
      </View>

      {/* Type badge */}
      <View style={[styles.badge, { backgroundColor: badge.color + '20' }]}>
        <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        {item.type === 'favorite_review' && (
          <View style={styles.favoriteIndicator}>
            <Ionicons name="heart" size={12} color="#ff4d4d" />
            <Text style={styles.favoriteText}>In your favorites</Text>
          </View>
        )}
      </View>

      {/* Content area — varies by type */}
      {isReviewType && (
        <View style={styles.reviewContent}>
          {item.rating != null && (
            <View style={styles.starsRow}>{renderStars(item.rating)}</View>
          )}
          {item.reviewText ? (
            <Text style={styles.reviewText} numberOfLines={3}>
              {item.reviewText}
            </Text>
          ) : null}
          {item.images.length > 0 && (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.reviewImage}
              resizeMode="cover"
            />
          )}
          {/* Like row */}
          <View style={styles.likeRow}>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => onLike?.(item.id)}
              disabled={!onLike}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={18}
                color={isLiked ? '#ff4d4d' : '#999'}
              />
              <Text style={styles.likeCount}>{item.likes ?? 0} likes</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {item.type === 'event' && (
        <View style={styles.eventContent}>
          {item.eventName && (
            <Text style={styles.eventName}>{item.eventName}</Text>
          )}
          {item.eventDate && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color="#7E9AFF" />
              <Text style={styles.detailText}>
                {new Date(item.eventDate).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          )}
          {item.attendeeCount != null && (
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={14} color="#7E9AFF" />
              <Text style={styles.detailText}>
                {item.attendeeCount} attending
              </Text>
            </View>
          )}
          {item.eventId && onEventPress && (
            <TouchableOpacity
              style={styles.viewEventButton}
              onPress={() => onEventPress(item.eventId!)}
            >
              <Text style={styles.viewEventText}>View Event</Text>
              <Ionicons name="chevron-forward" size={14} color="#5962ff" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {item.type === 'visit' && (
        <View style={styles.visitContent}>
          <View style={styles.detailRow}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.detailText}>
              Attended {item.eventName || 'an event'}
              {item.eventDate &&
                ` on ${new Date(item.eventDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}`}
            </Text>
          </View>
        </View>
      )}

      {/* Footer: Place name, tappable */}
      <TouchableOpacity
        style={styles.footer}
        onPress={() => onPlacePress?.(item.place)}
        disabled={!onPlacePress}
      >
        <Ionicons name="location-outline" size={14} color="#5962ff" />
        <Text style={styles.placeName} numberOfLines={1}>
          {item.place.name}
        </Text>
        {item.place.address ? (
          <Text style={styles.placeAddress} numberOfLines={1}>
            {' '}
            · {item.place.address}
          </Text>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C4C4C4',
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  favoriteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  favoriteText: {
    fontSize: 11,
    color: '#ff4d4d',
    marginLeft: 3,
  },
  // Review content
  reviewContent: {
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  reviewText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewImage: {
    width: '70%',
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  // Event content
  eventContent: {
    marginBottom: 6,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  viewEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  viewEventText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5962ff',
    marginRight: 2,
  },
  // Visit content
  visitContent: {
    marginBottom: 6,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  placeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5962ff',
    marginLeft: 4,
  },
  placeAddress: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
});
