import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
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

export function AnimatedSplash({
  onFinished,
}: {
  onFinished: () => void;
}) {
  /*
   * =========================================================
   * INITIAL STATE
   * =========================================================
   *
   * The native Android splash already shows the V Drive logo.
   *
   * Therefore, when React Native takes over:
   *
   *   - logo is already fully visible
   *   - no vertical movement
   *   - no logo scaling
   *
   * This makes the handoff much smoother.
   */
  const contentOpacity =
    useSharedValue(1);

  const contentTranslateY =
    useSharedValue(0);

  const logoScale =
    useSharedValue(1);

  /*
   * Ring rotation.
   */
  const ringOffset = useSharedValue(RING_CIRCUMFERENCE);

  const screenOpacity =
    useSharedValue(1);

  useEffect(() => {
    /*
     * =========================================================
     * LOGO
     * =========================================================
     *
     * The logo doesn't jump when native splash hands over.
     */
    contentOpacity.value = withTiming(1, {
      duration: 120,
      easing: Easing.linear,
    });

    contentTranslateY.value = withTiming(0, {
      duration: 120,
      easing: Easing.linear,
    });

    logoScale.value = withTiming(1, {
      duration: 120,
      easing: Easing.linear,
    });

    /*
     * =========================================================
     * BLUE RING
     * =========================================================
     *
     * Draw the blue ring once around the logo.
     */
    ringOffset.value = withDelay(
      180,
      withTiming(0, {
        duration: 1_250,
        easing: Easing.out(Easing.cubic),
      }),
    );

    /*
     * =========================================================
     * SPLASH EXIT
     * =========================================================
     *
     * Keep your existing 2.5 second duration.
     */
    screenOpacity.value = withDelay(
      2_500,
      withTiming(
        0,
        {
          duration: 360,
          easing: Easing.inOut(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(onFinished)();
          }
        },
      ),
    );
  }, [
    contentOpacity,
    contentTranslateY,
    logoScale,
    onFinished,
    ringOffset,
    screenOpacity,
  ]);

  /*
   * ===========================================================
   * CONTENT STYLE
   * ===========================================================
   */
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,

    transform: [
      {
        translateY:
          contentTranslateY.value,
      },
    ],
  }));

  /*
   * ===========================================================
   * LOGO STYLE
   * ===========================================================
   */
  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: logoScale.value,
      },
    ],
  }));

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: ringOffset.value,
  }));

  /*
   * ===========================================================
   * SCREEN FADE
   * ===========================================================
   */
  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View
      onLayout={() =>
        void SplashScreen.hideAsync()
      }
      pointerEvents="auto"
      style={[
        styles.screen,
        screenStyle,
      ]}
    >
      {/* ======================================================= */}
      {/* BACKGROUND                                             */}
      {/* ======================================================= */}

      <LinearGradient
        colors={[
          '#F7FBFF',
          '#E8F4FF',
          '#FDFEFF',
        ]}
        end={{
          x: 1,
          y: 1,
        }}
        start={{
          x: 0,
          y: 0,
        }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.content,
          contentStyle,
        ]}
      >
        {/* ===================================================== */}
        {/* RING + CENTER LOGO                                   */}
        {/* ===================================================== */}

        <View style={styles.ringWrap}>

          {/* =================================================== */}
          {/* ANIMATED THREE-COLOR RING                          */}
          {/* =================================================== */}

          <Svg
            height={RING_SIZE}
            style={styles.ring}
            width={RING_SIZE}
          >
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

          {/* =================================================== */}
          {/* CENTER LOGO                                         */}
          {/* =================================================== */}

          <Animated.View
            style={logoStyle}
          >
            <Image
              accessibilityLabel="Vensar"
              contentFit="contain"
              source={require('../../../assets/vdrive-center-logo.png')}
              style={styles.logo}
            />
          </Animated.View>
        </View>

        {/* ===================================================== */}
        {/* V DRIVE BY VENSAR                                    */}
        {/* ===================================================== */}

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
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },

  logo: {
    height: 152,
    width: 190,
  },

  ring: {
    height: RING_SIZE,
    position: 'absolute',
    width: RING_SIZE,
  },

  ringWrap: {
    alignItems: 'center',
    height: RING_SIZE,
    justifyContent: 'center',
    width: RING_SIZE,
  },

  screen: {
    alignItems: 'center',
    backgroundColor: '#F7FBFF',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 9999,
  },

 vDriveLogo: {
  aspectRatio: 1450 / 440,
  marginTop: 20,
  maxWidth: '100%',
  width: 245,
},
});