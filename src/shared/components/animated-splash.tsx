import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '../../core/theme';

export function AnimatedSplash({ onFinished }: { onFinished: () => void }) {
  const { colorScheme, theme } = useAppTheme();
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.96);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    screenOpacity.value = withDelay(2_700, withTiming(0, { duration: 300, easing: Easing.inOut(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(onFinished)();
    }));
  }, [logoOpacity, logoScale, onFinished, screenOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const screenStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));

  return (
    <Animated.View pointerEvents="auto" style={[styles.screen, { backgroundColor: theme.colors.background }, screenStyle]}>
      <Animated.View
        style={[
          styles.logoSurface,
          colorScheme === 'dark' && styles.logoSurfaceDark,
          logoStyle,
        ]}
      >
        <Image
          accessibilityLabel="V Drive by Vensar"
          contentFit="contain"
          source={
            colorScheme === 'dark'
              ? require('../../../assets/onedrive-vensar-dark.png')
              : require('../../../assets/onedrive-vensar-light.png')
          }
          style={styles.logo}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  logo: { height: 190, width: 190 },
  logoSurface: { alignItems: 'center', justifyContent: 'center' },
  logoSurfaceDark: { backgroundColor: '#020713', borderColor: 'rgba(96, 165, 250, 0.22)', borderCurve: 'continuous', borderRadius: 32, borderWidth: 1, boxShadow: '0 18px 52px rgba(0, 0, 0, 0.38)', overflow: 'hidden', padding: 8 },
  screen: { alignItems: 'center', bottom: 0, justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0, zIndex: 9999 },
});
