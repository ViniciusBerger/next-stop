import React, { useState, useEffect } from "react";
import { auth } from "@/src/config/firebase";
import axios from "axios";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenLayout } from "@/components/screenLayout";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from "@/src/config/api";
import { getToken } from "@/src/utils/auth";

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

  // Future logic: This would hold an array of User IDs
  // const [invitedFriends, setInvitedFriends] = useState([]);

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
    // Android: selection closes the picker automatically
    // iOS: the picker usually stays open in a modal/inline
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      setHasPickedDate(true);
      setDate(selectedDate);
    }
  };

  const handleInviteFriends = () => {
    // Placeholder alert until the friends system is built
    Alert.alert("Friends List", "This will open your friends list once the feature is ready!");
  };

const handleCreate = async () => {
  // Validation
  if (!eventName.trim()) {
    Alert.alert("Missing Info", "Please enter an event name.");
    return;
  }
  if (!hasPickedDate) {
    Alert.alert("Missing Info", "Please select a date and time.");
    return;
  }
  if (!locationId) {
    Alert.alert("Missing Info", "No location selected. Please go back and select a place.");
    return;
  }
  if (description.trim().length < 10) {
  Alert.alert("Missing Info", "Description must be at least 10 characters.");
  return;
}

  try {
    const token = await getToken();
    const user = auth.currentUser;
    if (!user) { Alert.alert("Not Logged In", "You must be logged in."); return; }

    // Resolve Firebase UID → MongoDB _id
    const profileResponse = await axios.get(`${API_URL}/profile?firebaseUid=${user.uid}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Profile data:", profileResponse.data);
    const mongoUserId = profileResponse.data._id;

    const payload = {
      name: eventName.trim(),
      description: description.trim(),
      place: locationId,
      location: locationName.trim(), // ← text location field
      date: date.toISOString(),
      privacy: isPublic ? "Public Event" : "Private Event", // ← enum value
      host: mongoUserId, // ← MongoDB _id
    };

    const response = await axios.post(`${API_URL}/events`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 201) {
      Alert.alert("Success", "Event created!");
      router.replace("/home");
    }
  } catch (error: any) {
    console.error("Create event error:", JSON.stringify(error.response?.data, null, 2));
    Alert.alert("Error", "Failed to create event. Please try again.");
  }
};

  return (
    <ScreenLayout showBack={true}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Create Event</Text>

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
            onPress={() => setShowPicker(true)}
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

          {showPicker && (
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
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChange}
                minimumDate={new Date()}
              />
            )
          )}
        </View>

        {/* 3. Invite Friends Placeholder */}
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
              <Text style={styles.inviteText}>Select friends to invite...</Text>
            </View>
            <Ionicons name="add-circle" size={24} color="#45d5af" />
          </TouchableOpacity>
        </View>

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
    marginTop: -10 
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
    fontSize: 15 
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