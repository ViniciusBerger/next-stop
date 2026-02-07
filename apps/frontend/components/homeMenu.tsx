import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Href, useRouter } from 'expo-router';

interface MenuItem {
  label: string;
  path: Href;
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
  { label: "Send feedback/ Report an issue", path: "/feedback" as Href }
];

export default function HomeMenu({ isVisible, onClose }: HomeMenuProps) {
  const router = useRouter();

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
                onClose(); //Close menu
                router.push(item.path); //Navigate to page
              }}
            >
              <Text style={styles.itemText}>{item.label}</Text>
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
});