// apps/frontend/components/ui/LocationBanner.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PermissionStatus } from '../../hooks/useGeolocation';

interface LocationBannerProps {
  permissionStatus: PermissionStatus;
  error?: { code: number; message: string; action?: string };
  onRequestPermission: () => Promise<void>;
  onUseManualLocation: () => void;
  onRetry?: () => void;
}

export default function LocationBanner({
  permissionStatus,
  error,
  onRequestPermission,
  onUseManualLocation,
  onRetry
}: LocationBannerProps) {
  
  const getBannerContent = () => {
    switch (permissionStatus) {
      case 'granted':
        return null; // No banner when granted
        
      case 'denied':
        return {
          title: 'Location Access Denied',
          description: 'You denied location access. Some features may be limited.',
          icon: 'location-off',
          iconColor: '#FF3B30',
          backgroundColor: '#FFE5E5',
          borderColor: '#FFD1D1',
          actions: [
            {
              text: 'Try Again',
              onPress: onRequestPermission,
              primary: true
            },
            {
              text: 'Enter City',
              onPress: onUseManualLocation,
              primary: false
            }
          ]
        };
        
      case 'blocked':
        return {
          title: 'Location Permission Required',
          description: 'Location access is permanently denied. Please enable it in Settings.',
          icon: 'settings',
          iconColor: '#FF9500',
          backgroundColor: '#FFF3CD',
          borderColor: '#FFEAAE',
          actions: [
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
              primary: true
            },
            {
              text: 'Use Manual',
              onPress: onUseManualLocation,
              primary: false
            }
          ]
        };
        
      case 'undetermined':
        return {
          title: 'Enable Location Services',
          description: 'Allow location access to discover nearby places and get accurate directions.',
          icon: 'location-outline',
          iconColor: '#007AFF',
          backgroundColor: '#E3F2FD',
          borderColor: '#BBDEFB',
          actions: [
            {
              text: 'Allow',
              onPress: onRequestPermission,
              primary: true
            },
            {
              text: 'Skip',
              onPress: onUseManualLocation,
              primary: false
            }
          ]
        };
        
      default:
        return null;
    }
  };

  // Handle specific error states
  if (error) {
    const errorContent = {
      title: 'Location Error',
      description: error.message,
      icon: 'warning',
      iconColor: '#FF3B30',
      backgroundColor: '#FFE5E5',
      borderColor: '#FFD1D1',
      actions: [
        ...(error.action === 'open_settings' ? [{
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
          primary: true
        }] : []),
        ...(error.action === 'retry' && onRetry ? [{
          text: 'Retry',
          onPress: onRetry,
          primary: true
        }] : []),
        {
          text: 'Enter City',
          onPress: onUseManualLocation,
          primary: error.action !== 'retry'
        }
      ]
    };
    
    return (
      <View style={[
        styles.banner, 
        { 
          backgroundColor: errorContent.backgroundColor,
          borderColor: errorContent.borderColor 
        }
      ]}>
        <View style={styles.bannerContent}>
          <Ionicons 
            name={errorContent.icon as any} 
            size={24} 
            color={errorContent.iconColor} 
          />
          <View style={styles.bannerText}>
            <Text style={styles.title}>{errorContent.title}</Text>
            <Text style={styles.description}>{errorContent.description}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          {errorContent.actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                action.primary ? styles.primaryAction : styles.secondaryAction
              ]}
              onPress={action.onPress}
            >
              <Text style={[
                styles.actionButtonText,
                action.primary ? styles.primaryActionText : styles.secondaryActionText
              ]}>
                {action.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  const content = getBannerContent();
  if (!content) return null;

  return (
    <View style={[
      styles.banner, 
      { 
        backgroundColor: content.backgroundColor,
        borderColor: content.borderColor 
      }
    ]}>
      <View style={styles.bannerContent}>
        <Ionicons 
          name={content.icon as any} 
          size={24} 
          color={content.iconColor} 
        />
        <View style={styles.bannerText}>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.description}>{content.description}</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        {content.actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.actionButton,
              action.primary ? styles.primaryAction : styles.secondaryAction
            ]}
            onPress={action.onPress}
          >
            <Text style={[
              styles.actionButtonText,
              action.primary ? styles.primaryActionText : styles.secondaryActionText
            ]}>
              {action.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bannerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryAction: {
    backgroundColor: '#007AFF',
  },
  secondaryAction: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryActionText: {
    color: 'white',
  },
  secondaryActionText: {
    color: '#007AFF',
  },
});