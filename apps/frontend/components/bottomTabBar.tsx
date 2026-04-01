import { View, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../src/styles/login.styles";
import { icons } from "../src/icons";
import { useRouter, usePathname } from "expo-router";

export function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (route: string) => {
    return pathname === route || pathname?.startsWith(route + '/');
  };

  return (
    <View style={[styles.bottomTabBar, { height: 80 + insets.bottom, paddingBottom: insets.bottom }]}>
      <TouchableOpacity 
        style={styles.tabButton} 
        onPress={() => router.push("/home")}
      >
        <Image 
          source={icons.house} 
          style={styles.tabIcon}  // No tint applied - stays original color
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabButton} 
        onPress={() => router.push("/discover")}
      >
        <Image 
          source={icons.search} 
          style={styles.tabIcon}  // No tint applied - stays original color
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabButton} 
        onPress={() => router.push("/(tabs)/profile")}
      >
        <Image 
          source={icons.profile} 
          style={styles.tabIcon}  // No tint applied - stays original color
        />
      </TouchableOpacity>
    </View>
  );
}