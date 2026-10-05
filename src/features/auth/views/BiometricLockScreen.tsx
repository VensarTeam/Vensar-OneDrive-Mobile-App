import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

import { useAppTheme } from '../../../core/theme';
import { fontFamilies } from '../../../core/theme/typography';
import { useAuthSession } from '../services/auth-session-provider';

export function BiometricLockScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  const {
    isUnlocking,
    lockError,
    unlock,
  } = useAuthSession();

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* BACKGROUND WATERMARK */}
      <Image
        source={require('../../../../assets/app-mark-watermark.png')}
        resizeMode="contain"
        style={styles.watermark}
      />

      {/* CENTER CONTENT */}
      <View style={styles.centerContainer}>
        {/* LOCK ICON + TITLE */}
        <View style={styles.content}>
          <View
            style={[
              styles.iconShell,
              {
                backgroundColor: theme.colors.surfaceMuted,
              },
            ]}
          >
            <MaterialCommunityIcons
              color="#04285C"
              name="lock-outline"
              size={52}
            />
          </View>

          <View style={styles.copy}>
            <Text
              style={[
                styles.title,
                {
                  color: '#04285C',
                },
              ]}
            >
              V Drive Locked
            </Text>

            {lockError ? (
              <Text
                accessibilityLiveRegion="polite"
                style={[
                  styles.error,
                  {
                    color: theme.colors.danger,
                  },
                ]}
              >
                {lockError}
              </Text>
            ) : null}
          </View>
        </View>

        {/* UNLOCK BUTTON */}
        <Pressable
          accessibilityLabel="Unlock"
          accessibilityRole="button"
          disabled={isUnlocking}
          onPress={() => void unlock()}
          style={({ pressed }) => [
            styles.unlockButton,
            {
              backgroundColor: pressed
                ? '#032147'
                : '#04285C',
            },
          ]}
        >
          {isUnlocking ? (
            <ActivityIndicator
              color={theme.colors.onPrimary}
            />
          ) : (
            <Text
              style={[
                styles.unlockText,
                {
                  color: theme.colors.onPrimary,
                },
              ]}
            >
              Unlock
            </Text>
          )}
        </Pressable>
      </View>

      {/* APP VERSION */}
      <Text style={styles.versionText}>
        Version {Constants.expoConfig?.version ?? '1.0.0'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 28,
    overflow: 'hidden',
  },

  watermark: {
    position: 'absolute',
    width: 430,
    height: 430,
    alignSelf: 'center',
    top: '50%',
    marginTop: -215,
    opacity: 0.20,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 70,
    width: '100%',
    transform: [{ translateY: -30 }],
  },

  content: {
    alignItems: 'center',
    gap: 44,
  },

  copy: {
    alignItems: 'center',
    gap: 10,
  },

  error: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 330,
    textAlign: 'center',
  },

  iconShell: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 32,
    height: 112,
    justifyContent: 'center',
    width: 112,
  },

  unlockButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 20,
    width: '100%',
  },

  unlockText: {
    fontFamily: fontFamilies.semibold,
    fontSize: 16,
  },

  title: {
    fontFamily: fontFamilies.bold,
    fontSize: 27,
    lineHeight: 34,
    textAlign: 'center',
  },

  versionText: {
    alignSelf: 'center',
    color: '#7A8795',
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    marginBottom: 4,
  },
});