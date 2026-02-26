import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ToastManager } from '@/components/ui/Toast'; // ADD THIS IMPORT

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        {/* Add these screens if they exist */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="discover" options={{ title: 'Discover' }} />
      </Stack>
      <StatusBar style="auto" />
      <ToastManager /> {/* ADD THIS - shows toasts globally */}
    </ThemeProvider>
  );
}