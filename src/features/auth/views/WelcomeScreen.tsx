import React, { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const KNOB_SIZE = 48;

export function WelcomeScreen() {
  const navigation = useNavigation();

  const sliderWidthRef = useRef(0);

  const sliderPosition = useRef(
    new Animated.Value(0),
  ).current;

  const sliderProgress = useRef(
    new Animated.Value(0),
  ).current;

  // Reset the slider every time the Welcome screen becomes active again.
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      sliderPosition.stopAnimation();
      sliderProgress.stopAnimation();

      sliderPosition.setValue(0);
      sliderProgress.setValue(0);
    });

    return unsubscribe;
  }, [navigation, sliderPosition, sliderProgress]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gestureState) => {
        const maxPosition = Math.max(
          0,
          sliderWidthRef.current - KNOB_SIZE - 12,
        );

        const position = Math.max(
          0,
          Math.min(gestureState.dx, maxPosition),
        );

        const progress =
          maxPosition > 0
            ? position / maxPosition
            : 0;

        sliderPosition.setValue(position);
        sliderProgress.setValue(progress);
      },

      onPanResponderRelease: (_, gestureState) => {
        const maxPosition = Math.max(
          0,
          sliderWidthRef.current - KNOB_SIZE - 12,
        );

        const threshold = maxPosition * 0.75;

        if (gestureState.dx >= threshold) {
          Animated.parallel([
            Animated.spring(sliderPosition, {
              toValue: maxPosition,
              useNativeDriver: true,
              damping: 18,
              stiffness: 180,
              mass: 0.7,
            }),

            Animated.spring(sliderProgress, {
              toValue: 1,
              useNativeDriver: true,
              damping: 18,
              stiffness: 180,
              mass: 0.7,
            }),
          ]).start(() => {
            navigation.navigate('PrivacyPolicy' as never);
          });
        } else {
          Animated.parallel([
            Animated.spring(sliderPosition, {
              toValue: 0,
              useNativeDriver: true,
              damping: 18,
              stiffness: 180,
              mass: 0.7,
            }),

            Animated.spring(sliderProgress, {
              toValue: 0,
              useNativeDriver: true,
              damping: 18,
              stiffness: 180,
              mass: 0.7,
            }),
          ]).start();
        }
      },
    }),
  ).current;

  return (
    <View style={styles.container}>
      {/* Background decorations */}
      <View style={styles.blueCircleTop} />
      <View style={styles.blueCircleLeft} />
      <View style={styles.peachCircleRight} />
      <View style={styles.blueCircleBottom} />

      <View style={styles.content}>
        <Image
          source={require('../../../../assets/vensar-company-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Image
          source={require('../../../../assets/vdrive-center-logo.png')}
          style={styles.centerLogo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          <Text style={styles.welcomeText}>
            Welcome to{'\n'}
          </Text>

          <Text style={styles.vText}>V</Text>

          <Text style={styles.driveText}> Drive</Text>
        </Text>

        <Text style={styles.description}>
          Secure Your Work.
          {'\n'}
          Accelerate Your Progress.
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <View
          style={styles.sliderContainer}
          onLayout={event => {
            sliderWidthRef.current =
              event.nativeEvent.layout.width;
          }}
        >
          <LinearGradient
            colors={['#6EC8F4', '#5B93E6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sliderTrack}
          >
            {/* Reverse gradient fades in as the slider moves */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.gradientOverlay,
                {
                  opacity: sliderProgress,
                },
              ]}
            >
              <LinearGradient
                colors={['#5B93E6', '#6EC8F4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.reverseGradient}
              />
            </Animated.View>

            <Text style={styles.sliderText}>
              Swipe to get started
            </Text>

            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.sliderKnob,
                {
                  transform: [
                    {
                      translateX: sliderPosition,
                    },
                  ],
                },
              ]}
            >
              <Image
                source={require('../../../../assets/vdrive-center-logo.png')}
                style={styles.sliderLogo}
                resizeMode="contain"
              />
            </Animated.View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FBFF',
    flex: 1,
    overflow: 'hidden',
  },

blueCircleTop: {
  backgroundColor: '#EAF5FF',
  borderRadius: 180,
  height: 360,
  left: -170,
  position: 'absolute',
  top: -145,
  width: 360,
},

blueCircleLeft: {
  backgroundColor: '#F1F8FE',
  borderRadius: 100,
  height: 200,
  left: -90,
  position: 'absolute',
  top: 205,
  width: 200,
},

peachCircleRight: {
  backgroundColor: '#FFF3E8',
  borderRadius: 145,
  height: 290,
  position: 'absolute',
  right: -135,
  top: 430,
  width: 290,
},

blueCircleBottom: {
  backgroundColor: '#EAF5FF',
  borderRadius: 150,
  bottom: -115,
  height: 300,
  left: 50,
  position: 'absolute',
  width: 300,
},
  content: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
  },

  logo: {
    height: 135,
    marginBottom: 95,
    width: 200,
  },

  centerLogo: {
    height: 95,
    marginBottom: 30,
    width: 100,
  },

  title: {
    color: '#092F5F',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 22,
    textAlign: 'center',
  },

  welcomeText: {
    color: '#71839B',
  },

  vText: {
    color: '#F86632',
  },

  driveText: {
    color: '#194897',
  },

  description: {
    color: '#71839B',
    fontSize: 17,
    lineHeight: 28,
    textAlign: 'center',
  },

  bottomSection: {
    paddingBottom: 34,
    paddingHorizontal: 32,
  },

  sliderContainer: {
    height: 68,
    marginBottom: 24,
    width: '100%',
  },

  sliderTrack: {
    borderRadius: 24,
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 4,
  },

  gradientOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  reverseGradient: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  sliderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  sliderKnob: {
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderRadius: 21,
  elevation: 4,
  height: 42,
  justifyContent: 'center',
  left: 6,
  position: 'absolute',
  shadowColor: '#194897',
  shadowOffset: {
    height: 2,
    width: 0,
  },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  top: 13,
  width: 42,
},

  sliderLogo: {
    height: 35,
    width: 35,
  },
});