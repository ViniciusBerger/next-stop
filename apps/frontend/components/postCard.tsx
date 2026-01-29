import { styles } from "../src/styles/login.styles";
import { View, Text } from "react-native";

type PostProps = {
  username: string;
  date: string;
  imageUrl: string;
  likes: number;
  description: string;
};

export function PostCard({
  username,
  date,
  imageUrl,
  likes,
  description,
}: PostProps) {
  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <View style={styles.avatarSmall} />
        <View>
          <Text>{username}</Text>
          <Text>{date}</Text>
        </View>
      </View>

      <View style={styles.imagePlaceholder} />

      <Text>❤️ {likes} likes</Text>
      <Text>{description}</Text>
    </View>
  );
}
