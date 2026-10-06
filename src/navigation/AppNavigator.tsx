import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  NavigationContainer,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import { useAppTheme } from '../core/theme/AppThemeProvider';
import { LoginScreen } from '../features/auth/views/LoginScreen';
import { PrivacyPolicyScreen } from '../features/auth/views/PrivacyPolicyScreen';
import { PrivacyPolicyDetailScreen } from '../features/auth/views/PrivacyPolicyDetailScreen';
import {
  TermsConditionsDetailScreen,
} from '../features/auth/views/TermsConditionsDetailScreen';
import {
  ContactSupportScreen,
} from '../features/auth/views/ContactSupportScreen';
import { WelcomeScreen } from '../features/auth/views/WelcomeScreen';
import { OtpScreen } from '../features/auth/views/OtpScreen';
import { NotificationsScreen } from '../features/notifications/views/NotificationsScreen';
import { AccessRequestsScreen } from '../features/access-requests/views/AccessRequestsScreen';
import { useAuthSession } from '../features/auth/services/auth-session-provider';
import type { RootStackParamList } from './routes';
import { HomeTabs } from './HomeTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { navigationTheme, theme } = useAppTheme();
  const { isHydrating } = useAuthSession();

  if (isHydrating) {
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen
  name="Welcome"
  component={WelcomeScreen}
  options={{ headerShown: false }}
/>

<Stack.Screen
  name="PrivacyPolicy"
  component={PrivacyPolicyScreen}
  options={{ headerShown: false }}
/>

<Stack.Screen
  name="PrivacyPolicyDetail"
  component={PrivacyPolicyDetailScreen}
  options={{ headerShown: false }}
/>

<Stack.Screen
  name="TermsConditionsDetail"
  component={TermsConditionsDetailScreen}
  options={{ headerShown: false }}
/>

<Stack.Screen
  name="ContactSupport"
  component={ContactSupportScreen}
  options={{ headerShown: false }}
/>

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Otp"
          component={OtpScreen}
          options={{
            headerShown: false,
            gestureEnabled: true,
          }}
        />

        <Stack.Screen
          name="Home"
          component={HomeTabs}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="AccessRequests"
          component={AccessRequestsScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});