import { View, Text, TouchableOpacity, Image, StyleSheet as RNStyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../src/styles/login.styles";
import { icons } from "../src/icons";
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onMenuPress: () => void;
  onNotificationsPress?: () => void;
  avatarUrl?: string;
  username?: string;
  unreadCount?: number;
};

export function HomeHeader({
  onMenuPress,
  onNotificationsPress,
  avatarUrl,
  username = "Username",
  unreadCount = 0,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.homeHeader, { paddingTop: insets.top + 8 }]}>
      <View style={headerStyles.topRow}>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton} activeOpacity={0.7} hitSlop={25}>
          <Image source={icons.menu} />
        </TouchableOpacity>

        {onNotificationsPress && (
          <TouchableOpacity onPress={onNotificationsPress} style={headerStyles.bellButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={35} color="#FFF" />
            {unreadCount > 0 && (
              <View style={headerStyles.badge}>
                <Text style={headerStyles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.headerTextWrapper}>
        <Text style={styles.headerGreeting}>Hello, {"\n"}{username}</Text>
        <Text style={styles.headerSubtitle}>Ready for your next outing?</Text>
      </View>

      <View style={[styles.avatarWrapper, { top: insets.top + 30 }]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <Image source={{uri: "https://i.pravatar.cc/150?img=12",}} style={styles.avatar} />
        )}
      </View>
    </View>
  );
}

const headerStyles = RNStyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 4,
  },
  bellButton: {
    position: 'relative',
    padding: 4,
    marginTop: 5,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#dc2626',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#5962ff',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
