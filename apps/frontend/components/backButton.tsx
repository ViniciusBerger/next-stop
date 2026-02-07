import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface BackButtonProps {
  color?: string; // Allow overriding the color (e.g., white on teal, black on white)
  path? : string; // Optional path to navigate to instead of going back
}

export function BackButton({ color = "white", path }: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (path) {
      router.replace(path as any); // Navigate to the specified path
    } else {
      router.back(); // Go back to the previous screen
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={styles.button}
      activeOpacity={0.7}
      hitSlop={20}
    >
      <Ionicons name="arrow-back" size={28} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 5,
    marginLeft: 5,
    marginTop: 20,
    zIndex: 10,
    width: 44,
    height: 44,
  },
  
});