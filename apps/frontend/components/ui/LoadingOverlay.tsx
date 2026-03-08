import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: number;
  type?: 'spinner' | 'progress' | 'success' | 'error';
  onComplete?: () => void;
}

export const LoadingOverlay = ({ 
  visible, 
  message = 'Loading...', 
  progress,
  type = 'spinner'
}: LoadingOverlayProps) => {
  
  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      default: return null;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#dc2626';
      default: return '#7E9AFF';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {type === 'spinner' && (
            <>
              <ActivityIndicator size="large" color="#7E9AFF" />
              <Text style={styles.message}>{message}</Text>
            </>
          )}

          {type === 'progress' && progress !== undefined && (
            <>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.message}>{message}</Text>
            </>
          )}

          {(type === 'success' || type === 'error') && (
            <>
              <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
                <Ionicons name={getIcon() as any} size={48} color={getIconColor()} />
              </View>
              <Text style={styles.message}>{message}</Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export const SkeletonLoader = ({ width = '100%', height = 20, style }: any) => (
  <View style={[styles.skeleton, { width, height }, style]} />
);

export const FormSkeleton = () => (
  <View style={styles.formSkeleton}>
    <SkeletonLoader height={24} width="30%" style={styles.skeletonMargin} />
    <SkeletonLoader height={48} style={styles.skeletonMargin} />
    <SkeletonLoader height={24} width="30%" style={styles.skeletonMargin} />
    <SkeletonLoader height={48} style={styles.skeletonMargin} />
    <SkeletonLoader height={24} width="30%" style={styles.skeletonMargin} />
    <SkeletonLoader height={48} style={styles.skeletonMargin} />
    <SkeletonLoader height={56} style={[styles.skeletonMargin, { borderRadius: 28 }]} />
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7E9AFF',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7E9AFF',
    borderRadius: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeleton: {
    backgroundColor: '#E8EEFF',
    borderRadius: 4,
  },
  formSkeleton: {
    padding: 20,
  },
  skeletonMargin: {
    marginBottom: 16,
  },
});