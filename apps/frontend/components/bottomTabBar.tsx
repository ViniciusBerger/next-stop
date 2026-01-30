import { View, TouchableOpacity, Image } from "react-native";
import { styles } from "../src/styles/login.styles";
import { icons } from "../src/icons";

export function BottomTabBar() {
  return (
    <View style={styles.bottomTabBar}>
      <TouchableOpacity style={styles.tabButton}>
        <Image source={icons.house} style={styles.tabIcon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabButton}>
        <Image source={icons.search} style={styles.tabIcon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabButton}>
        <Image source={icons.profile} style={styles.tabIcon} />
      </TouchableOpacity>
    </View>
  );
}
