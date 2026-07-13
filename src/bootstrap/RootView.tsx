import { StatusBar } from 'expo-status-bar';

import { AppNavigator } from '../navigation/AppNavigator';
import { useAppTheme } from '../core/theme/AppThemeProvider';

export function RootView() {
  const { colorScheme } = useAppTheme();

  return (
    <>
      <AppNavigator />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
