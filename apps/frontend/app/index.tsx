import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Set this to true to test admin screens, false for normal flow
  const TEST_ADMIN_MODE = false; // Change to true to test admin screens

  useEffect(() => {
    // Check if router is ready
    const checkReady = setInterval(() => {
      if (router.canGoBack()) {
        setIsReady(true);
        clearInterval(checkReady);
      }
    }, 100);

    // Fallback timer
    const timer = setTimeout(() => {
      setIsReady(true);
      clearInterval(checkReady);
    }, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(checkReady);
    };
  }, []);

  useEffect(() => {
    if (isReady) {
      // Small delay to ensure navigation is fully mounted
      setTimeout(() => {
        if (TEST_ADMIN_MODE) {
          // Go to admin moderation screen for testing
          router.replace("/(admin)/moderation" as any);
        } else {
          // Normal flow - go to login
          router.replace("/login");
        }
      }, 50);
    }
  }, [isReady]);

  return (
    <View style={styles.container}>
      <View style={styles.headerBackground} />
      <ActivityIndicator size="large" color="#7d77f0" style={styles.loader} />
      <Text style={styles.text}>Loading NextStop...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 420,
    backgroundColor: '#6B73FF',
    borderBottomColor: '#2EE6A8',
    borderBottomWidth: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 18,
    marginTop: -100,
  },
});