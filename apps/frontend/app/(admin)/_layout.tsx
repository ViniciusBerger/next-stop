import { Stack } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';

export default function AdminLayout() {
  return (
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
    </Stack>
  );
}