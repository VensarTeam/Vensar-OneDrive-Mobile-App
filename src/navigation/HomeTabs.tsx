import { StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../core/theme';
import { fontFamilies } from '../core/theme/typography';
import { HomeScreen } from '../features/home/views/HomeScreen';
import { DriveScreen } from '../features/drive/views/drive-screen';
import { SharedScreen } from '../features/drive/views/shared-screen';
import { ProfileScreen } from '../features/profile/views/ProfileScreen';

export type HomeTabParamList = {
  Dashboard: undefined;
  Files: {
    folderId?: string;
    folderName?: string;
    projectId?: string;
    permission?: 'admin' | 'editor' | 'viewer';
    serviceId?: string;
    serviceName?: string;
  } | undefined;
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

function TabIcon({ color, focused, route }: { color: string; focused: boolean; route: keyof HomeTabParamList }) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.iconPill,
        { backgroundColor: focused ? `${theme.colors.primary}18` : 'transparent' },
      ]}
    >
      <Icon
        color={color}
        size={focused ? 24 : 23}
        source={tabIcons[route][focused ? 'active' : 'inactive']}
      />
    </View>
  );
}

function TabButton(props: BottomTabBarButtonProps) {
  const { theme } = useAppTheme();

  return (
    <PlatformPressable
      {...props}
      hoverEffect={{ color: `${theme.colors.primary}12`, hoverOpacity: 1 }}
      pressColor={`${theme.colors.primary}18`}
      pressOpacity={0.76}
      style={[props.style, styles.tabButton]}
    />
  );
}

export function HomeTabs() {
  const insets = useSafeAreaInsets();
  const { colorScheme, theme } = useAppTheme();
  const { colors } = theme;

  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, focused }) => (
          <TabIcon color={color} focused={focused} route={route.name} />
        ),
        tabBarLabel: ({ color, focused, children }) => (
          <Text
            style={[
              styles.label,
              {
                color,
                fontFamily: focused ? fontFamilies.bold : fontFamilies.semibold,
                opacity: focused ? 1 : 0.78,
              },
            ]}
          >
            {children}
          </Text>
        ),
        tabBarHideOnKeyboard: true,
        tabBarButton: (props) => <TabButton {...props} />,
        tabBarItemStyle: styles.tabItem,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: StyleSheet.hairlineWidth,
          boxShadow: colorScheme === 'dark' ? '0 -8px 30px rgba(0, 0, 0, 0.34)' : '0 -8px 30px rgba(15, 23, 42, 0.09)',
          height: 68 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 9),
          paddingHorizontal: 10,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Files" component={DriveScreen} />
      <Tab.Screen name="Shared" component={SharedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabButton: { borderCurve: 'continuous', borderRadius: 18, overflow: 'hidden' },
  tabItem: { borderRadius: 18, paddingVertical: 2 },
  iconPill: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 16,
    height: 31,
    justifyContent: 'center',
    width: 48,
  },
  label: { fontSize: 10.5, letterSpacing: 0.1, lineHeight: 14 },
});
