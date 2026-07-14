import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../core/theme';
import { fontFamilies } from '../core/theme/typography';
import { HomeScreen } from '../features/home/views/HomeScreen';
import { PlaceholderScreen } from '../features/home/views/PlaceholderScreen';
import { ProfileScreen } from '../features/profile/views/ProfileScreen';

export type HomeTabParamList = {
  Dashboard: undefined;
  Files: undefined;
  Shared: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<HomeTabParamList>();

const tabIcons: Record<keyof HomeTabParamList, { active: string; inactive: string }> = {
  Dashboard: { active: 'home-variant', inactive: 'home-variant-outline' },
  Files: { active: 'folder', inactive: 'folder-outline' },
  Shared: { active: 'account-multiple', inactive: 'account-multiple-outline' },
  Profile: { active: 'account-circle', inactive: 'account-circle-outline' },
};

export function HomeTabs() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, focused, size }) => (
          <Icon color={color} size={size} source={tabIcons[route.name][focused ? 'active' : 'inactive']} />
        ),
        tabBarLabelStyle: { fontFamily: fontFamilies.semibold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 58 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 7,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Files">
        {() => <PlaceholderScreen description="Your available OneDrive files will appear here in read-only mode." icon="folder-outline" title="Files" />}
      </Tab.Screen>
      <Tab.Screen name="Shared">
        {() => <PlaceholderScreen description="Files shared with your account will appear here." icon="account-multiple-outline" title="Shared" />}
      </Tab.Screen>
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
