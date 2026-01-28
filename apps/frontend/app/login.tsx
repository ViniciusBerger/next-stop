import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { styles } from "../src/styles/login.styles";
import { useState } from "react";
import HeaderBackground from "../src/svgs/HeaderBackground";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasError, setHasError] = useState(false);

  function handleLogin() {
    setHasError(true);
  }

  return (
    <View style={styles.container}>
      <View>
          <HeaderBackground width={400} height={300}/>
          <Text style={styles.headerText}>Welcome!</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="example@email.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {hasError && (
          <Text style={styles.errorText}>Invalid Credentials</Text>
        )}

        <TouchableOpacity style={[styles.button, styles.buttonBorder]} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.link}>Forgot Password</Text>
        <Text style={styles.link}>Register</Text>
      </View>
    </View>
  );
}
