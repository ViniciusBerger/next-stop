import { Stack } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { ToastManager } from '../../components/ui/Toast';

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
        <Stack.Screen
          name="dashboard"
          options={{
            title: 'Admin Dashboard',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => console.log('Admin settings')}
                style={{ marginRight: 16 }}
              >
                <Text style={{ color: '#fff', fontSize: 16 }}>⚙️</Text>
              </TouchableOpacity>
            ),
          }}
        />
        
        {/* Moderation Screen */}
        <Stack.Screen
          name="moderation"
          options={{
            title: 'User Moderation',
            headerBackTitle: 'Back',
            headerBackVisible: true,
          }}
        />

        {/* Feedback Screen */}
        <Stack.Screen
          name="feedback"
          options={{
            title: 'Feedback Management',
            headerBackTitle: 'Back',
            headerBackVisible: true,
          }}
        />

        {/* Reports Screen - ADD THIS */}
        <Stack.Screen
          name="reports"
          options={{
            title: 'Report Management',
            headerBackTitle: 'Back',
            headerBackVisible: true,
          }}
        />
      </Stack>
      
      {/*ToastManager*/}
      <ToastManager />
    </>
  );
}