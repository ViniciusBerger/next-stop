import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/config/firebase";
import { getRole, setToken } from "@/src/utils/auth";

export default function Index() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const TEST_ADMIN_MODE = false;

  useEffect(() => {
    const checkReady = setInterval(() => {
      if (router.canGoBack()) {
        setIsReady(true);
        clearInterval(checkReady);
      }
    }, 100);

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
    if (!isReady) return;

    if (TEST_ADMIN_MODE) {
      router.replace("/(admin)/moderation" as any);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user && user.emailVerified) {
          const idToken = await user.getIdToken();
          await setToken(idToken);
          const role = await getRole();
          if (role === "admin") {
            router.replace("/(admin)/dashboard");
          } else {
            router.replace("/home");
          }
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    });

    return unsubscribe;
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
