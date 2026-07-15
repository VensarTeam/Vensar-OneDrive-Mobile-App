import { StatusBar } from 'expo-status-bar';

import { AppNavigator } from '../navigation/AppNavigator';
import { useAppTheme } from '../core/theme/AppThemeProvider';
import { AuthSessionProvider } from '../features/auth/services/auth-session-provider';
import { ToastProvider } from '../shared/toast/toast-provider';

export function RootView() {
  const { colorScheme } = useAppTheme();

  return (
    <>
      <AuthSessionProvider>
        <ToastProvider>
          <AppNavigator />
        </ToastProvider>
      </AuthSessionProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
