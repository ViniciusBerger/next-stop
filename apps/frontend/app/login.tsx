import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { showToast } from '../components/ui/Toast';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { ValidationError } from '../components/ui/StateComponents';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  
  const { isConnected, isInitialized } = useNetworkStatus();

  // Check network on mount
  useEffect(() => {
    if (isInitialized && !isConnected) {
      showToast('You are offline. Please check your connection.', 'warning', 5000);
    }
  }, [isConnected, isInitialized]);

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: validateField('email', email) }));
    } else if (field === 'password') {
      setErrors(prev => ({ ...prev, password: validateField('password', password) }));
    }
  };

  const validateForm = () => {
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    
    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });
    
    return !emailError && !passwordError;
  };

  const handleLogin = async () => {
    if (!isConnected) {
      showToast('No internet connection', 'error');
      return;
    }

    if (validateForm()) {
      setLoading(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate success
        showToast('Login successful!', 'success');
        
        // Navigate to home (you'll add this)
        // router.replace('/(tabs)');
        
      } catch (error) {
        showToast('Login failed. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      showToast('Please fix the errors', 'error');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
          
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input, 
                  errors.email && touched.email ? styles.inputError : null
                ]}
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (touched.email) {
                    setErrors(prev => ({ ...prev, email: validateField('email', text) }));
                  }
                }}
                onBlur={() => handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
              {errors.email && touched.email && (
                <ValidationError error={errors.email} />
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[
                  styles.input, 
                  errors.password && touched.password ? styles.inputError : null
                ]}
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (touched.password) {
                    setErrors(prev => ({ ...prev, password: validateField('password', text) }));
                  }
                }}
                onBlur={() => handleBlur('password')}
                secureTextEntry
                autoComplete="password"
                editable={!loading}
              />
              {errors.password && touched.password && (
                <ValidationError error={errors.password} />
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#FFE5E5',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});