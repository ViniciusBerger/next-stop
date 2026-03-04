import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface DataLoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
}

export const DataLoadingState = ({ 
  message = 'Loading data...', 
  size = 'large' 
}: DataLoadingStateProps) => (
  <View style={styles.container}>
    <ActivityIndicator size={size} color="#7E9AFF" />
    <Text style={styles.message}>{message}</Text>
  </View>
);

export const DataProcessingState = ({ message = 'Processing...' }: { message?: string }) => (
  <View style={styles.overlay}>
    <View style={styles.card}>
      <ActivityIndicator size="large" color="#7E9AFF" />
      <Text style={styles.cardMessage}>{message}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardMessage: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});