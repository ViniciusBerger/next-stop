import { TouchableOpacity, View, Text, Image } from "react-native";
import { icons } from "../src/icons";
import { styles } from "../src/styles/login.styles";

export function DiscoverCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.card}>
        <Image source={icons.discover} />
        <Text style={styles.text}>Discover</Text>
      </View>
    </TouchableOpacity>
  );
}
