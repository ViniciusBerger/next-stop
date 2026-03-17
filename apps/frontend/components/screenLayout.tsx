import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { styles as loginStyles } from "../src/styles/login.styles"; //Named to avoid confusion
import { BottomTabBar } from "@/components/bottomTabBar";
import { BackButton } from "./backButton";

interface ScreenLayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
}

export function ScreenLayout({ children, showBack = true }: ScreenLayoutProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/*Content Layer */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/*Background stays back */}
      <View style={[loginStyles.headerBackground, { position: 'absolute' }]} />

      {/*Back Button on top*/}
      <View style={styles.topHeader}>
        {showBack && <BackButton color="white" />}
      </View>

        {children}
      </ScrollView>
      
      {/* Bottom Tab Bar */}
      <BottomTabBar />
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