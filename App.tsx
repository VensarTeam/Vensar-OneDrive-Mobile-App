import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootView } from './src/bootstrap/RootView';
import { AppThemeProvider } from './src/core/theme/AppThemeProvider';
import { completePendingAuthSession } from './src/features/auth/services/authSessionService';

completePendingAuthSession();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <RootView />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
