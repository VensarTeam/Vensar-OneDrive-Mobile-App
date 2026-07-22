import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const RING_SIZE = 228;
const RING_STROKE = 9;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function AnimatedSplash({ onFinished }: { onFinished: () => void }) {
  const contentOpacity = useSharedValue(0.18);
  const contentTranslateY = useSharedValue(18);
  const glowOpacity = useSharedValue(0.12);
  const logoScale = useSharedValue(1.28);
  const ringOffset = useSharedValue(RING_CIRCUMFERENCE);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    contentOpacity.value = withTiming(1, {
      duration: 650,
      easing: Easing.out(Easing.quad),
    });
    contentTranslateY.value = withTiming(0, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
    glowOpacity.value = withTiming(0.3, {
      duration: 900,
      easing: Easing.out(Easing.quad),
    });
    logoScale.value = withTiming(0.92, {
      duration: 1_100,
      easing: Easing.out(Easing.cubic),
    });
    ringOffset.value = withTiming(0, {
      duration: 1_250,
      easing: Easing.out(Easing.cubic),
    });
    screenOpacity.value = withDelay(
      2_150,
      withTiming(0, { duration: 360, easing: Easing.inOut(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(onFinished)();
      }),
    );
  }, [contentOpacity, contentTranslateY, glowOpacity, logoScale, onFinished, ringOffset, screenOpacity]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoScale.value }] }));
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: ringOffset.value }));
  const screenStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));

  return (
    <Animated.View
      onLayout={() => void SplashScreen.hideAsync()}
      pointerEvents="auto"
      style={[styles.screen, screenStyle]}
    >
      <LinearGradient
        colors={['#F7FBFF', '#E8F4FF', '#FDFEFF']}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.View style={[styles.content, contentStyle]}>
        <View style={styles.ringWrap}>
          <Svg height={RING_SIZE} style={styles.ring} width={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              fill="none"
              r={RING_RADIUS}
              stroke="rgba(133, 180, 224, 0.24)"
              strokeWidth={RING_STROKE}
            />
            <AnimatedCircle
              animatedProps={ringProps}
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              fill="none"
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              r={RING_RADIUS}
              rotation="-90"
              stroke="#5EA8E8"
              strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
              strokeLinecap="round"
              strokeWidth={RING_STROKE}
            />
          </Svg>
          <Animated.View style={logoStyle}>
            <Image
              accessibilityLabel="Vensar"
              contentFit="contain"
              source={require('../../../assets/vensar-company-logo.png')}
              style={styles.logo}
            />
          </Animated.View>
        </View>
        <Text numberOfLines={1} style={styles.subtitle}>
          CONSTRUCTIONS COMPANY LIMITED
        </Text>
        <Image
          accessibilityLabel="V Drive by Vensar"
          contentFit="contain"
          source={require('../../../assets/vdrive-by-vensar-splash.png')}
          style={styles.vDriveLogo}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, width: '100%' },
  glow: { backgroundColor: '#C9E7FF', borderRadius: 150, height: 300, position: 'absolute', width: 300 },
  logo: { height: 52, width: 190 },
  ring: { position: 'absolute' },
  ringWrap: { alignItems: 'center', height: RING_SIZE, justifyContent: 'center', width: RING_SIZE },
  screen: { alignItems: 'center', backgroundColor: '#F7FBFF', bottom: 0, justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0, zIndex: 9999 },
  subtitle: { color: '#466B96', fontFamily: 'GoogleSansFlex-Bold', fontSize: 11, letterSpacing: 0.9, lineHeight: 16, paddingTop: 16, textAlign: 'center' },
  vDriveLogo: { aspectRatio: 1450 / 440, marginTop: 10, maxWidth: '100%', width: 328 },
});
