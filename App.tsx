import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { configureFonts, MD3LightTheme, PaperProvider } from 'react-native-paper';

import { RootView } from './src/bootstrap/RootView';
import { useSystemAppIcon } from './src/core/hooks/useSystemAppIcon';
import { AppThemeProvider } from './src/core/theme/AppThemeProvider';
import { completePendingAuthSession } from './src/features/auth/services/authSessionService';

completePendingAuthSession();

const paperTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: { fontFamily: 'GoogleSansFlex-Regular' } }),
};

export default function App() {
  useSystemAppIcon();

  const [fontsLoaded, fontError] = useFonts({
    'GoogleSansFlex-Regular': require('./assets/fonts/google-sans-flex-regular.ttf'),
    'GoogleSansFlex-SemiBold': require('./assets/fonts/google-sans-flex-semibold.ttf'),
    'GoogleSansFlex-Bold': require('./assets/fonts/google-sans-flex-bold.ttf'),
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <PaperProvider theme={paperTheme}>
        <AppThemeProvider>
          <RootView />
        </AppThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
