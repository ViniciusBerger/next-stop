import { View, Text, ScrollView } from "react-native";
import { DiscoverCard } from "../../components/discoverCard";
import { PostCard } from "../../components/postCard";
import { BottomTabBar } from "../../components/bottomTabBar";
import { HomeHeader } from "../../components/homeHeader";
import { styles } from "../../src/styles/login.styles";
import HomeMenu from "../../components/homeMenu";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { getItemAsync } from "expo-secure-store";
import axios from "axios";
import { auth } from "@/src/config/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [username, setUsername] = useState("Not working");

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("HOME: Auth state changed. User exists: true");
      try {
        // 2. Use the direct function + the direct localStorage check
        let token = null;
        try {
          token = await getItemAsync("userToken");
        } catch (e) {
          console.log("SecureStore skipped, checking localStorage");
        }

        if (!token) {
          token = localStorage.getItem("userToken");
        }

        console.log("HOME: Token found:", !!token);
        
        if (token) {
          const response = await axios.get(`http://localhost:3000/profile?firebaseUid=${user.uid}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data?.username) {
            setUsername(response.data.username);
          }
        }
      } catch (error: any) {
        console.error("HOME: Fetch Error:", error.message);
      }
    }
  });

  return () => unsubscribe();
}, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
        >
        <View style={styles.headerBackground} />
        <HomeHeader 
        username={username}
        onMenuPress={() => setIsMenuOpen(true)} />

        <DiscoverCard onPress={() => router.push("/discover")} />

        <PostCard
          username="User’s name"
          date="Month-year"
          imageUrl=""
          likes={88}
          description="Description of outing here"
        />

        <PostCard
          username="User’s name"
          date="Month-year"
          imageUrl=""
          likes={42}
          description="Description of outing here"
        />
      </ScrollView>
      
      <HomeMenu 
        isVisible={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
      
      <BottomTabBar />
    </View>
  );
}
