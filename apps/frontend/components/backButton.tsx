import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface BackButtonProps {
  color?: string; // Allow overriding the color (e.g., white on teal, black on white)
}

export function BackButton({ color = "white" }: BackButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity 
      onPress={() => router.back()} 
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
    padding: 10,
    marginLeft: 5,
    marginTop: 20,
    zIndex: 10,
    width: 44,
  },
  
});