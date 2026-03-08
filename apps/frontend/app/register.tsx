import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from "react-native";
import HeaderBackground from "@/src/svgs/HeaderBackground";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from "@/components/backButton";
import { auth } from "@/src/config/firebase";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import axios from "axios";
import { 
  ValidationMessage, 
  FieldValidation, 
  PasswordStrengthIndicator 
} from "@/components/ui/ValidationMessage";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { showToast } from "@/components/ui/Toast";

const { width, height } = Dimensions.get('window');

// Validation Regex Patterns and Reserved Words
const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,20}$/;
const RESERVED_WORDS = ['admin', 'support', 'owner', 'official', 'root'];

export default function RegisterScreen() {
  const router = useRouter();
  const [screenDimensions, setScreenDimensions] = useState({ width, height });

  // Listen for orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions({ width: window.width, height: window.height });
    });
    return () => subscription?.remove();
  }, []);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  // Field-specific errors
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // General error message
  const [generalError, setGeneralError] = useState("");

  // Success state for animations
  const [showSuccess, setShowSuccess] = useState(false);

  // Username availability check with debounce
  useEffect(() => {
    if (!touched.name || name.length < 3) return;

    const checkUsername = async () => {
      try {
        const isTaken = RESERVED_WORDS.includes(name.toLowerCase());

        if (isTaken) {
          setFieldErrors(prev => ({ ...prev, name: "This username is already taken" }));
        } else {
          setFieldErrors(prev => ({ ...prev, name: "" }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [name, touched.name]);

  // Validation functions
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        if (value.length > 20) return "Username must be less than 20 characters";
        if (!USERNAME_REGEX.test(value)) {
          return "Username can only contain letters, numbers, underscores, or dots";
        }
        if (RESERVED_WORDS.includes(value.toLowerCase())) {
          return "This username is restricted";
        }
        return "";

      case 'email':
        if (!value) return "Email is required";
        if (!EMAIL_REGEX.test(value)) return "Please enter a valid email address";
        return "";

      case 'password':
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!PASSWORD_REGEX.test(value)) {
          return "Password must include uppercase, lowercase, and a number";
        }
        return "";

      case 'confirmPassword':
        if (!value) return "Please confirm your password";
        if (value !== password) return "Passwords do not match";
        return "";

      default:
        return "";
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    let value = "";
    switch (field) {
      case 'name': value = name; break;
      case 'email': value = email; break;
      case 'password': value = password; break;
      case 'confirmPassword': value = confirmPassword; break;
    }

    const error = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: string, value: string) => {
    // Update field value
    switch (field) {
      case 'name': setName(value); break;
      case 'email': setEmail(value); break;
      case 'password': setPassword(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
    }

    // Clear field error when user starts typing
    setFieldErrors(prev => ({ ...prev, [field]: "" }));
    setGeneralError("");

    // Real-time validation for confirm password when password changes
    if (field === 'password' && touched.confirmPassword && confirmPassword) {
      const confirmError = validateField('confirmPassword', confirmPassword);
      setFieldErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  async function handleRegister() {
    // Validate all fields
    const nameError = validateField('name', name);
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    const confirmError = validateField('confirmPassword', confirmPassword);

    setFieldErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmError
    });

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    // Check terms agreement
    if (!agree) {
      setGeneralError("Please agree to the Terms & Conditions");
      return;
    }

    // Check if any errors exist
    if (nameError || emailError || passwordError || confirmError) {
      setGeneralError("Please fix the errors below");
      return;
    }

    setGeneralError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/auth/register", {
        email: email.toLowerCase().trim(),
        password: password,
        displayName: name,
        username: name.toLowerCase().trim()
      });

      if (response.data) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.replace("/emailverification");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Registration error:", err.response?.data || err.message);
      setGeneralError(err.response?.data?.message || "Registration failed");
      showToast('Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Responsive sizing
  const headerHeight = screenDimensions.height * 0.3;
  const headerTop = screenDimensions.height * 0.08;
  const headerFontSize = Math.min(40, screenDimensions.width * 0.1);
  const inputHeight = Math.min(50, screenDimensions.height * 0.07);
  const buttonHeight = Math.min(60, screenDimensions.height * 0.08);
  const fontSize = Math.min(16, screenDimensions.width * 0.04);
  const smallFontSize = Math.min(14, screenDimensions.width * 0.035);
  const tinyFontSize = Math.min(12, screenDimensions.width * 0.03);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={[styles.headerWrapper, { height: headerHeight }]}>
          <HeaderBackground />
          <View style={[styles.headerContent, { top: headerTop }]}>
            <BackButton color="white" path="/login"/>
            <Text style={[styles.headerTitle, { fontSize: headerFontSize }]}>Register</Text>
            <View style={{ width: 38 }} />
          </View>
        </View>

        <View style={styles.inner}>
          {/* General Error Message with enhanced styling */}
          {generalError ? (
            <ValidationMessage 
              message={generalError} 
              type="error" 
              animated 
            />
          ) : null}

          {/* Username Field */}
          <Text style={[styles.label, { fontSize: smallFontSize }]}>Username</Text>
          <View style={[
            styles.inputWrapper,
            { height: inputHeight },
            touched.name && fieldErrors.name ? styles.inputError : null,
            touched.name && !fieldErrors.name && name.length > 0 ? styles.inputSuccess : null
          ]}>
            <TextInput
              style={[styles.input, { fontSize, height: inputHeight, flex: 1 }]}
              placeholder="username"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={(value) => handleChange('name', value)}
              onBlur={() => handleBlur('name')}
              editable={!loading}
            />
            {touched.name && !fieldErrors.name && name.length > 0 && (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.inputRightIcon} />
            )}
          </View>
          <FieldValidation error={fieldErrors.name} touched={touched.name} />

          {/* Email Field */}
          <Text style={[styles.label, { fontSize: smallFontSize }]}>Email</Text>
          <View style={[
            styles.inputWrapper,
            { height: inputHeight },
            touched.email && fieldErrors.email ? styles.inputError : null,
            touched.email && !fieldErrors.email && email.length > 0 ? styles.inputSuccess : null
          ]}>
            <TextInput
              style={[styles.input, { fontSize, height: inputHeight, flex: 1 }]}
              placeholder="example@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(value) => handleChange('email', value)}
              onBlur={() => handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {touched.email && !fieldErrors.email && email.length > 0 && (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.inputRightIcon} />
            )}
          </View>
          <FieldValidation error={fieldErrors.email} touched={touched.email} />

          {/* Password Field with Strength Indicator */}
          <Text style={[styles.label, { fontSize: smallFontSize }]}>Password</Text>
          <View style={[
            styles.inputWrapper,
            { height: inputHeight },
            touched.password && fieldErrors.password ? styles.inputError : null,
            touched.password && !fieldErrors.password && password.length > 0 ? styles.inputSuccess : null
          ]}>
            <TextInput
              style={[styles.input, { fontSize, height: inputHeight, flex: 1 }]}
              placeholder="password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(value) => handleChange('password', value)}
              onBlur={() => handleBlur('password')}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#7E9AFF"
                onPress={() => setShowPassword(!showPassword)}
              />
            </TouchableOpacity>
          </View>
          
          {/* Password Strength Indicator */}
          {password.length > 0 && !fieldErrors.password && (
            <PasswordStrengthIndicator password={password} />
          )}
          
          <FieldValidation error={fieldErrors.password} touched={touched.password} />
          
          {!fieldErrors.password && (
            <Text style={[styles.passwordHint, { fontSize: tinyFontSize }]}>
              Min. 8 characters, 1 uppercase, 1 lowercase, and a number.
            </Text>
          )}

          {/* Confirm Password Field */}
          <Text style={[styles.label, { fontSize: smallFontSize }]}>Confirm Password</Text>
          <View style={[
            styles.inputWrapper,
            { height: inputHeight },
            touched.confirmPassword && fieldErrors.confirmPassword ? styles.inputError : null,
            touched.confirmPassword && !fieldErrors.confirmPassword && confirmPassword.length > 0 ? styles.inputSuccess : null
          ]}>
            <TextInput
              style={[styles.input, { fontSize, height: inputHeight, flex: 1 }]}
              placeholder="confirm password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              onBlur={() => handleBlur('confirmPassword')}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#7E9AFF"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </TouchableOpacity>
          </View>
          <FieldValidation error={fieldErrors.confirmPassword} touched={touched.confirmPassword} />

          {/* Terms & Conditions Row */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, agree && styles.checkboxActive]}
              onPress={() => setAgree(!agree)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {agree && <Ionicons name="checkmark" size={18} color="white" />}
            </TouchableOpacity>
            <Text style={[styles.checkboxLabel, { fontSize: smallFontSize }]}>
              Agree with Terms & Conditions
            </Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, { height: buttonHeight }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={[styles.buttonText, { fontSize }]}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay visible={loading} message="Creating your account..." />

      {/* Success Animation */}
      {showSuccess && (
        <View style={StyleSheet.absoluteFill}>
          <ValidationMessage 
            message="Registration successful!" 
            type="success" 
            animated 
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  scrollContainer: { 
    flexGrow: 1 
  },
  headerWrapper: {
    width: '100%',
  },
  headerContent: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginRight: 20,
  },
  inner: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7E9AFF',
    backgroundColor: '#DEE4FF',
    borderRadius: 5,
    marginBottom: 5,
    paddingHorizontal: 15,
  },
  input: {
    paddingVertical: 0,
    color: '#333',
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#FEE2E2',
  },
  inputSuccess: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  inputRightIcon: {
    marginLeft: 10,
  },
  passwordHint: {
    color: '#666',
    marginBottom: 15,
    marginTop: 2,
    marginLeft: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    justifyContent: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#D9D9D9',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxActive: {
    backgroundColor: '#7E9AFF',
    borderColor: '#7E9AFF'
  },
  checkboxLabel: {
    color: '#000'
  },
  button: {
    backgroundColor: '#7d77f0',
    padding: 18,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});