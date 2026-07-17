import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useAppTheme } from '../../../../core/theme';
import { fontFamilies } from '../../../../core/theme/typography';

type PrimaryButtonProps = { disabled?: boolean; loading?: boolean; onPress: () => void; title: string };

const buttonHeight = 54;

export function PrimaryButton({ disabled, loading = false, onPress, title }: PrimaryButtonProps) {
  const [availableWidth, setAvailableWidth] = useState(0);
  const progress = useSharedValue(loading ? 1 : 0);
  const { colorScheme, theme } = useAppTheme();
  const { colors } = theme;

  useEffect(() => {
    progress.value = withTiming(loading ? 1 : 0, {
      duration: 320,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [loading, progress]);

  const buttonStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(progress.value, [0, 1], [12, buttonHeight / 2]),
    width: interpolate(progress.value, [0, 1], [availableWidth || buttonHeight, buttonHeight]),
  }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));

  return (
    <View onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width)} style={styles.track}>
      <Animated.View style={[styles.animatedButton, { backgroundColor: colors.primary, boxShadow: colorScheme === 'dark' ? '0 10px 24px rgba(0, 0, 0, 0.34)' : '0 10px 24px rgba(0, 120, 212, 0.24)', opacity: disabled ? 0.45 : 1 }, buttonStyle]}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled || loading}
          onPress={onPress}
          style={({ pressed }) => [styles.pressable, { backgroundColor: pressed ? colors.primaryPressed : 'transparent' }]}
        >
          <Animated.View style={labelStyle}>
            <Text numberOfLines={1} style={[styles.text, { color: colors.onPrimary }]}>{title}</Text>
          </Animated.View>
          {loading ? <ActivityIndicator color={colors.onPrimary} style={styles.spinner} /> : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { alignItems: 'center', height: buttonHeight, width: '100%' },
  animatedButton: { height: buttonHeight, overflow: 'hidden' },
  pressable: { alignItems: 'center', height: '100%', justifyContent: 'center', width: '100%' },
  spinner: { position: 'absolute' },
  text: { fontFamily: fontFamilies.semibold, fontSize: 16, paddingHorizontal: 24 },
});
