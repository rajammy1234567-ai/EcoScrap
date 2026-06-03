import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { colors } from '../../src/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.green600,
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 28 : 16,
          left: 20,
          right: 20,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#1B1B1B',
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          paddingHorizontal: 8,
          ...(Platform.OS === 'web'
            ? { boxShadow: '0px 8px 32px rgba(0,0,0,0.4), 0px 0px 0px 1px rgba(255,255,255,0.05)' }
            : {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 16,
              }),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarItemStyle: { borderRadius: 24, marginHorizontal: 4 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scrap-rates"
        options={{
          title: 'Scrap Rates',
          tabBarIcon: ({ color, size }) => <Feather name="tag" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'My Pickups',
          tabBarIcon: ({ color, size }) => <Feather name="package" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
