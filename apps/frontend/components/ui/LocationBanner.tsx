import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LocationBannerProps {
  onPress: () => void;
  type?: 'denied' | 'unavailable' | 'manual';
}

export const LocationBanner = ({ onPress, type = 'denied' }: LocationBannerProps) => {
  const getContent = () => {
    switch (type) {
      case 'denied':
        return {
          icon: 'location-off',
          title: 'Location Access Denied',
          message: 'Please enable location access or enter a city manually.',
          buttonText: 'Enter City',
          color: '#dc2626',
        };
      case 'unavailable':
        return {
          icon: 'warning',
          title: 'Location Unavailable',
          message: 'Unable to get your current location. Enter a city to continue.',
          buttonText: 'Enter City',
          color: '#FF9800',
        };
      case 'manual':
        return {
          icon: 'location',
          title: 'Using Manual Location',
          message: 'You are using manually entered location.',
          buttonText: 'Change City',
          color: '#7E9AFF',
        };
      default:
        return {
          icon: 'location-off',
          title: 'Location Needed',
          message: 'Enter a city to discover places nearby.',
          buttonText: 'Enter City',
          color: '#7E9AFF',
        };
    }
  };

  const content = getContent();

  return (
    <TouchableOpacity style={styles.banner} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconContainer, { backgroundColor: `${content.color}20` }]}>
        <Ionicons name={content.icon as any} size={24} color={content.color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.message}>{content.message}</Text>
      </View>
      <View style={[styles.buttonContainer, { borderColor: content.color }]}>
        <Text style={[styles.buttonText, { color: content.color }]}>{content.buttonText}</Text>
        <Ionicons name="chevron-forward" size={16} color={content.color} />
      </View>
    </TouchableOpacity>
  );
};

// Simpler version for inline use
export const SimpleLocationBanner = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.simpleBanner} onPress={onPress}>
    <Ionicons name="location-outline" size={20} color="#7E9AFF" />
    <Text style={styles.simpleBannerText}>Enter city manually</Text>
    <Ionicons name="chevron-forward" size={20} color="#999" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  simpleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    padding: 12,
    borderRadius: 25,
    marginHorizontal: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  simpleBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#7E9AFF',
    fontWeight: '500',
    marginLeft: 8,
  },
});