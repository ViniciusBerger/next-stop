// apps/frontend/components/ui/PermissionModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onGrantPermission: () => Promise<void>;
  permissionType: 'location';
  title?: string;
  description?: string;
  isBlocked?: boolean;
}

export default function PermissionModal({
  visible,
  onClose,
  onGrantPermission,
  permissionType = 'location',
  isBlocked = false,
  title,
  description
}: PermissionModalProps) {
  
  const getPermissionContent = () => {
    switch (permissionType) {
      case 'location':
        return {
          title: title || 'Location Access Needed',
          description: description || 
            (isBlocked 
              ? 'Location permission is permanently denied. Please enable it in your device settings to use location-based features.'
              : 'We need access to your location to show nearby places, provide accurate directions, and personalize your experience.'
            ),
          icon: isBlocked ? 'settings-outline' : 'location-outline',
          iconColor: isBlocked ? '#FF9500' : '#007AFF',
          backgroundColor: isBlocked ? '#FFF3CD' : '#E3F2FD',
          buttonText: isBlocked ? 'Open Settings' : 'Allow Location Access'
        };
      default:
        return {
          title: 'Permission Needed',
          description: 'This feature requires additional permissions.',
          icon: 'warning-outline',
          iconColor: '#FF9500',
          backgroundColor: '#FFF3CD',
          buttonText: 'Continue'
        };
    }
  };

  const content = getPermissionContent();

  const handleAction = async () => {
    if (isBlocked) {
      // Open device settings
      Linking.openSettings();
    } else {
      // Request permission
      await onGrantPermission();
    }
    onClose();
  };

  const handleNotNow = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.iconContainer, { backgroundColor: content.backgroundColor }]}>
            <Ionicons name={content.icon as any} size={48} color={content.iconColor} />
          </View>
          
          <Text style={styles.title}>{content.title}</Text>
          
          <Text style={styles.description}>
            {content.description}
          </Text>
          
          {!isBlocked && (
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitRow}>
                <Ionicons name="compass" size={20} color="#007AFF" />
                <Text style={styles.benefitText}>Discover nearby places</Text>
              </View>
              <View style={styles.benefitRow}>
                <Ionicons name="navigate" size={20} color="#007AFF" />
                <Text style={styles.benefitText}>Get accurate directions</Text>
              </View>
              <View style={styles.benefitRow}>
                <Ionicons name="star" size={20} color="#007AFF" />
                <Text style={styles.benefitText}>Personalized recommendations</Text>
              </View>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            {!isBlocked && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleNotNow}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Not Now
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleAction}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                {content.buttonText}
              </Text>
              <Ionicons 
                name={isBlocked ? "open-outline" : "chevron-forward"} 
                size={20} 
                color="white" 
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
          
          {!isBlocked && (
            <Text style={styles.note}>
              You can change this later in Settings
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#000',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: 'white',
  },
  secondaryButtonText: {
    color: '#666',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});