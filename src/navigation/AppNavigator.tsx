import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

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

import {
  NotificationsScreen,
} from '../features/notifications/views/NotificationsScreen';

import {
  AccessRequestsScreen,
} from '../features/access-requests/views/AccessRequestsScreen';

import {
  BiometricLockScreen,
} from '../features/auth/views/BiometricLockScreen';

import {
  useAuthSession,
} from '../features/auth/services/auth-session-provider';

import type {
  RootStackParamList,
} from './routes';

import { HomeTabs } from './HomeTabs';


const Stack =
  createNativeStackNavigator<RootStackParamList>();


const ONBOARDING_COMPLETED_KEY =
  'vdrive_onboarding_completed';


export function AppNavigator() {

  const {
    navigationTheme,
    theme,
  } = useAppTheme();


  const {
    isHydrating,
    isAuthenticated,
    isLocked,
  } = useAuthSession();


  const [
    isOnboardingHydrating,
    setIsOnboardingHydrating,
  ] = useState(true);


  const [
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
  ] = useState(false);


  /* ======================================================= */
  /* LOAD ONBOARDING STATUS */
  /* ======================================================= */

  useEffect(() => {

    const loadOnboardingStatus =
      async () => {

        try {

          const completed =
            await SecureStore.getItemAsync(
              ONBOARDING_COMPLETED_KEY,
            );


          setHasCompletedOnboarding(
            completed === 'true',
          );

        } catch (error) {

          console.error(
            'Failed to load onboarding status:',
            error,
          );

        } finally {

          setIsOnboardingHydrating(
            false,
          );
        }
      };


    loadOnboardingStatus();

  }, []);


  /* ======================================================= */
  /* LOADING */
  /* ======================================================= */

  if (
    isHydrating ||
    isOnboardingHydrating
  ) {

    return (
      <View
        style={[
          styles.loading,
          {
            backgroundColor:
              theme.colors.background,
          },
        ]}
      >
        <ActivityIndicator
          color={
            theme.colors.primary
          }
        />
      </View>
    );
  }


  /* ======================================================= */
  /* BIOMETRIC LOCK */
  /* ======================================================= */

  /*
   * If a valid session exists but the app is locked,
   * show the biometric lock screen instead of Home.
   *
   * This happens when:
   *
   * 1. The app is completely closed and reopened.
   * 2. The app was backgrounded for 5+ minutes.
   *
   * After successful biometric authentication,
   * isLocked becomes false and the normal navigator
   * is rendered.
   */
  if (
    isAuthenticated &&
    isLocked
  ) {
    return (
      <BiometricLockScreen />
    );
  }


  /* ======================================================= */
  /* NAVIGATION STATE */
  /* ======================================================= */

  /*
   * Rebuild the navigation tree whenever authentication
   * state changes.
   *
   * Authenticated  -> Home
   * Logged out     -> Login
   * First install  -> Welcome
   */
  const navigationKey =
    isAuthenticated
      ? 'authenticated'
      : hasCompletedOnboarding
        ? 'unauthenticated'
        : 'onboarding';


  const initialRouteName =
    isAuthenticated
      ? 'Home'
      : hasCompletedOnboarding
        ? 'Login'
        : 'Welcome';


  /* ======================================================= */
  /* NAVIGATION */
  /* ======================================================= */

  return (
    <NavigationContainer
      key={navigationKey}
      theme={navigationTheme}
    >
      <Stack.Navigator
        initialRouteName={
          initialRouteName
        }
        screenOptions={{
          contentStyle: {
            backgroundColor:
              theme.colors.background,
          },

          headerShadowVisible:
            false,

          headerBackButtonDisplayMode:
            'minimal',
        }}
      >

        {/* ================================================= */}
        {/* ONBOARDING */}
        {/* ================================================= */}

        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="PrivacyPolicyDetail"
          component={
            PrivacyPolicyDetailScreen
          }
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="TermsConditionsDetail"
          component={
            TermsConditionsDetailScreen
          }
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="ContactSupport"
          component={
            ContactSupportScreen
          }
          options={{
            headerShown: false,
          }}
        />


        {/* ================================================= */}
        {/* AUTH */}
        {/* ================================================= */}

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Otp"
          component={OtpScreen}
          options={{
            headerShown: false,
            gestureEnabled: true,
          }}
        />


        {/* ================================================= */}
        {/* APP */}
        {/* ================================================= */}

        <Stack.Screen
          name="Home"
          component={HomeTabs}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Notifications"
          component={
            NotificationsScreen
          }
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="AccessRequests"
          component={
            AccessRequestsScreen
          }
          options={{
            headerShown: false,
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}


/* ========================================================= */
/* STYLES */
/* ========================================================= */

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});