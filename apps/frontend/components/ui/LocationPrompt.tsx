import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LocationPromptProps {
  onRequestPermission: () => void;
  onManualEntry: () => void;
  isLoading?: boolean;
  variant?: 'inline' | 'banner' | 'fullscreen';
}

export const LocationPrompt = ({
  onRequestPermission,
  onManualEntry,
  isLoading = false,
  variant = 'inline'
}: LocationPromptProps) => {
  
  if (variant === 'fullscreen') {
    return (
      <View style={styles.fullscreenContainer}>
        <View style={styles.iconLargeContainer}>
          <Ionicons name="location-outline" size={60} color="#7E9AFF" />
        </View>
        <Text style={styles.fullscreenTitle}>Location Access Needed</Text>
        <Text style={styles.fullscreenMessage}>
          To discover places near you, we need your location. You can also enter a city manually.
        </Text>
        <View style={styles.fullscreenActions}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onRequestPermission}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Allow Location</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={onManualEntry}
          >
            <Text style={styles.secondaryButtonText}>Enter City Manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (variant === 'banner') {
    return (
      <TouchableOpacity style={styles.bannerContainer} onPress={onRequestPermission}>
        <View style={styles.bannerIconContainer}>
          <Ionicons name="location" size={20} color="#7E9AFF" />
        </View>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Enable Location</Text>
          <Text style={styles.bannerSubtitle}>See places near you</Text>
        </View>
        <View style={styles.bannerActions}>
          <TouchableOpacity style={styles.bannerButton} onPress={onManualEntry}>
            <Text style={styles.bannerButtonText}>Enter City</Text>
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
      </TouchableOpacity>
    );
  }

  // inline variant
  return (
    <View style={styles.inlineContainer}>
      <View style={styles.inlineIconContainer}>
        <Ionicons name="location-outline" size={24} color="#7E9AFF" />
      </View>
      <Text style={styles.inlineTitle}>Location Needed</Text>
      <Text style={styles.inlineMessage}>
        Enable location to discover places nearby
      </Text>
      <View style={styles.inlineActions}>
        <TouchableOpacity
          style={[styles.inlineButton, styles.inlinePrimaryButton]}
          onPress={onRequestPermission}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.inlinePrimaryButtonText}>Allow</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.inlineButton, styles.inlineSecondaryButton]}
          onPress={onManualEntry}
        >
          <Text style={styles.inlineSecondaryButtonText}>Enter City</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Fullscreen variant
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8F9FA',
  },
  iconLargeContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  fullscreenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  fullscreenMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  fullscreenActions: {
    width: '100%',
    gap: 12,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#7E9AFF',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#7E9AFF',
  },
  secondaryButtonText: {
    color: '#7E9AFF',
    fontSize: 18,
    fontWeight: '600',
  },

  // Banner variant
  bannerContainer: {
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
  bannerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F3FF',
    borderRadius: 16,
  },
  bannerButtonText: {
    color: '#7E9AFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Inline variant
  inlineContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: '#DEE4FF',
    alignItems: 'center',
  },
  inlineIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  inlineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  inlineMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  inlineActions: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlinePrimaryButton: {
    backgroundColor: '#7E9AFF',
  },
  inlinePrimaryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inlineSecondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#7E9AFF',
  },
  inlineSecondaryButtonText: {
    color: '#7E9AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});