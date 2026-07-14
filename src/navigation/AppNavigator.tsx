import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppTheme } from '../core/theme/AppThemeProvider';
import { LoginScreen } from '../features/auth/views/LoginScreen';
import { OtpScreen } from '../features/auth/views/OtpScreen';
import type { RootStackParamList } from './routes';
import { HomeTabs } from './HomeTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { navigationTheme, theme } = useAppTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Login"
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
