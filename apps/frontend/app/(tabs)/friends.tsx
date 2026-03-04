import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Dimensions
} from 'react-native';
import { ScreenLayout } from '@/components/screenLayout';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock data for friends
const MOCK_FRIENDS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    username: '@sarahj',
    avatar: 'https://i.pravatar.cc/150?u=1',
    mutualFriends: 12,
    isOnline: true,
    lastActive: 'Online',
  },
  {
    id: '2',
    name: 'Mike Ross',
    username: '@mikeross',
    avatar: 'https://i.pravatar.cc/150?u=2',
    mutualFriends: 8,
    isOnline: true,
    lastActive: 'Online',
  },
  {
    id: '3',
    name: 'Jessica Pearson',
    username: '@jpearson',
    avatar: 'https://i.pravatar.cc/150?u=3',
    mutualFriends: 5,
    isOnline: false,
    lastActive: '2h ago',
  },
  {
    id: '4',
    name: 'Harvey Specter',
    username: '@hspecter',
    avatar: 'https://i.pravatar.cc/150?u=4',
    mutualFriends: 15,
    isOnline: false,
    lastActive: '1d ago',
  },
  {
    id: '5',
    name: 'Rachel Zane',
    username: '@rzane',
    avatar: 'https://i.pravatar.cc/150?u=5',
    mutualFriends: 3,
    isOnline: true,
    lastActive: 'Online',
  },
  {
    id: '6',
    name: 'Louis Litt',
    username: '@llitt',
    avatar: 'https://i.pravatar.cc/150?u=6',
    mutualFriends: 7,
    isOnline: false,
    lastActive: '3h ago',
  },
];

// Mock data for friend requests
const MOCK_REQUESTS = [
  {
    id: 'r1',
    name: 'Donna Paulsen',
    username: '@dpaulsend',
    avatar: 'https://i.pravatar.cc/150?u=7',
    mutualFriends: 4,
    mutualPlaces: 3,
  },
  {
    id: 'r2',
    name: 'Robert Zane',
    username: '@rzane',
    avatar: 'https://i.pravatar.cc/150?u=8',
    mutualFriends: 2,
    mutualPlaces: 1,
  },
];

// Mock data for suggestions
const MOCK_SUGGESTIONS = [
  {
    id: 's1',
    name: 'Katrina Bennett',
    username: '@kbennett',
    avatar: 'https://i.pravatar.cc/150?u=9',
    mutualFriends: 6,
    mutualPlaces: 4,
  },
  {
    id: 's2',
    name: 'Alex Williams',
    username: '@awilliams',
    avatar: 'https://i.pravatar.cc/150?u=10',
    mutualFriends: 3,
    mutualPlaces: 2,
  },
];

export default function FriendsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'suggestions'
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState(MOCK_FRIENDS);
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [suggestions, setSuggestions] = useState(MOCK_SUGGESTIONS);

  const filteredFriends = searchQuery
    ? friends.filter(friend => 
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : friends;

  const handleAcceptRequest = (id: string) => {
    // Handle accept friend request
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleDeclineRequest = (id: string) => {
    // Handle decline friend request
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleAddFriend = (id: string) => {
    // Handle send friend request
    setSuggestions(prev => prev.filter(sug => sug.id !== id));
  };

  const FriendCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.friendCard} activeOpacity={0.7}>
      <View style={styles.friendCardContent}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          {item.isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendUsername}>{item.username}</Text>
          <Text style={styles.mutualText}>{item.mutualFriends} mutual friends</Text>
        </View>
        <View style={styles.friendMeta}>
          <Text style={[styles.activeText, item.isOnline && styles.onlineText]}>
            {item.lastActive}
          </Text>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const RequestCard = ({ item }: { item: any }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestCardContent}>
        <Image source={{ uri: item.avatar }} style={styles.requestAvatar} />
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{item.name}</Text>
          <Text style={styles.requestUsername}>{item.username}</Text>
          <View style={styles.requestMeta}>
            <View style={styles.requestMetaItem}>
              <Ionicons name="people-outline" size={12} color="#666" />
              <Text style={styles.requestMetaText}>{item.mutualFriends} mutual</Text>
            </View>
            <View style={styles.requestMetaItem}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.requestMetaText}>{item.mutualPlaces} places</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleDeclineRequest(item.id)}
        >
          <Ionicons name="close" size={18} color="#dc2626" />
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const SuggestionCard = ({ item }: { item: any }) => (
    <View style={styles.suggestionCard}>
      <View style={styles.suggestionCardContent}>
        <Image source={{ uri: item.avatar }} style={styles.suggestionAvatar} />
        <View style={styles.suggestionInfo}>
          <Text style={styles.suggestionName}>{item.name}</Text>
          <Text style={styles.suggestionUsername}>{item.username}</Text>
          <View style={styles.suggestionMeta}>
            <View style={styles.suggestionMetaItem}>
              <Ionicons name="people-outline" size={12} color="#666" />
              <Text style={styles.suggestionMetaText}>{item.mutualFriends} mutual</Text>
            </View>
            <View style={styles.suggestionMetaItem}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.suggestionMetaText}>{item.mutualPlaces} places</Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => handleAddFriend(item.id)}
      >
        <Ionicons name="person-add-outline" size={18} color="#7E9AFF" />
        <Text style={styles.addButtonText}>Add Friend</Text>
      </TouchableOpacity>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="people-outline" size={64} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>No friends yet</Text>
      <Text style={styles.emptyMessage}>
        Connect with other foodies to see their reviews and share your experiences!
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => setActiveTab('suggestions')}
      >
        <Text style={styles.emptyButtonText}>Find Friends</Text>
      </TouchableOpacity>
    </View>
  );

  const RequestsHeader = () => (
    requests.length > 0 ? (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Friend Requests</Text>
        <Text style={styles.sectionCount}>{requests.length}</Text>
      </View>
    ) : null
  );

  const SuggestionsHeader = () => (
    suggestions.length > 0 ? (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>People You May Know</Text>
      </View>
    ) : null
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'requests':
        return (
          <FlatList
            data={requests}
            renderItem={({ item }) => <RequestCard item={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="mail-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No friend requests</Text>
                <Text style={styles.emptyMessage}>
                  When someone sends you a friend request, it will appear here.
                </Text>
              </View>
            }
          />
        );
      
      case 'suggestions':
        return (
          <FlatList
            data={suggestions}
            renderItem={({ item }) => <SuggestionCard item={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No suggestions</Text>
                <Text style={styles.emptyMessage}>
                  We'll show you people you might know based on your activity.
                </Text>
              </View>
            }
          />
        );
      
      default:
        return (
          <FlatList
            data={filteredFriends}
            renderItem={({ item }) => <FriendCard item={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <>
                <RequestsHeader />
                {requests.length > 0 && (
                  <FlatList
                    data={requests.slice(0, 2)}
                    renderItem={({ item }) => <RequestCard item={item} />}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    contentContainerStyle={styles.subListContent}
                  />
                )}
                <SuggestionsHeader />
                {suggestions.length > 0 && (
                  <FlatList
                    data={suggestions.slice(0, 2)}
                    renderItem={({ item }) => <SuggestionCard item={item} />}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    contentContainerStyle={styles.subListContent}
                  />
                )}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>All Friends</Text>
                  <Text style={styles.sectionCount}>{friends.length}</Text>
                </View>
              </>
            }
            ListEmptyComponent={<EmptyState />}
          />
        );
    }
  };

  return (
    <ScreenLayout showBack={true}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Friends</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#7E9AFF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
              Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
              Requests
            </Text>
            {requests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{requests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'suggestions' && styles.activeTab]}
            onPress={() => setActiveTab('suggestions')}
          >
            <Text style={[styles.tabText, activeTab === 'suggestions' && styles.activeTabText]}>
              Suggestions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {renderContent()}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 48,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#7E9AFF',
    borderColor: '#7E9AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFF',
  },
  badge: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  subListContent: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  friendCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  friendCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#7E9AFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  mutualText: {
    fontSize: 12,
    color: '#999',
  },
  friendMeta: {
    alignItems: 'flex-end',
  },
  activeText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  onlineText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  menuButton: {
    padding: 4,
  },
  requestCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  requestCardContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  requestUsername: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  requestMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  requestMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestMetaText: {
    fontSize: 11,
    color: '#666',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  acceptButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  declineButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  suggestionCardContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  suggestionAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#45d5af',
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  suggestionUsername: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  suggestionMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  suggestionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionMetaText: {
    fontSize: 11,
    color: '#666',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F0F3FF',
    gap: 6,
  },
  addButtonText: {
    color: '#7E9AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#7E9AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});