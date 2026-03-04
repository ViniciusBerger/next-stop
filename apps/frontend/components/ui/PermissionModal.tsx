import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface PermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onAllow: () => void;
  onSettings?: () => void;
  type?: 'location' | 'camera' | 'notifications';
  isBlocked?: boolean;
}

export const PermissionModal = ({
  visible,
  onClose,
  onAllow,
  onSettings,
  type = 'location',
  isBlocked = false
}: PermissionModalProps) => {
  
  const getContent = () => {
    switch (type) {
      case 'location':
        return {
          icon: 'location',
          title: isBlocked ? 'Location Access Blocked' : 'Location Access Needed',
          message: isBlocked
            ? 'Location permission is permanently blocked. Please enable it in settings to discover places near you.'
            : 'Allow location access to discover places nearby and get personalized recommendations.',
          allowText: 'Allow Location',
        };
      case 'camera':
        return {
          icon: 'camera',
          title: isBlocked ? 'Camera Access Blocked' : 'Camera Access Needed',
          message: isBlocked
            ? 'Camera permission is permanently blocked. Please enable it in settings to take photos.'
            : 'Allow camera access to take photos for your reviews.',
          allowText: 'Allow Camera',
        };
      case 'notifications':
        return {
          icon: 'notifications',
          title: isBlocked ? 'Notifications Blocked' : 'Notifications Needed',
          message: isBlocked
            ? 'Notifications are permanently blocked. Please enable them in settings to stay updated.'
            : 'Allow notifications to get updates about events and friend activity.',
          allowText: 'Allow Notifications',
        };
      default:
        return {
          icon: 'location',
          title: 'Permission Needed',
          message: 'This feature requires permission to continue.',
          allowText: 'Allow',
        };
    }
  };

  const content = getContent();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Icon Circle */}
          <View style={[styles.iconCircle, { backgroundColor: isBlocked ? '#FEE2E2' : '#F0F3FF' }]}>
            <Ionicons
              name={content.icon as any}
              size={40}
              color={isBlocked ? '#dc2626' : '#7E9AFF'}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, isBlocked && styles.blockedTitle]}>
            {content.title}
          </Text>

          {/* Message */}
          <Text style={styles.message}>
            {content.message}
          </Text>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {isBlocked ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.settingsButton]}
                  onPress={onSettings}
                >
                  <Text style={styles.settingsButtonText}>Open Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Not Now</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.allowButton]}
                  onPress={onAllow}
                >
                  <Text style={styles.allowButtonText}>{content.allowText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Optional: Learn more link */}
          {!isBlocked && (
            <TouchableOpacity style={styles.learnMore}>
              <Text style={styles.learnMoreText}>Why is this needed?</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  blockedTitle: {
    color: '#dc2626',
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  actionsContainer: {
    width: '100%',
    gap: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allowButton: {
    backgroundColor: '#7E9AFF',
  },
  allowButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: '#7E9AFF',
  },
  settingsButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  learnMore: {
    marginTop: 16,
  },
  learnMoreText: {
    color: '#7E9AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});