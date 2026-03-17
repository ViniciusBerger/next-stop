import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { deleteItemAsync } from 'expo-secure-store'; // Import the specific function
import { auth } from '@/src/config/firebase'; // Import your firebase auth instance
import { signOut } from 'firebase/auth'; // Import signOut function

interface MenuItem {
  label: string;
  path?: Href;
  isLogout?: boolean;
}

interface HomeMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

// Objects with names and paths
const MENU_OPTIONS: MenuItem[] = [
  { label: "My Events", path: "/myevents" as Href },
  { label: "Favorites", path: "/favorites" as Href },
  { label: "Wishlist", path: "/wishlist" as Href },
  { label: "My Reviews", path: "/myreviews" as Href },
  { label: "Badges", path: "/badges" as Href },
  { label: "Friends", path: "/friends" as Href },
  { label: "History", path: "/history" as Href },
  { label: "Send feedback/ Report an issue", path: "/feedback" as Href },
  { label: "Logout", isLogout: true }
];

export default function HomeMenu({ isVisible, onClose }: HomeMenuProps) {
  const router = useRouter();

  // Function to handle the full logout process
  const handleLogout = async () => {
    try {
      // 1. Sign out from Firebase
      await signOut(auth);
      
      // 2. Remove the token from local storage
      try {
        // For phones
        await deleteItemAsync("userToken");
      } catch (e) {
        // For web
        localStorage.removeItem("userToken");
      }
      
      // 3. Close the menu and go back to login
      onClose();
      router.replace("/login");
    } catch (error: any) {
      console.error("Logout Error:", error.message);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };


  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      
      <View style={styles.menuBox}>
        <ScrollView>
          {MENU_OPTIONS.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.item, 
                index === MENU_OPTIONS.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={() => {
                if (item.isLogout) {
                  handleLogout();
                } else if (item.path) { // Fixed: Guard against undefined paths
                  onClose();
                  router.push(item.path);
                } 
              }}>
              <Text style={[styles.itemText, item.isLogout && styles.logoutText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  backdrop: {
    flex: 1,
  },
  menuBox: {
    position: 'absolute',
    top: 100,
    left: '5%',
    width: '90%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 2,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  itemText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
  },
  // Added specific styles for the logout button
  logoutItem: {
    backgroundColor: '#fff', 
  },
  logoutText: {
    color: '#dc2626', // Red color for logout visibility
    fontWeight: 'bold',
  },
});