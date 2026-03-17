import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { styles } from "../src/styles/login.styles";
import { useState } from "react";
import HeaderBackground from "../src/svgs/HeaderBackground";
import { useRouter } from "expo-router";
import axios from "axios";
import { setItemAsync} from "expo-secure-store";
import { auth } from "../src/config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { API_URL } from "@/src/config/api";

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
    const response = await axios.post(`${API_URL}/auth/validate`, {
      token: idToken,
    });

    if (response.data) {
    try {
      await setItemAsync("userToken", idToken);
      await setItemAsync("userRole", response.data.role); // Store role securely for mobile
    } catch (e) {
      localStorage.setItem("userToken", idToken);
      localStorage.setItem("userRole", response.data.role); //For web
    }

    // Route based on role instead of always going to /home
    if (response.data.role === "admin") {
      router.replace("/(admin)/dashboard");
    } else {
      router.replace("/home");
    }
  }
  } catch (error: any) {
    console.error("Login Error:", error.response?.data || error.message);
    setHasError(true);  }
}

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrapper}>
          <HeaderBackground height={420}/>
          <Text style={styles.headerText}>Welcome!</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { textAlignVertical: 'center', paddingVertical: 0 }]}
            placeholder="example@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, { textAlignVertical: 'center', paddingVertical: 0 }]}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {hasError && <Text style={styles.errorText}>{errorMessage || "Invalid Credentials"}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.link} onPress={() => router.replace("/forgot-password")}>
              Forgot Password
            </Text>
            <Text style={styles.link} onPress={() => router.replace("/register")}>
              Register
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}