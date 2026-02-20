import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { styles } from "../src/styles/login.styles";
import { useState } from "react";
import HeaderBackground from "../src/svgs/HeaderBackground";
import { useRouter } from "expo-router";
import axios from "axios";
import { setItemAsync} from "expo-secure-store";
import { auth } from "../src/config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

async function handleLogin() {
  setHasError(false);
  
  try {
    // 1. Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Force Firebase to check the server for the latest verification status
    await userCredential.user.reload();
    const refreshedUser = auth.currentUser;
    
    // Check if email is verified before talking to your backend
    if (!refreshedUser?.emailVerified) {
      setErrorMessage("Please verify your email address first.");
      setHasError(true);
      return;
    }
    
    // 2. Get the token the AuthStrategy is looking for
    const idToken = await userCredential.user.getIdToken();

    // 3. Call the NestJS backend directly
    const response = await axios.post("http://localhost:3000/auth/validate", {
      token: idToken,
    });

    if (response.data) {
      // 4. Save for future authenticated requests
      try {
        // For phones
        await setItemAsync("userToken", idToken); 
      } catch (e) {
        // For web
        localStorage.setItem("userToken", idToken);
      }
      // 5. Navigate to the home screen
      router.replace("/home");
    }
  } catch (error: any) {
    console.error("Login Error:", error.response?.data || error.message);
    setHasError(true);  }
}

  return (
    // KeyboardAvoidingView prevents the keyboard from hiding your inputs
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <ScrollView 
        // Use contentContainerStyle for layout logic inside the scroll area
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrapper}>
          {/* The SVG stays full width via its own internal absolute styling */}
          <HeaderBackground height={420}/>
          <Text style={styles.headerText}>Welcome!</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {hasError && <Text style={styles.errorText}>{errorMessage || "Invalid Credentials"}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <Text style={styles.link} onPress={() => router.replace("/forgot-password")}>
            Forgot Password
          </Text>
          <Text style={styles.link} onPress={() => router.replace("/register")}>
            Register
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}