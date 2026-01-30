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

  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#2EE6A8",
    backgroundColor: "#FFFFFF",
    margin: 24,
  },

  text: {
    fontSize: 27,
    fontWeight: "600",
    color: "#000000",
    marginLeft: 16,
  },

  post: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#BDBDBD",
    marginRight: 12,
  },

  imagePlaceholder: {
    height: 160,
    borderRadius: 12,
    backgroundColor: "#E6E6E6",
    marginTop: 12,
  },

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  bottomTabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#6B73FF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 3,
    borderTopColor: "#2EE6A8",
  },

  tabButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  tabIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  homeHeader: {
    paddingTop: 40,
    paddingHorizontal: 24,
    height: 225,
  },

  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },

  avatarWrapper: {
    position: "absolute",
    top: 40,
    right: 24,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#9E9E9E",
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
  },

  avatarPlaceholder: {
    flex: 1,
    backgroundColor: "#E5E5E5",
  },

  headerTextWrapper: {
    flex: 1,
    marginHorizontal: 16,
  },

  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 420,
    backgroundColor: "#6B73FF",
    borderBottomColor: "#2EE6A8",
    borderBottomWidth: 10,
  },


  headerGreeting: {
    marginTop: 32,
    fontSize: 32,
    fontWeight: "700",
    color: "#000000",
  },

  headerSubtitle: {
    marginTop: 30,
    fontSize: 18,
    color: "#000000",
    alignSelf: "center",
  },
});
