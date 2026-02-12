import { View, Text, ScrollView } from "react-native";
import { DiscoverCard } from "../../components/discoverCard";
import { PostCard } from "../../components/postCard";
import { BottomTabBar } from "../../components/bottomTabBar";
import { HomeHeader } from "../../components/homeHeader";
import { styles } from "../../src/styles/login.styles";
import HomeMenu from "../../components/homeMenu";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
        >
        <View style={styles.headerBackground} />
        <HomeHeader onMenuPress={() => setIsMenuOpen(true)} />

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
