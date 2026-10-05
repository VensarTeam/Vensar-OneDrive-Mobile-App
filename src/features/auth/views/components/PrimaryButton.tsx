import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '../../../../core/theme';
import { fontFamilies } from '../../../../core/theme/typography';

type PrimaryButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  title: string;
};

const buttonHeight = 56;

export function PrimaryButton({
  disabled,
  loading = false,
  onPress,
  title,
}: PrimaryButtonProps) {
  const [availableWidth, setAvailableWidth] = useState(0);

  const progress = useSharedValue(loading ? 1 : 0);

  useAppTheme();

  useEffect(() => {
    progress.value = withTiming(loading ? 1 : 0, {
      duration: 320,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [loading, progress]);

  const buttonStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(
      progress.value,
      [0, 1],
      [15, buttonHeight / 2],
    ),

    width: interpolate(
      progress.value,
      [0, 1],
      [
        availableWidth || buttonHeight,
        buttonHeight,
      ],
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));

  return (
    <View
      onLayout={(event) =>
        setAvailableWidth(event.nativeEvent.layout.width)
      }
      style={styles.track}
    >
      <Animated.View
        style={[
          styles.animatedButton,
          {
            backgroundColor: disabled
              ? '#6194CC'
              : '#4D89ED',

            opacity: disabled ? 0.72 : 1,

            shadowColor: '#0E315B',
            shadowOffset: {
              width: 0,
              height: 7,
            },
            shadowOpacity: 0.18,
            shadowRadius: 12,

            elevation: 6,
          },
          buttonStyle,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          disabled={disabled || loading}
          onPress={onPress}
          style={({ pressed }) => [
            styles.pressable,
            {
              backgroundColor: pressed
                ? '#417BD7'
                : 'transparent',
            },
          ]}
        >
          <Animated.View style={labelStyle}>
            <Text
              numberOfLines={1}
              style={styles.text}
            >
              {title}
            </Text>
          </Animated.View>

          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
              size="small"
              style={styles.spinner}
            />
          ) : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    alignItems: 'center',
    height: buttonHeight,
    width: '100%',
  },

  animatedButton: {
    height: buttonHeight,
    overflow: 'hidden',
  },

  pressable: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },

  spinner: {
    position: 'absolute',
  },

  text: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.semibold,
    fontSize: 16,
    paddingHorizontal: 24,
  },
});