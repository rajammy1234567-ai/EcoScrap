import { Stack } from 'expo-router';

export default function LiveLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="feed" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}