import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform,
    ScrollView,} from "react-native";
import HeaderBackground from "@/src/svgs/HeaderBackground";
import { useRouter } from "expo-router";
import { BackButton } from "@/components/backButton";

const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 1500);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerWrapper}>
          <HeaderBackground />

          <View style={styles.headerContent}>
            <BackButton color="white" path="/login"/>
            <Text style={styles.headerTitle}>Forgot Password</Text>
            <View style={{ width: 38 }} />
          </View>
        </View>

        <View style={styles.inner}>
          <Text style={styles.subtitle}>Enter Email Address</Text>

          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Send</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerWrapper}>
            <Text style={styles.registerText}>
              Don’t have an account?
            </Text>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.replace("/register")}
            >
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  scrollContainer: {
    flexGrow: 1,
  },

  headerWrapper: {
    height: 265,
    width: "100%",
  },

  headerContent: {
    position: "absolute",
    top: 60,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#ffffff",
    flex: 1,
    textAlign: "center",
    marginRight: 10,
    marginTop: 10,
    
  },

  inner: {
    paddingHorizontal: 30,
    paddingBottom: 60,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 25,
    color: "#000",
    marginTop: 10,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#7E9AFF",
    backgroundColor: "#DEE4FF",
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
    color: "#808080",
  },

  errorText: {
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 15,
    fontSize: 14,
    fontWeight: "500",
  },

  button: {
    backgroundColor: "#926af5",
    padding: 18,
    borderRadius: 100,
    alignItems: "center",
    marginTop: 10,
    height: 70,
    justifyContent: "center",
    alignContent: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 20,
  },

  registerWrapper: {
    marginTop: 50,
    alignItems: "center",
  },

  registerText: {
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 12,
  },

  registerButton: {
    backgroundColor: "#7d77f0",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 100,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },

  registerButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
