import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { styles as loginStyles } from "../src/styles/login.styles"; //Named to avoid confusion
import { BackButton } from "./backButton";

interface ScreenLayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
}

export function AdminScreenLayout({ children, showBack = true }: ScreenLayoutProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/*Background stays back */}
      <View style={[loginStyles.headerBackground, { position: 'absolute' }]} />

      {/*Back Button on top*/}
      <View style={styles.topHeader}>
        {showBack && <BackButton color="white" />}
      </View>

      {/*Content Layer */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    
    </View>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    height: 100, // Adjust based on your phone's notch/safe area
    paddingTop: 50,
    paddingHorizontal: 10,
    zIndex: 10, // Keeps button clickable above everything else
  },
  scrollContent: {
    paddingBottom: 100, // Space for the BottomTabBar
    paddingHorizontal: 20,
  }
});