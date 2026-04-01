import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { confirmAction } from '@/src/utils/alert';
import { ScreenLayout } from '@/components/screenLayout';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/src/config/firebase';
import { API_URL } from '@/src/config/api';
import { getToken } from '@/src/utils/auth';

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
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [mongoUserId, setMongoUserId] = useState<string | null>(null);
  const [requestSentName, setRequestSentName] = useState<string | null>(null);

const loadFriends = async (userId: string) => {
  try {

    const res = await axios.get(
      `${API_URL}/friends?userId=${userId}`
    );

    console.log("Friends:", res.data);

    const formattedFriends = res.data.map((user: any) => ({

      id: user._id,

      name: user.username || "User",

      username: user.username ? `@${user.username}` : "",

      avatar:
        user.profile?.profilePicture ||
        `https://i.pravatar.cc/150?u=${user._id}`,

      mutualFriends: 0,

      isOnline: false

    }));

    setFriends(formattedFriends);

  } catch (err) {

    console.log("Friends error:", err);

  }
};

// Load pending requests
const loadRequests = async (userId: string) => {
  try {
    const res = await axios.get(
      `${API_URL}/friends/requests?userId=${userId}`
    );

    console.log("Requests:", res.data);

    if (res.data && Array.isArray(res.data)) {
      const backendRequests = res.data.map((req: any) => {
        const requestId = String(req._id);

        return {
          id: requestId,
          name: req.requester?.username || "User",
          username: req.requester?.username ? `@${req.requester.username}` : "",
          avatar:
            req.requester?.profile?.profilePicture ||
            `https://i.pravatar.cc/150?u=${requestId}`,
          mutualFriends: 0,
          mutualPlaces: 0
        };
      });

      setRequests(backendRequests);
    } else {
      setRequests([]);
    }
  } catch (error) {
    console.log("Requests load failed", error);
    setRequests([]);
  }
};

const loadSuggestions = async (userId: string) => {

try{

const res = await axios.get(
`${API_URL}/friends/suggestions?userId=${userId}`
);

console.log("Suggestions:",res.data);

if(res.data){

const backendSuggestions = res.data.map((user:any)=>({

id:user._id,

name:user.username || "User",

username:user.username ? `@${user.username}` : "",

avatar:user.profile?.profilePicture 
|| `https://i.pravatar.cc/150?u=${user._id}`,

mutualFriends:0,

mutualPlaces:0

}));

setSuggestions(backendSuggestions);

}

}catch(error){

console.log("Suggestions failed");

}

};


const loadOutgoingRequests = async (userId: string) => {
  try {
    const res = await axios.get(`${API_URL}/friends/outgoing?userId=${userId}`);
    if (res.data && Array.isArray(res.data)) {
      const formatted = res.data.map((req: any) => ({
        id: String(req._id),
        name: req.recipient?.username || "User",
        username: req.recipient?.username ? `@${req.recipient.username}` : "",
        avatar: req.recipient?.profile?.profilePicture || `https://i.pravatar.cc/150?u=${req._id}`
      }));
      setOutgoingRequests(formatted);
    } else {
      setOutgoingRequests([]);
    }
  } catch (error) {
    console.log("Outgoing requests failed", error);
    setOutgoingRequests([]);
  }
};


// Fetch MongoDB user ID from Firebase UID, then load all data
useEffect(() => {
  const init = async (uid: string) => {
    try {
      const token = await getToken();
      const profileRes = await axios.get(`${API_URL}/profile?firebaseUid=${uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const id = profileRes.data._id;
      setMongoUserId(id);
      loadFriends(id);
      loadRequests(id);
      loadOutgoingRequests(id);
      loadSuggestions(id);
    } catch (err) {
      console.log("Failed to get user profile:", err);
    }
  };

  const currentUser = auth.currentUser;
  if (currentUser) {
    init(currentUser.uid);
    return;
  }

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) init(user.uid);
  });

  return () => unsubscribe();
}, []);

const filteredFriends = searchQuery
  ? friends.filter(friend => 
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  : friends;

const handleAcceptRequest = async (id: string) => {

try{

await axios.post(
`${API_URL}/friends/respond`,
{
requestId: id,
status: "accepted"
}
);

// remove from UI immediately
setRequests(prev => prev.filter(r => r.id !== id));

// force fresh backend reload
const friendsRes = await axios.get(
`${API_URL}/friends?userId=${mongoUserId}`
);

if(friendsRes.data){

const backendFriends = friendsRes.data.map((user:any)=>({

id:user._id,

name:user.username || "Friend",

username:user.username ? `@${user.username}` : "",

avatar:user.profile?.profilePicture 
? user.profile.profilePicture
: `https://i.pravatar.cc/150?u=${user._id}`,

mutualFriends:0,

isOnline:false,

lastActive:"Recently"

}));

setFriends(backendFriends);

}

// reload requests after accept
if (mongoUserId) await loadRequests(mongoUserId);

// go to friends tab
setActiveTab('friends');

}catch(error){

console.log("Accept failed", error);

}

};

 const handleDeclineRequest = (id: string) => {
    confirmAction('Decline Request', 'Are you sure you want to decline this friend request?', async () => {
      try {
        await axios.post(`${API_URL}/friends/respond`, {
          requestId: id,
          status: "rejected"
        });
        if (mongoUserId) loadRequests(mongoUserId);
      } catch (error) {
        console.log("Decline failed", error);
      }
    });
  };

  const handleCancelRequest = (requestId: string) => {
    confirmAction('Cancel Request', 'Are you sure you want to cancel this friend request?', async () => {
      try {
        await axios.delete(`${API_URL}/friends/${requestId}`);
        setOutgoingRequests(prev => prev.filter(r => r.id !== requestId));
        if (mongoUserId) loadSuggestions(mongoUserId);
      } catch (error) {
        console.log("Cancel request failed", error);
      }
    });
  };

  const handleAddFriend = async (id: string) => {
  const suggestion = suggestions.find(s => s.id === id);
  try {
    await axios.post(`${API_URL}/friends`, {
      requester: mongoUserId,
      recipient: id
    });

    setSuggestions(prev => prev.filter(sug => sug.id !== id));

    setRequestSentName(suggestion?.name || "User");
    setTimeout(() => setRequestSentName(null), 3000);

    if (mongoUserId) loadOutgoingRequests(mongoUserId);
  } catch (error) {
    console.log("Friend request failed");
  }
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

  const OutgoingRequestCard = ({ item }: { item: any }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestCardContent}>
        <Image source={{ uri: item.avatar }} style={styles.requestAvatar} />
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{item.name}</Text>
          <Text style={styles.requestUsername}>{item.username}</Text>
          <View style={styles.requestMeta}>
            <View style={styles.pendingBadge}>
              <Ionicons name="time-outline" size={12} color="#F59E0B" />
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.actionButton, styles.cancelButton]}
        onPress={() => handleCancelRequest(item.id)}
      >
        <Ionicons name="close" size={18} color="#666" />
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
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
          <ScrollView contentContainerStyle={styles.listContent}>
            {requests.length === 0 && outgoingRequests.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="mail-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No friend requests</Text>
                <Text style={styles.emptyMessage}>
                  When someone sends you a friend request, it will appear here.
                </Text>
              </View>
            )}
            {requests.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Received</Text>
                  <Text style={styles.sectionCount}>{requests.length}</Text>
                </View>
                {requests.map(item => <RequestCard key={item.id} item={item} />)}
              </>
            )}
            {outgoingRequests.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Sent</Text>
                  <Text style={styles.sectionCount}>{outgoingRequests.length}</Text>
                </View>
                {outgoingRequests.map(item => <OutgoingRequestCard key={item.id} item={item} />)}
              </>
            )}
          </ScrollView>
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
            data={friends}
            renderItem={({ item }) => <FriendCard item={item} />}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <>
                <RequestsHeader />
                {requests.length > 0 && (
                  <FlatList
                    data={requests.slice(0, 2)}
                    renderItem={({ item }) => <RequestCard item={item} />}
                    keyExtractor={item => String(item.id)}
                    scrollEnabled={false}
                    contentContainerStyle={styles.subListContent}
                  />
                )}
                <SuggestionsHeader />
                {suggestions.length > 0 && (
                  <FlatList
                    data={suggestions.slice(0, 2)}
                    renderItem={({ item }) => <SuggestionCard item={item} />}
                    keyExtractor={item => String(item.id)}
                    scrollEnabled={false}
                    contentContainerStyle={styles.subListContent}
                  />
                )}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitleDark}>All Friends</Text>
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
            {(requests.length + outgoingRequests.length) > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{requests.length + outgoingRequests.length}</Text>
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

        {/* Request Sent Toast */}
        {requestSentName && (
          <View style={styles.toastBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.toastText}>Friend request sent to {requestSentName}!</Text>
          </View>
        )}

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
    marginTop: 0,
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
  sectionTitleDark: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    marginTop: 17,
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
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  pendingText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
    gap: 6,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  toastText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});