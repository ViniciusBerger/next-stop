import React from "react";
import { ScrollView, View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles as loginStyles } from "../src/styles/login.styles"; //Named to avoid confusion
import { BackButton } from "./backButton";

interface ScreenLayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
}

export function AdminScreenLayout({ children, showBack = true }: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/*Content Layer */}
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/*Background stays back */}
          <View style={[loginStyles.headerBackground, { position: 'absolute' }]} />

          {/*Back Button on top*/}
          <View style={[styles.topHeader, { paddingTop: insets.top + 8 }]}>
            {showBack && <BackButton color="white" />}
          </View>

          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    paddingHorizontal: 10,
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
  }
});