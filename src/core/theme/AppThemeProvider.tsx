import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import type { Theme } from '@react-navigation/native';

import { darkNavigationTheme, lightNavigationTheme } from './navigationTheme';
import { darkTheme, lightTheme } from './theme';
import type { AppColorScheme, AppTheme } from './types';

type AppThemeContextValue = {
  colorScheme: AppColorScheme;
  navigationTheme: Theme;
  theme: AppTheme;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const colorScheme: AppColorScheme = systemColorScheme === 'dark' ? 'dark' : 'light';

  const value = useMemo<AppThemeContextValue>(
    () => ({
      colorScheme,
      navigationTheme: colorScheme === 'dark' ? darkNavigationTheme : lightNavigationTheme,
      theme: colorScheme === 'dark' ? darkTheme : lightTheme,
    }),
    [colorScheme],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(AppThemeContext);

  if (!value) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return value;
}
