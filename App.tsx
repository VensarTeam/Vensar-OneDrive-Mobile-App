import { useEffect, useState } from 'react';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { configureFonts, MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RootView } from './src/bootstrap/RootView';
import { AppThemeProvider, useAppTheme } from './src/core/theme/AppThemeProvider';
import { completePendingAuthSession } from './src/features/auth/services/authSessionService';
import { AnimatedSplash } from './src/shared/components/animated-splash';

completePendingAuthSession();
void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 0, fade: false });

const paperFonts = configureFonts({ config: { fontFamily: 'GoogleSansFlex-Regular' } });

function ThemedApp({ onSplashFinished, showSplash }: { onSplashFinished: () => void; showSplash: boolean }) {
  const { colorScheme, theme } = useAppTheme();
  const baseTheme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const paperTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: theme.colors.background,
      error: theme.colors.danger,
      outline: theme.colors.border,
      primary: theme.colors.primary,
      surface: theme.colors.surface,
      surfaceVariant: theme.colors.surfaceMuted,
      onBackground: theme.colors.text,
      onSurface: theme.colors.text,
      onSurfaceVariant: theme.colors.textMuted,
    },
    fonts: paperFonts,
  };

  return <PaperProvider theme={paperTheme}><RootView />{showSplash ? <AnimatedSplash onFinished={onSplashFinished} /> : null}</PaperProvider>;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    'GoogleSansFlex-Regular': require('./assets/fonts/google-sans-flex-regular.ttf'),
    'GoogleSansFlex-SemiBold': require('./assets/fonts/google-sans-flex-semibold.ttf'),
    'GoogleSansFlex-Bold': require('./assets/fonts/google-sans-flex-bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <AppThemeProvider>
          <ThemedApp onSplashFinished={() => setShowSplash(false)} showSplash={showSplash} />
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
