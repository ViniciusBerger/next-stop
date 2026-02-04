import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ScreenLayout } from "@/components/screenLayout";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateEventScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  
  const passedLocation = route.params?.selectedLocation;

  // Form State
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState(passedLocation?.name || "");
  const [isPublic, setIsPublic] = useState(true);

  // Future logic: This would hold an array of User IDs
//   const [invitedFriends, setInvitedFriends] = useState([]);

// Date State
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [hasPickedDate, setHasPickedDate] = useState(false);

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

  const handleCreate = () => {
    console.log("Publishing:", { 
      eventName, 
      description, 
      locationName, 
      privacy: isPublic ? 'Public' : 'Private' 
    });
  };

  return (
    <ScreenLayout showBack={true}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Create Event</Text>

        {/* 1. Privacy Toggle */}
        <View style={styles.inputGroup}>
          <Text style={styles.labelDark}>Privacy</Text>
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
          <Text style={styles.labelDark}>When</Text>
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
            <DateTimePicker
              value={date}
              mode="datetime" // Combines date and time selection
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChange}
              minimumDate={new Date()} // Prevent picking past dates
            />
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
          {passedLocation && (
            <Text style={styles.addressHint}>{passedLocation.address}</Text>
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
    marginLeft: 5
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