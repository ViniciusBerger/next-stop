import React, { useState, useEffect } from "react";
import { auth } from "@/src/config/firebase";
import axios from "axios";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Modal, Image, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenLayout } from "@/components/screenLayout";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { API_URL } from "@/src/config/api";
import { getToken } from "@/src/utils/auth";
import { showAlert } from "@/src/utils/alert";

export default function CreateEventScreen() {
  const router = useRouter();
  const { placeId, placeName, placeAddress } = useLocalSearchParams<{
    placeId: string;
    placeName: string;
    placeAddress: string;
  }>();
  

  // Form State
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // Friends / Invite State
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<any[]>([]);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [mongoUserId, setMongoUserId] = useState<string | null>(null);

  // Date State
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [hasPickedDate, setHasPickedDate] = useState(false);

  // ✅ Fix - normalize the param and use useEffect to sync it
  const rawPlaceName = Array.isArray(placeName) ? placeName[0] : placeName;
  const rawPlaceAddress = Array.isArray(placeAddress) ? placeAddress[0] : placeAddress;
  const rawPlaceId = Array.isArray(placeId) ? placeId[0] : placeId;

  const [locationName, setLocationName] = useState(rawPlaceName || "");
  const [locationId] = useState(rawPlaceId || null);

  useEffect(() => {
    if (rawPlaceName) setLocationName(rawPlaceName);
  }, [rawPlaceName]);

  // Load friends list for invite modal
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await getToken();
        const profileRes = await axios.get(`${API_URL}/profile?firebaseUid=${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const id = profileRes.data._id;
        setMongoUserId(id);

        const friendsRes = await axios.get(`${API_URL}/friends?userId=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const formatted = friendsRes.data.map((f: any) => ({
          id: f._id,
          name: f.username || "User",
          username: f.username ? `@${f.username}` : "",
          avatar: f.profile?.profilePicture || `https://i.pravatar.cc/150?u=${f._id}`,
        }));
        setFriends(formatted);
      } catch (err) {
        console.error("Failed to load friends:", err);
      }
    };
    loadFriends();
  }, []);

  const toggleFriendSelection = (friend: any) => {
    setSelectedFriends((prev) => {
      const isSelected = prev.some((f) => f.id === friend.id);
      if (isSelected) return prev.filter((f) => f.id !== friend.id);
      return [...prev, friend];
    });
  };

  const handleInviteFriends = () => {
    setShowFriendsModal(true);
  };

  // Helper to format the date for the UI
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const onChange = (event: any, selectedDate?: Date) => {
    // iOS-only path — inline picker stays open, user taps outside to dismiss
    if (selectedDate) {
      setHasPickedDate(true);
      setDate(selectedDate);
    }
  };

  const openAndroidPicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      mode: 'date',
      minimumDate: new Date(),
      onChange: (dateEvent, pickedDate) => {
        if (dateEvent.type !== 'set' || !pickedDate) return;
        DateTimePickerAndroid.open({
          value: pickedDate,
          mode: 'time',
          is24Hour: false,
          onChange: (timeEvent, pickedTime) => {
            if (timeEvent.type !== 'set' || !pickedTime) return;
            const merged = new Date(pickedDate);
            merged.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
            setDate(merged);
            setHasPickedDate(true);
          },
        });
      },
    });
  };

  const handleDatePress = () => {
    if (Platform.OS === 'android') {
      openAndroidPicker();
    } else {
      setShowPicker(true);
    }
  };

const handleCreate = async () => {
  // Validation
  if (!eventName.trim()) {
    showAlert("Missing Info", "Please enter an event name.");
    return;
  }
  if (!hasPickedDate) {
    showAlert("Missing Info", "Please select a date and time.");
    return;
  }
  if (!locationId) {
    showAlert("Missing Info", "No location selected. Please go back and select a place.");
    return;
  }
  if (description.trim().length < 10) {
  showAlert("Missing Info", "Description must be at least 10 characters.");
  return;
}

  try {
    const token = await getToken();
    const user = auth.currentUser;
    if (!user) { showAlert("Not Logged In", "You must be logged in."); return; }

    // Use already-fetched mongoUserId, or resolve it now
    let hostId = mongoUserId;
    if (!hostId) {
      const profileResponse = await axios.get(`${API_URL}/profile?firebaseUid=${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      hostId = profileResponse.data._id;
    }

    const payload: any = {
      name: eventName.trim(),
      description: description.trim(),
      place: locationId,
      location: locationName.trim(),
      date: date.toISOString(),
      privacy: isPublic ? "Public Event" : "Private Event",
      host: hostId,
    };

    if (selectedFriends.length > 0) {
      payload.invitedFriends = selectedFriends.map((f) => f.id);
    }

    const response = await axios.post(`${API_URL}/events`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 201) {
      showAlert("Success", "Event created!");
      router.replace("/home");
    }
  } catch (error: any) {
    console.error("Create event error:", JSON.stringify(error.response?.data, null, 2));
    showAlert("Error", "Failed to create event. Please try again.");
  }
};

  return (
    <ScreenLayout showBack={true} title="Create Event">
      <ScrollView contentContainerStyle={styles.container}>

        {/* 1. Privacy Toggle */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Privacy</Text>
          <View style={styles.privacyContainer}>
            <TouchableOpacity 
              style={[styles.privacyOption, isPublic && styles.activeOption]} 
              onPress={() => setIsPublic(true)}
            >
              <Ionicons name="earth" size={20} color={isPublic ? "#FFF" : "#5962ff"} />
              <Text style={[styles.privacyText, isPublic && styles.activePrivacyText]}>Public</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.privacyOption, !isPublic && styles.activeOption]} 
              onPress={() => setIsPublic(false)}
            >
              <Ionicons name="lock-closed" size={20} color={!isPublic ? "#FFF" : "#5962ff"} />
              <Text style={[styles.privacyText, !isPublic && styles.activePrivacyText]}>Private</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.privacyHint}>
            {isPublic
              ? "Anyone can see and join this event."

              : "Only people with the invite link can see this."}
          </Text>
        </View>

        {/* 2. Date & Time Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>When</Text>
          <TouchableOpacity
            style={styles.datePickerBar}
            onPress={handleDatePress}
            activeOpacity={0.7}
          >
            <View style={styles.dateInfo}>
              <View style={styles.iconCircleSmall}>
                <Ionicons name="calendar" size={20} color="#5962ff" />
              </View>
              <Text style={[styles.dateText, hasPickedDate && { color: '#333' }]}>
                {hasPickedDate ? formatDisplayDate(date) : "Select Date & Time"}
              </Text>
            </View>
            <Ionicons name="time-outline" size={24} color="#5962ff" />
          </TouchableOpacity>

          {showPicker && Platform.OS !== 'android' && (
            Platform.OS === 'web' ? (
              <input
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => {
                  if (e.target.value) {
                    setHasPickedDate(true);
                    setDate(new Date(e.target.value));
                    setShowPicker(false);
                  }
                }}
                style={{
                  width: '100%', padding: 12, fontSize: 16,
                  borderRadius: 12, border: '1px solid #ddd',
                  marginTop: 8
                }}
              />
            ) : (
              <DateTimePicker
                value={date}
                mode="datetime"
                display="spinner"
                onChange={onChange}
                minimumDate={new Date()}
              />
            )
          )}
        </View>

        {/* 3. Invite Friends */}
        <View style={styles.inputGroup}>
          <Text style={styles.labelDark}>Invite</Text>
          <TouchableOpacity
            style={styles.invitePlaceholder}
            onPress={handleInviteFriends}
            activeOpacity={0.7}
          >
            <View style={styles.inviteInfo}>
              <View style={styles.iconCircleSmall}>
                <Ionicons name="people" size={20} color="#5962ff" />
              </View>
              <Text style={styles.inviteText}>
                {selectedFriends.length > 0
                  ? `${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''} selected`
                  : "Select friends to invite..."}
              </Text>
            </View>
            <Ionicons name="add-circle" size={24} color="#45d5af" />
          </TouchableOpacity>

          {/* Selected friends chips */}
          {selectedFriends.length > 0 && (
            <View style={styles.selectedChipsContainer}>
              {selectedFriends.map((friend) => (
                <View key={friend.id} style={styles.selectedChip}>
                  <Image source={{ uri: friend.avatar }} style={styles.chipAvatar} />
                  <Text style={styles.chipName}>{friend.name}</Text>
                  <TouchableOpacity onPress={() => toggleFriendSelection(friend)}>
                    <Ionicons name="close-circle" size={18} color="#999" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Friends Selection Modal */}
        <Modal
          visible={showFriendsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFriendsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Invite Friends</Text>
                <TouchableOpacity onPress={() => setShowFriendsModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {friends.length === 0 ? (
                <View style={styles.emptyFriends}>
                  <Ionicons name="people-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyFriendsText}>No friends yet</Text>
                  <Text style={styles.emptyFriendsSubtext}>Add friends to invite them to events</Text>
                </View>
              ) : (
                <FlatList
                  data={friends}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const isSelected = selectedFriends.some((f) => f.id === item.id);
                    return (
                      <TouchableOpacity
                        style={[styles.friendRow, isSelected && styles.friendRowSelected]}
                        onPress={() => toggleFriendSelection(item)}
                        activeOpacity={0.7}
                      >
                        <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
                        <View style={styles.friendInfo}>
                          <Text style={styles.friendName}>{item.name}</Text>
                          <Text style={styles.friendUsername}>{item.username}</Text>
                        </View>
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                          {isSelected && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  contentContainerStyle={styles.friendsList}
                />
              )}

              <TouchableOpacity
                style={styles.modalDoneButton}
                onPress={() => setShowFriendsModal(false)}
              >
                <Text style={styles.modalDoneText}>
                  Done{selectedFriends.length > 0 ? ` (${selectedFriends.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 4. Event Details */}
        <View style={styles.inputGroup}>
          <Text style={styles.labelDark}>What's the plan?</Text>
          <TextInput
            style={styles.input}
            placeholder="Event Name"
            placeholderTextColor="#999"
            value={eventName}
            onChangeText={setEventName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.labelDark}>Location</Text>
          <View style={styles.locationInputWrapper}>
            <Ionicons name="location" size={20} color="#5962ff" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { paddingLeft: 45 }]}
              placeholder="Location Name"
              placeholderTextColor="#999"
              value={locationName}
              onChangeText={setLocationName}
            />
          </View>
          {rawPlaceAddress && (
            <Text style={styles.addressHint}>{rawPlaceAddress}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.labelDark}>Details</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell everyone what's happening..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Create Event</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" style={{marginLeft: 10}} />
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
},
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    textAlign: 'center', 
    marginBottom: 30, 
    marginTop: 0 
},
  inputGroup: { 
    marginBottom: 25
},
  label: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 10, 
    marginLeft: 5
},
  labelDark: { 
    color: '#000000', 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 10, 
    marginLeft: 5,
    marginTop: 5
},
  input: {
    backgroundColor: '#FFF',
    height: 60,
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  locationInputWrapper: { 
    position: 'relative', 
    justifyContent: 'center' 
},
  inputIcon: { 
    position: 'absolute', 
    left: 15, 
    zIndex: 1 
},
  addressHint: { 
    color: '#ffffffb3', 
    fontSize: 12, 
    marginTop: 8, 
    marginLeft: 5 
},
  textArea: { 
    height: 120, 
    paddingTop: 15 
},
  createButton: {
    backgroundColor: '#45d5af',
    height: 70,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  createButtonText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
},
privacyContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 5,
  },
  privacyOption: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeOption: {
    backgroundColor: '#5962ff',
  },
  privacyText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#5962ff',
  },
  activePrivacyText: {
    color: '#FFF',
  },
  privacyHint: {
    color: '#ffffffb3',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 5,
    fontStyle: 'italic',
  },
  invitePlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 15,
  },
  inviteInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
},
  iconCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inviteText: {
    color: '#999',
    fontSize: 15,
    flex: 1,
  },
  selectedChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 10,
    gap: 6,
  },
  chipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  chipName: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  friendsList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  friendRowSelected: {
    backgroundColor: '#F0F3FF',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderBottomColor: 'transparent',
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#DEE4FF',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  friendUsername: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#5962ff',
    borderColor: '#5962ff',
  },
  modalDoneButton: {
    backgroundColor: '#5962ff',
    marginHorizontal: 20,
    marginTop: 15,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDoneText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyFriends: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyFriendsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyFriendsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
datePickerBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#FFF', 
    padding: 12, 
    borderRadius: 15, 
    height: 60 
},
  dateInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
},
  dateText: { 
    color: '#999', 
    fontSize: 15, 
    fontWeight: '500' 
},
});