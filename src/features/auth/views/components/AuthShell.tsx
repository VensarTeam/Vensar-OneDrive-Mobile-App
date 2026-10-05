import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useResponsiveLayout } from '../../../../core/responsive';
import { useAppTheme } from '../../../../core/theme';
import { fontFamilies } from '../../../../core/theme/typography';

type AuthShellProps = PropsWithChildren<{
  subtitle: string;
  title: string;
}>;

export function AuthShell({
  children,
  subtitle,
  title,
}: AuthShellProps) {
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveLayout();
  const { colorScheme, theme } = useAppTheme();
  const { colors } = theme;

  const isDark = colorScheme === 'dark';

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'android' ? 'height' : 'padding'}
      enabled
      keyboardVerticalOffset={0}
      style={styles.flex}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets={process.env.EXPO_OS === 'ios'}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, 24),
            paddingHorizontal: responsive.isCompact ? 20 : 32,
            paddingTop: Math.max(insets.top, 20),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode={
          process.env.EXPO_OS === 'ios' ? 'interactive' : 'on-drag'
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{
          backgroundColor: isDark ? colors.background : '#EEF6FB',
        }}
      >
        {/* Soft background shapes */}
        <View
          pointerEvents="none"
          style={[
            styles.backgroundShape,
            styles.shapeTop,
            {
              backgroundColor: isDark
                ? 'rgba(96, 165, 250, 0.08)'
                : 'rgba(91, 173, 225, 0.14)',
            },
          ]}
        />

        <View
          pointerEvents="none"
          style={[
            styles.backgroundShape,
            styles.shapeBottom,
            {
              backgroundColor: isDark
                ? 'rgba(37, 99, 235, 0.07)'
                : 'rgba(70, 145, 205, 0.10)',
            },
          ]}
        />

        <View
          pointerEvents="none"
          style={[
            styles.backgroundShape,
            styles.shapeSide,
            {
              backgroundColor: isDark
                ? 'rgba(96, 165, 250, 0.045)'
                : 'rgba(255, 255, 255, 0.72)',
            },
          ]}
        />

        <Animated.View
  entering={FadeInUp.duration(520)
    .springify()
    .damping(18)}
  style={styles.content}
>
  {/* Logo */}
  <View style={styles.brandLockup}>
    <Image
      accessibilityLabel="V Drive by Vensar"
      contentFit="contain"
      source={
        isDark
          ? require('../../../../../assets/onedrive-vensar-dark.png')
          : require('../../../../../assets/onedrive-vensar-light.png')
      }
      style={styles.logo}
    />
  </View>

  {/* Heading */}
  <View style={styles.heading}>
    <Text
      accessibilityRole="header"
      style={[
        styles.title,
        {
          color: colors.text,
        },
      ]}
    >
      {title}
    </Text>

    <Text
      selectable
      style={[
        styles.subtitle,
        {
          color: colors.textMuted,
        },
      ]}
    >
      {subtitle}
    </Text>
  </View>

  {/* Form card */}
  <View
    style={[
      styles.card,
      {
        backgroundColor: colors.surface,
        borderColor: isDark
          ? colors.border
          : 'rgba(128, 160, 185, 0.28)',
        paddingHorizontal: responsive.isCompact ? 28 : 44,
        boxShadow: isDark
          ? '0 18px 55px rgba(0, 0, 0, 0.35)'
          : '0 18px 50px rgba(44, 89, 120, 0.12)',
      },
    ]}
  >
    <View style={styles.form}>
      {children}
    </View>
  </View>
</Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },

  content: {
    maxWidth: 510,
    width: '100%',
  },

  card: {
  borderCurve: 'continuous',
  borderRadius: 30,
  borderWidth: 1,
  paddingBottom: 30,
  paddingTop: 30,
},

brandLockup: {
  alignItems: 'center',
  alignSelf: 'center',
  height: 112,
  justifyContent: 'center',
  width: 112,
},

logo: {
  height: 112,
  width: 112,
},

heading: {
  alignItems: 'center',
  gap: 6,
  paddingHorizontal: 4,
  paddingBottom: 22,
  paddingTop: 8,
},

  title: {
    fontFamily: fontFamilies.bold,
    fontSize: 32,
    letterSpacing: -1,
    lineHeight: 40,
    textAlign: 'center',
  },

  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 390,
    textAlign: 'center',
  },

 form: {
  gap: 20,
},

  /*
   * Background decoration
   */

  backgroundShape: {
    borderRadius: 999,
    position: 'absolute',
  },

  shapeTop: {
    height: 420,
    left: -210,
    top: -190,
    width: 420,
  },

  shapeBottom: {
    bottom: -230,
    height: 480,
    right: -250,
    width: 480,
  },

  shapeSide: {
    height: 330,
    right: -185,
    top: 90,
    width: 330,
  },
});