import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActivityFeedSkeletonProps {
  count?: number;
}

export const ActivityFeedSkeleton = ({ count = 3 }: ActivityFeedSkeletonProps) => {
  return (
    <View style={styles.container}>
      {/* Feed Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconPlaceholder} />
          <View style={styles.headerTextPlaceholder} />
        </View>
        <View style={styles.headerActionPlaceholder} />
      </View>

      {/* Feed Items */}
      {Array(count).fill(0).map((_, index) => (
        <View key={index} style={styles.feedCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.avatarPlaceholder} />
            <View style={styles.headerTextContainer}>
              <View style={styles.userNamePlaceholder} />
              <View style={styles.timePlaceholder} />
            </View>
            <View style={styles.menuPlaceholder} />
          </View>

          {/* Card Image/Content Area */}
          <View style={styles.imagePlaceholder}>
            <View style={styles.imageOverlay}>
              <View style={styles.locationBadgePlaceholder} />
            </View>
          </View>

          {/* Card Actions */}
          <View style={styles.actionsContainer}>
            <View style={styles.actionGroup}>
              <View style={styles.actionIconPlaceholder} />
              <View style={styles.actionIconPlaceholder} />
              <View style={styles.actionIconPlaceholder} />
            </View>
            <View style={styles.actionIconPlaceholder} />
          </View>

          {/* Card Content */}
          <View style={styles.contentContainer}>
            <View style={styles.titlePlaceholder} />
            <View style={styles.descriptionPlaceholder} />
            <View style={styles.descriptionPlaceholder} />
            <View style={styles.metaContainer}>
              <View style={styles.metaItemPlaceholder} />
              <View style={styles.metaItemPlaceholder} />
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsContainer}>
            <View style={styles.commentInputPlaceholder} />
            <View style={styles.commentItemPlaceholder}>
              <View style={styles.commentAvatarPlaceholder} />
              <View style={styles.commentContentPlaceholder} />
            </View>
          </View>
        </View>
      ))}

      {/* Loading More Indicator */}
      <View style={styles.loadingMoreContainer}>
        <View style={styles.loadingMorePlaceholder} />
      </View>
    </View>
  );
};

// Also create a simpler version for quick use
export const SimpleFeedSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <View style={styles.simpleContainer}>
      {Array(count).fill(0).map((_, index) => (
        <View key={index} style={styles.simpleCard}>
          <View style={styles.simpleHeader}>
            <View style={styles.simpleAvatar} />
            <View style={styles.simpleTextContainer}>
              <View style={styles.simpleTitle} />
              <View style={styles.simpleSubtitle} />
            </View>
          </View>
          <View style={styles.simpleImage} />
          <View style={styles.simpleActions}>
            <View style={styles.simpleActionIcon} />
            <View style={styles.simpleActionIcon} />
            <View style={styles.simpleActionIcon} />
          </View>
          <View style={styles.simpleContent}>
            <View style={styles.simpleLine} />
            <View style={styles.simpleLine} />
            <View style={styles.simpleShortLine} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DEE4FF',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E8EEFF',
  },
  headerTextPlaceholder: {
    width: 120,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#E8EEFF',
  },
  headerActionPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EEFF',
  },
  feedCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8EEFF',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    gap: 6,
  },
  userNamePlaceholder: {
    width: '60%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E8EEFF',
  },
  timePlaceholder: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E8EEFF',
  },
  menuPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8EEFF',
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#E8EEFF',
    position: 'relative',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  locationBadgePlaceholder: {
    width: 100,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  actionIconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8EEFF',
  },
  contentContainer: {
    padding: 16,
    gap: 8,
  },
  titlePlaceholder: {
    width: '70%',
    height: 20,
    borderRadius: 4,
    backgroundColor: '#E8EEFF',
  },
  descriptionPlaceholder: {
    width: '100%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E8EEFF',
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  metaItemPlaceholder: {
    width: 60,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E8EEFF',
  },
  commentsContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#DEE4FF',
    gap: 12,
  },
  commentInputPlaceholder: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  commentItemPlaceholder: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8EEFF',
  },
  commentContentPlaceholder: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E8EEFF',
  },
  loadingMoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMorePlaceholder: {
    width: 100,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8EEFF',
  },

  // Simple Skeleton Styles
  simpleContainer: {
    padding: 16,
  },
  simpleCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  simpleHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  simpleAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8EEFF',
    marginRight: 12,
  },
  simpleTextContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  simpleTitle: {
    width: '60%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E8EEFF',
  },
  simpleSubtitle: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E8EEFF',
  },
  simpleImage: {
    height: 160,
    backgroundColor: '#E8EEFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  simpleActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  simpleActionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8EEFF',
  },
  simpleContent: {
    gap: 8,
  },
  simpleLine: {
    height: 14,
    backgroundColor: '#E8EEFF',
    borderRadius: 4,
  },
  simpleShortLine: {
    width: '60%',
    height: 14,
    backgroundColor: '#E8EEFF',
    borderRadius: 4,
  },
});