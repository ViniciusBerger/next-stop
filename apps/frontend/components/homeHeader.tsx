import { View, Text, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../src/styles/login.styles";
import { icons } from "../src/icons";

type Props = {
  onMenuPress: () => void;
  avatarUrl?: string;
  username?: string;
};

export function HomeHeader({
  onMenuPress,
  avatarUrl,
  username = "Username",
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.homeHeader, { paddingTop: insets.top + 8 }]}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton} activeOpacity={0.7} hitSlop={25}>
        <Image source={icons.menu} />
      </TouchableOpacity>

      <View style={styles.headerTextWrapper}>
        <Text style={styles.headerGreeting}>Hello, {"\n"}{username}</Text>
        <Text style={styles.headerSubtitle}>Ready for your next outing?</Text>
      </View>

      <View style={[styles.avatarWrapper, { top: insets.top + 8 }]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <Image source={{uri: "https://i.pravatar.cc/150?img=12",}} style={styles.avatar} />
        )}
      </View>
    </View>
  );
}
