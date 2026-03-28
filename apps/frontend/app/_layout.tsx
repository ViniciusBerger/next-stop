import { Stack } from "expo-router";
import { useNavigationContainerRef } from "expo-router";
import { useEffect } from "react";
import { ToastManager } from "../components/ui/Toast";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/src/config/firebase';
import { setupNotificationHandler, registerPushToken } from '@/src/utils/notifications';

setupNotificationHandler();

export default function RootLayout() {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (__DEV__) {
      // This automatically connects to Flipper if available
    }
  }, [navigationRef]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        registerPushToken(idToken).catch(console.error);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Tab Navigation */}
        <Stack.Screen name="(tabs)" />
        
        {/* Admin Navigation */}
        <Stack.Screen name="(admin)" />
        
        {/* Auth Screens */}
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="emailverification" />
        <Stack.Screen name="emailverified" />
        
        {/* Main App Screens */}
        <Stack.Screen name="discover" />
        <Stack.Screen name="locationdetails" />
        <Stack.Screen name="locationreviews" />
        <Stack.Screen name="createevent" />
        <Stack.Screen name="createreview" />
        <Stack.Screen name="myevents" />
        <Stack.Screen name="myreviews" />
        <Stack.Screen name="feedback" />
        <Stack.Screen name="badges" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="wishlist" />
        <Stack.Screen name="history" />
        
        {/* Error Pages */}
        <Stack.Screen name="404" options={{ title: 'Page Not Found' }} />
        <Stack.Screen name="500" options={{ title: 'Server Error' }} />
        
        {/* Root */}
        <Stack.Screen name="index" />
      </Stack>
      <ToastManager />
    </>
  );
}