import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppTheme } from '../core/theme/AppThemeProvider';
import { HomeScreen } from '../features/home/views/HomeScreen';
import type { RootStackParamList } from './routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { navigationTheme, theme } = useAppTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'OneDrive Vensar' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
