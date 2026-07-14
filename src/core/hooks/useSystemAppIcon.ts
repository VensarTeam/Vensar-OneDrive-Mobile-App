import { useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';
import {
  getAppIconName,
  setAlternateAppIcon,
  supportsAlternateIcons,
} from 'expo-alternate-app-icons';

export function useSystemAppIcon() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS !== 'android' || !supportsAlternateIcons) return;

    const desiredIcon = colorScheme === 'dark' ? 'Dark' : null;
    if (getAppIconName() === desiredIcon) return;

    setAlternateAppIcon(desiredIcon).catch((error: unknown) => {
      console.warn('Unable to synchronize the launcher icon with the system theme.', error);
    });
  }, [colorScheme]);
}
