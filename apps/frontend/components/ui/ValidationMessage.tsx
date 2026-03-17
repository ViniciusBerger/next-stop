import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ValidationType = 'error' | 'success' | 'warning' | 'info';

interface ValidationMessageProps {
  message: string;
  type?: ValidationType;
  showIcon?: boolean;
  animated?: boolean;
}

export const ValidationMessage = ({ 
  message, 
  type = 'error', 
  showIcon = true,
  animated = false 
}: ValidationMessageProps) => {
  
  const getColor = () => {
    switch (type) {
      case 'error': return '#dc2626';
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'info': return '#7E9AFF';
      default: return '#dc2626';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error': return 'alert-circle';
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'alert-circle';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error': return '#FEE2E2';
      case 'success': return '#E8F5E9';
      case 'warning': return '#FFF3E0';
      case 'info': return '#E8EEFF';
      default: return '#FEE2E2';
    }
  };

  const content = (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      {showIcon && (
        <Ionicons name={getIcon()} size={18} color={getColor()} style={styles.icon} />
      )}
      <Text style={[styles.message, { color: getColor() }]}>{message}</Text>
    </View>
  );

  if (animated) {
    return (
      <Animated.View style={[styles.animatedContainer]}>
        {content}
      </Animated.View>
    );
  }

  return content;
};

export const FieldValidation = ({ error, touched }: { error?: string; touched?: boolean }) => {
  if (!error || !touched) return null;
  
  return (
    <View style={styles.fieldContainer}>
      <Ionicons name="alert-circle" size={14} color="#dc2626" />
      <Text style={styles.fieldErrorText}>{error}</Text>
    </View>
  );
};

export const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const getStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  const strength = getStrength();
  
  const getStrengthColor = () => {
    if (strength < 25) return '#dc2626';
    if (strength < 50) return '#FF9800';
    if (strength < 75) return '#FFC107';
    return '#4CAF50';
  };

  const getStrengthLabel = () => {
    if (strength < 25) return 'Very Weak';
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBarContainer}>
        <View style={[styles.strengthBar, { width: `${strength}%`, backgroundColor: getStrengthColor() }]} />
      </View>
      <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
        {getStrengthLabel()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  animatedContainer: {
    width: '100%',
  },
  icon: {
    marginRight: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    gap: 4,
  },
  fieldErrorText: {
    fontSize: 12,
    color: '#dc2626',
  },
  strengthContainer: {
    marginTop: 4,
    marginBottom: 12,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
});