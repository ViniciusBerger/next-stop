import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  headerText: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'flex-start',
    color: '#000',
    fontSize: 50,
    marginStart: 30,
  },

  title: {
    position: "absolute",
    fontSize: 32,
    fontWeight: "600",
    color: "#000",
  },

  form: {
    paddingHorizontal: 24,
    marginTop: 40,
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#000000",
  },

  input: {
    height: 44,
    backgroundColor: "#E8EEFF",
    borderWidth: 1,
    borderColor: "#6B73FF",
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 16,
  },

  errorText: {
    color: "#FF0000",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },

  button: {
    height: 46,
    borderRadius: 23,
    backgroundColor: "#6B73FF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },

  buttonBorder: {
    borderWidth: 2,
    borderColor: "#2EE6A8",
  },

  link: {
    fontSize: 14,
    color: "#000000",
    marginTop: 12,
  },
});
