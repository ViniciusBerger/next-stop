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
  ScrollView 
} from "react-native";
import HeaderBackground from "@/src/svgs/HeaderBackground";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from "@/components/backButton";
// import { registerWithEmail, sendEmailVerification } from "../service/authService";
// import { checkIfUsernameExists } from "@/src/service/userService";

// Validation Regex Patterns and Reserved Words
const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,20}$/;
const RESERVED_WORDS = ['admin', 'support', 'owner', 'official', 'root'];

export default function RegisterScreen() {
  //Use States
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  const checkUsername = async () => {
    try {
      // const isTaken = await checkIfUsernameExists(name);
      const isTaken = false; // Mock result

      if (isTaken) {
        setError("That username is already taken");
      } else {
        setError(""); // Clear error if available
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Wait 500ms after the user stops typing
  const timeoutId = setTimeout(checkUsername, 500);

  // Cleanup: if the user types again before 500ms, cancel the previous check
  return () => clearTimeout(timeoutId);
}, [name]);

  async function handleRegister() {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    const cleanName = name.toLowerCase().trim();

    if (RESERVED_WORDS.includes(cleanName)) {
      setError("This username is restricted. Please choose another.");
      return;
    }
    if (!USERNAME_REGEX.test(name)) {
    setError("Username must be 3-20 characters and can only contain letters, numbers, underscores, or dots.");
    return;
  }
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
    setError("Password must be at least 8 characters long and include an uppercase letter, lowercase letter, and a number.");
    return;
  }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agree) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    // try {
    //   // 1. Create the user
    //   const userCredential = await registerWithEmail(email, password, name);
      
    //   // 2. Send the verification email
    //   // (Assuming you use Firebase Auth)
    //   if (userCredential.user) {
    //     await sendEmailVerification(userCredential.user);
    //   }

    //   // 3. Move to the waiting screen
    //   router.navigate("/emailverification");
    // } catch (err: any) {
    //   setError(err.message);
    // }  

    setError("");
    setLoading(true);
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
        <View style={styles.headerWrapper}>
          <HeaderBackground />
          <View style={styles.headerContent}>
            <BackButton color="white" path="/login"/>            
            <Text style={styles.headerTitle}>Register</Text>
            <View style={{ width: 38 }} /> {/*Alignment purposes*/}
          </View>
        </View>

        <View style={styles.inner}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="username"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {password.length === 0 && (
            <Text style={styles.passwordHint}>
              Min. 8 characters, 1 uppercase, 1 lowercase, and a number.
            </Text>
          )}
          
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={[styles.input, confirmPassword && password !== confirmPassword ? styles.inputError : null]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {/* Terms & Conditions Row
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, agree && styles.checkboxActive]} 
              onPress={() => setAgree(!agree)}
            >
              Render the icon only if agree is true
              {agree && <Ionicons name="checkmark" size={18} color="white" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Agree with Terms & Conditions</Text>
          </View> */}

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContainer: { flexGrow: 1 },
  headerWrapper: {
    height: 265,
    width: '100%',
  },
  headerContent: {
    position: 'absolute',
    top: 60,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  backButton: { marginRight: 20 },
  backText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  headerTitle: { 
    fontSize: 40, 
    fontWeight: 'bold', 
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginRight: 20,
    marginTop: 10
  },
  inner: { paddingHorizontal: 30, paddingBottom: 40 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#000' },
  input: { 
    borderWidth: 1, 
    borderColor: '#7E9AFF',
    backgroundColor: '#DEE4FF',
    padding: 15, 
    borderRadius: 5, 
    marginBottom: 20,
    fontSize: 16,
    color: '#808080'
  },
  inputError: { borderColor: '#dc2626'},
  checkboxContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 30,
    justifyContent: 'center'
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
  checkboxActive: { backgroundColor: '#7E9AFF', borderColor: '#7E9AFF' },
  checkboxLabel: { fontSize: 14, color: '#000' },
  button: { 
    backgroundColor: '#7d77f0', 
    padding: 18, 
    borderRadius: 100, 
    alignItems: 'center',
    height: 60,
  },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
  errorText: { color: '#dc2626', textAlign: 'center', marginBottom: 5, marginTop: 5, fontSize: 20, fontWeight: '600' },
  passwordHint: {
  fontSize: 14,
  color: '#666',
  marginBottom: 10,
  marginTop: -15,
},
});