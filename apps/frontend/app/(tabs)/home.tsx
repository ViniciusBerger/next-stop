import { View, Text, ScrollView } from "react-native";
import { DiscoverCard } from "../../components/discoverCard";
import { PostCard } from "../../components/postCard";
import { BottomTabBar } from "../../components/bottomTabBar";
import { HomeHeader } from "../../components/homeHeader";
import { styles } from "../../src/styles/login.styles";

export default function Home() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <View style={styles.headerBackground} />
        <HomeHeader onMenuPress={() => {}} />

        <DiscoverCard onPress={() => console.log("Go to discover")} />

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

      <BottomTabBar />
    </View>
  );
}
