import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabBar } from '../theme';

/** Bottom padding so scroll content clears the floating tab bar. */
export function useTabBarInset(extra = tabBar.scrollExtra): number {
  const insets = useSafeAreaInsets();
  return tabBar.height + tabBar.bottomOffset + insets.bottom + extra;
}