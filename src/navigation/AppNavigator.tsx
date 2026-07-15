import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppTheme } from '../core/theme/AppThemeProvider';
import { LoginScreen } from '../features/auth/views/LoginScreen';
import { OtpScreen } from '../features/auth/views/OtpScreen';
import { BiometricLockScreen } from '../features/auth/views/BiometricLockScreen';
import { useAuthSession } from '../features/auth/services/auth-session-provider';
import type { RootStackParamList } from './routes';
import { HomeTabs } from './HomeTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { navigationTheme, theme } = useAppTheme();
  const { isAuthenticated, isHydrating, isLocked } = useAuthSession();

  if (isHydrating) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (isAuthenticated && isLocked) {
    return <BiometricLockScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Home' : 'Login'}
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Otp"
          component={OtpScreen}
          options={{ headerShown: false, gestureEnabled: true }}
        />
        <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
