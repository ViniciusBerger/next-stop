import { Stack } from "expo-router";
import { ToastManager } from "@/components/ui/Toast";

export default function AdminLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1F2937',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Admin Dashboard */}
        <Stack.Screen
          name="dashboard"
          options={{
            title: 'Admin Dashboard',
            headerBackTitle: 'Back',
            headerShown: false, // Hide header for dashboard since it has its own layout
          }}
        />

        {/* Moderation Screen */}
        <Stack.Screen
          name="moderation"
          options={{
            title: 'User Moderation',
            headerBackTitle: 'Back',
          }}
        />

        {/* Feedback List Screen */}
        <Stack.Screen
          name="feedback"
          options={{
            title: 'Feedback Management',
            headerBackTitle: 'Back',
          }}
        />

        {/* Feedback Details Screen */}
        <Stack.Screen
          name="feedback/[id]"
          options={{
            title: 'Feedback Details',
            headerBackTitle: 'Back',
          }}
        />

        {/* Reports List Screen */}
        <Stack.Screen
          name="reports"
          options={{
            title: 'Report Management',
            headerBackTitle: 'Back',
          }}
        />

        {/* Reports Details Screen */}
        <Stack.Screen
          name="reports/[id]"
          options={{
            title: 'Report Details',
            headerBackTitle: 'Back',
          }}
        />

        {/* Analytics Dashboard Screen */}
        <Stack.Screen
          name="analytics"
          options={{
            title: 'Analytics Dashboard',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
      <ToastManager />
    </>
  );
}