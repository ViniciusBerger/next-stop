import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ============= LOADING STATES =============

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}

export const LoadingSpinner = ({ size = 'large', color = '#007AFF', text }: LoadingSpinnerProps) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size={size} color={color} />
    {text && <Text style={styles.loadingText}>{text}</Text>}
  </View>
);

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton = ({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) => (
  <View style={[styles.skeleton, { width, height, borderRadius }, style]} />
);

export const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <Skeleton height={200} borderRadius={8} />
    <View style={styles.skeletonCardContent}>
      <Skeleton width="60%" height={24} />
      <Skeleton width="40%" height={16} style={styles.skeletonMargin} />
      <Skeleton width="80%" height={16} style={styles.skeletonMargin} />
    </View>
  </View>
);

export const SkeletonList = ({ count = 3 }) => (
  <View style={styles.skeletonList}>
    {Array(count).fill(0).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);

// ============= EMPTY STATES =============

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  buttonText?: string;
  onButtonPress?: () => void;
  illustration?: 'search' | 'data' | 'favorites' | 'notifications' | 'comments' | 'history';
}

export const EmptyState = ({ 
  icon = 'sad-outline', 
  title, 
  message, 
  buttonText, 
  onButtonPress,
  illustration 
}: EmptyStateProps) => {
  
  // Get illustration emoji based on type
  const getIllustration = () => {
    switch (illustration) {
      case 'search': return '🔍';
      case 'data': return '📊';
      case 'favorites': return '❤️';
      case 'notifications': return '🔔';
      case 'comments': return '💬';
      case 'history': return '🕒';
      default: return '🏝️';
    }
  };

  return (
    <View style={styles.emptyContainer}>
      {illustration ? (
        <Text style={styles.emptyIllustration}>{getIllustration()}</Text>
      ) : (
        <Ionicons name={icon} size={64} color="#ccc" />
      )}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {buttonText && onButtonPress && (
        <TouchableOpacity style={styles.emptyButton} onPress={onButtonPress}>
          <Text style={styles.emptyButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============= ERROR STATES =============

interface ErrorStateProps {
  error?: Error | string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  variant?: 'fullscreen' | 'inline' | 'toast';
}

export const ErrorState = ({ 
  error, 
  message, 
  onRetry, 
  onGoBack,
  variant = 'inline' 
}: ErrorStateProps) => {
  
  const errorMessage = typeof error === 'string' ? error : error?.message || message || 'An unexpected error occurred';
  
  if (variant === 'fullscreen') {
    return (
      <View style={styles.fullscreenError}>
        <Ionicons name="alert-circle" size={80} color="#F44336" />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        <View style={styles.errorActions}>
          {onRetry && (
            <TouchableOpacity style={[styles.errorButton, styles.retryButton]} onPress={onRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
          {onGoBack && (
            <TouchableOpacity style={[styles.errorButton, styles.backButton]} onPress={onGoBack}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={48} color="#F44336" />
      <Text style={styles.errorText}>{errorMessage}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryLink} onPress={onRetry}>
          <Text style={styles.retryLinkText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============= NETWORK STATES =============

interface OfflineStateProps {
  onRetry?: () => void;
}

export const OfflineState = ({ onRetry }: OfflineStateProps) => (
  <View style={styles.offlineContainer}>
    <Ionicons name="wifi-outline" size={64} color="#ccc" />
    <Text style={styles.offlineTitle}>No Internet Connection</Text>
    <Text style={styles.offlineMessage}>
      You appear to be offline. Please check your connection and try again.
    </Text>
    {onRetry && (
      <TouchableOpacity style={styles.offlineButton} onPress={onRetry}>
        <Text style={styles.offlineButtonText}>Retry</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ============= PERMISSION STATES =============

interface PermissionDeniedProps {
  permission: 'location' | 'camera' | 'notifications' | 'photos';
  onRequestPermission?: () => void;
  onOpenSettings?: () => void;
}

export const PermissionDenied = ({ 
  permission, 
  onRequestPermission, 
  onOpenSettings 
}: PermissionDeniedProps) => {
  
  const getPermissionDetails = () => {
    switch (permission) {
      case 'location':
        return {
          icon: 'location-outline',
          title: 'Location Access Needed',
          message: 'Enable location access to discover places near you and get personalized recommendations.'
        };
      case 'camera':
        return {
          icon: 'camera-outline',
          title: 'Camera Access Needed',
          message: 'Enable camera access to take photos and upload images.'
        };
      case 'notifications':
        return {
          icon: 'notifications-outline',
          title: 'Notifications Disabled',
          message: 'Enable notifications to stay updated with the latest activity.'
        };
      case 'photos':
        return {
          icon: 'images-outline',
          title: 'Photo Library Access Needed',
          message: 'Enable photo access to upload images from your library.'
        };
    }
  };

  const details = getPermissionDetails();

  return (
    <View style={styles.permissionContainer}>
      <Ionicons name={details.icon as any} size={64} color="#ccc" />
      <Text style={styles.permissionTitle}>{details.title}</Text>
      <Text style={styles.permissionMessage}>{details.message}</Text>
      <View style={styles.permissionActions}>
        {onRequestPermission && (
          <TouchableOpacity style={styles.permissionButton} onPress={onRequestPermission}>
            <Text style={styles.permissionButtonText}>Allow Access</Text>
          </TouchableOpacity>
        )}
        {onOpenSettings && (
          <TouchableOpacity style={styles.settingsButton} onPress={onOpenSettings}>
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ============= FORM VALIDATION =============

interface ValidationErrorProps {
  error?: string;
}

export const ValidationError = ({ error }: ValidationErrorProps) => {
  if (!error) return null;
  return (
    <View style={styles.validationError}>
      <Ionicons name="alert-circle" size={14} color="#F44336" />
      <Text style={styles.validationErrorText}>{error}</Text>
    </View>
  );
};

// ============= SUCCESS STATES =============

interface SuccessStateProps {
  message: string;
  onContinue?: () => void;
}

export const SuccessState = ({ message, onContinue }: SuccessStateProps) => (
  <View style={styles.successContainer}>
    <View style={styles.successIcon}>
      <Ionicons name="checkmark" size={32} color="#fff" />
    </View>
    <Text style={styles.successMessage}>{message}</Text>
    {onContinue && (
      <TouchableOpacity style={styles.successButton} onPress={onContinue}>
        <Text style={styles.successButtonText}>Continue</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ============= 404 / NOT FOUND =============

interface NotFoundProps {
  resource?: 'page' | 'place' | 'user' | 'review';
  onGoBack?: () => void;
  onSearch?: () => void;
}

export const NotFound = ({ resource = 'page', onGoBack, onSearch }: NotFoundProps) => {
  
  const getResourceDetails = () => {
    switch (resource) {
      case 'page':
        return {
          title: 'Page Not Found',
          message: 'The page you\'re looking for doesn\'t exist or has been moved.'
        };
      case 'place':
        return {
          title: 'Place Not Found',
          message: 'This place may have been removed or is no longer available.'
        };
      case 'user':
        return {
          title: 'User Not Found',
          message: 'This user profile doesn\'t exist or has been deactivated.'
        };
      case 'review':
        return {
          title: 'Review Not Found',
          message: 'This review may have been deleted or is no longer available.'
        };
    }
  };

  const details = getResourceDetails();

  return (
    <View style={styles.notFoundContainer}>
      <Text style={styles.notFoundNumber}>404</Text>
      <Text style={styles.notFoundTitle}>{details.title}</Text>
      <Text style={styles.notFoundMessage}>{details.message}</Text>
      <View style={styles.notFoundActions}>
        {onGoBack && (
          <TouchableOpacity style={styles.notFoundButton} onPress={onGoBack}>
            <Text style={styles.notFoundButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}
        {onSearch && (
          <TouchableOpacity style={[styles.notFoundButton, styles.notFoundButtonOutline]} onPress={onSearch}>
            <Text style={styles.notFoundButtonOutlineText}>Search Places</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ============= SEARCH NO RESULTS =============

interface NoResultsProps {
  query: string;
  onClearSearch?: () => void;
  onSuggestions?: () => void;
}

export const NoResults = ({ query, onClearSearch, onSuggestions }: NoResultsProps) => (
  <View style={styles.noResultsContainer}>
    <Ionicons name="search-outline" size={64} color="#ccc" />
    <Text style={styles.noResultsTitle}>No Results Found</Text>
    <Text style={styles.noResultsMessage}>
      We couldn't find any matches for "{query}". Try adjusting your search or filters.
    </Text>
    <View style={styles.noResultsActions}>
      {onClearSearch && (
        <TouchableOpacity style={styles.noResultsButton} onPress={onClearSearch}>
          <Text style={styles.noResultsButtonText}>Clear Search</Text>
        </TouchableOpacity>
      )}
      {onSuggestions && (
        <TouchableOpacity style={[styles.noResultsButton, styles.noResultsButtonOutline]} onPress={onSuggestions}>
          <Text style={styles.noResultsButtonOutlineText}>View Suggestions</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ============= STYLES =============

const styles = StyleSheet.create({
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  skeleton: {
    backgroundColor: '#E1E9EE',
  },
  skeletonCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skeletonCardContent: {
    padding: 16,
  },
  skeletonMargin: {
    marginTop: 8,
  },
  skeletonList: {
    padding: 16,
  },

  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIllustration: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Error states
  fullscreenError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  errorButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#f0f0f0',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  retryLink: {
    paddingVertical: 8,
  },
  retryLinkText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Network states
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
  offlineTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  offlineMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  offlineButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  offlineButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Permission states
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionActions: {
    gap: 12,
    width: '100%',
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },

  // Form validation
  validationError: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  validationErrorText: {
    fontSize: 12,
    color: '#F44336',
  },

  // Success states
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  successButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // 404 / Not Found
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  notFoundMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  notFoundActions: {
    flexDirection: 'row',
    gap: 12,
  },
  notFoundButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  notFoundButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  notFoundButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  notFoundButtonOutlineText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // No results
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  noResultsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  noResultsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  noResultsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  noResultsButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  noResultsButtonOutlineText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});