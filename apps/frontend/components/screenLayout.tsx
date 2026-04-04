import React from "react";
import { ScrollView, View, StyleSheet, KeyboardAvoidingView, Platform, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles as loginStyles } from "../src/styles/login.styles"; //Named to avoid confusion
import { BottomTabBar } from "@/components/bottomTabBar";
import { BackButton } from "./backButton";

interface ScreenLayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
  title?: string;
}

export function ScreenLayout({ children, showBack = true, title }: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/*Content Layer */}
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/*Background stays back */}
          <View style={[loginStyles.headerBackground, { position: 'absolute' }]} />

          {/*Back Button and title on the same row */}
          <View style={[styles.topHeader, { paddingTop: insets.top + 30 }]}>
            {showBack && <BackButton color="white" />}
            {title && <Text style={styles.headerTitle}>{title}</Text>}
          </View>

          {children}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Tab Bar */}
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 18,
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 40, // offset the back button width so title appears truly centered
  },
  scrollContent: {
    paddingHorizontal: 20,
  }
});