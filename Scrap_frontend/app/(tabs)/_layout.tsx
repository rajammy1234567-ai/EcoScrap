import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { colors, tabBar } from '../../src/theme';

const ICONS = {
  home: 'home',
  'scrap-rates': 'tag',
  requests: 'package',
} as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary.green500,
        tabBarInactiveTintColor: '#8A8A8A',
        tabBarIcon: ({ color }) => {
          const name = ICONS[route.name as keyof typeof ICONS] ?? 'circle';
          return <Feather name={name as any} size={tabBar.iconSize} color={color} />;
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: tabBar.bottomOffset,
          left: tabBar.horizontalInset,
          right: tabBar.horizontalInset,
          height: tabBar.height,
          borderRadius: tabBar.borderRadius,
          backgroundColor: '#141414',
          borderTopWidth: 0,
          paddingTop: 4,
          paddingBottom: Platform.OS === 'ios' ? 6 : 4,
          paddingHorizontal: 4,
          ...(Platform.OS === 'web'
            ? { boxShadow: '0px 4px 20px rgba(0,0,0,0.35)' }
            : {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 10,
              }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 0,
          marginBottom: 2,
        },
        tabBarItemStyle: {
          borderRadius: 20,
          paddingVertical: 2,
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="scrap-rates" options={{ title: 'Rates' }} />
      <Tabs.Screen name="requests" options={{ title: 'Pickups' }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}