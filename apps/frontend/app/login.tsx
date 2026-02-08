import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { styles } from "../src/styles/login.styles";
import { useState } from "react";
import HeaderBackground from "../src/svgs/HeaderBackground";
import { useRouter } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasError, setHasError] = useState(false);
  const router = useRouter();

  function handleLogin() {
    router.replace("/home");
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

          {hasError && <Text style={styles.errorText}>Invalid Credentials</Text>}

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