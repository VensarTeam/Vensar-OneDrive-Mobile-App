import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import type { Theme } from '@react-navigation/native';

import { getPreference, setPreference } from '../storage/preferencesStore';
import { darkNavigationTheme, lightNavigationTheme } from './navigationTheme';
import { darkTheme, lightTheme } from './theme';
import type { AppColorScheme, AppTheme } from './types';

type AppThemeContextValue = {
  colorScheme: AppColorScheme;
  navigationTheme: Theme;
  setColorScheme: (scheme: AppColorScheme) => void;
  theme: AppTheme;
};

const colorSchemePreferenceKey = 'appearance.color-scheme';
const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const systemDefault: AppColorScheme = systemColorScheme === 'dark' ? 'dark' : 'light';
  const [colorScheme, setColorSchemeState] = useState<AppColorScheme>(systemDefault);

  useEffect(() => {
    let isMounted = true;
    void getPreference(colorSchemePreferenceKey)
      .then((storedPreference) => {
        if (isMounted && (storedPreference === 'light' || storedPreference === 'dark')) {
          setColorSchemeState(storedPreference);
        }
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, []);

  const setColorScheme = useCallback((scheme: AppColorScheme) => {
    setColorSchemeState(scheme);
    void setPreference(colorSchemePreferenceKey, scheme).catch(() => undefined);
  }, []);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      colorScheme,
      navigationTheme: colorScheme === 'dark' ? darkNavigationTheme : lightNavigationTheme,
      setColorScheme,
      theme: colorScheme === 'dark' ? darkTheme : lightTheme,
    }),
    [colorScheme, setColorScheme],
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
