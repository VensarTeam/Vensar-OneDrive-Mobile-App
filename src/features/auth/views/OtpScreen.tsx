import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from 'react-native-paper';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '../../../core/theme';
import { fontFamilies } from '../../../core/theme/typography';
import type { RootStackParamList } from '../../../navigation/routes';
import { useOtpViewModel } from '../viewmodels/useOtpViewModel';
import { AuthShell } from './components/AuthShell';
import { PrimaryButton } from './components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export function OtpScreen({ navigation, route }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [codeWidth, setCodeWidth] = useState(0);
  const verificationProgress = useSharedValue(0);
  const successProgress = useSharedValue(0);
  const { theme } = useAppTheme();
  const { colors } = theme;
  const complete = useCallback(() => navigation.replace('Home'), [navigation]);
  const vm = useOtpViewModel(route.params.identifier, complete);
  const deliveryDestination = [route.params.email, route.params.mobile].filter(Boolean).join(' or ');
  const isVerifying = vm.isAutoVerifying || vm.isSubmitting || vm.isVerified;

  useEffect(() => {
    verificationProgress.value = withTiming(isVerifying ? 1 : 0, {
      duration: isVerifying ? 720 : 260,
      easing: Easing.bezier(0.22, 0.75, 0.18, 1),
    });
  }, [isVerifying, verificationProgress]);

  useEffect(() => {
    successProgress.value = vm.isVerified
      ? withDelay(500, withSpring(1, { damping: 11, mass: 0.7, stiffness: 145 }))
      : withTiming(0, { duration: 140 });
  }, [successProgress, vm.isVerified]);

  const statusCircleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(verificationProgress.value, [0, 0.46, 0.72], [0, 0, 1], 'clamp'),
    transform: [
      { scale: interpolate(verificationProgress.value, [0, 0.46, 0.78, 1], [0.52, 0.52, 1.08, 1], 'clamp') },
      { rotate: `${interpolate(verificationProgress.value, [0.46, 1], [-12, 0], 'clamp')}deg` },
    ],
  }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: successProgress.value,
    transform: [
      { scale: interpolate(successProgress.value, [0, 1], [0.25, 1]) },
      { rotate: `${interpolate(successProgress.value, [0, 1], [-28, 0])}deg` },
    ],
  }));
  const successRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(successProgress.value, [0, 0.2, 1], [0, 0.34, 0]),
    transform: [{ scale: interpolate(successProgress.value, [0, 1], [0.72, 1.55]) }],
  }));
  const trackWidth = codeWidth || 300;
  const digitWidth = Math.min(58, Math.max(38, (trackWidth - 40) / 6));

  return (
    <AuthShell
      subtitle={`Enter the code sent to ${deliveryDestination || route.params.identifier}`}
      title="Verify it’s you"
    >
      <Pressable
        accessibilityLabel="Enter verification code"
        disabled={isVerifying}
        onPress={() => inputRef.current?.focus()}
        style={styles.codeArea}
      >
        <TextInput
          ref={inputRef}
          autoComplete="one-time-code"
          caretHidden
          editable={!isVerifying}
          keyboardType="number-pad"
          maxLength={6}
          onChangeText={vm.setOtp}
          onSubmitEditing={vm.submit}
          style={styles.hiddenInput}
          textContentType="oneTimeCode"
          value={vm.otp}
        />
        <View onLayout={(event) => setCodeWidth(event.nativeEvent.layout.width)} style={styles.codeTrack}>
          {Array.from({ length: 6 }, (_, index) => (
            <OtpDigit
              backgroundColor={colors.surface}
              borderColor={vm.error ? colors.danger : index === vm.otp.length ? colors.primary : colors.border}
              digit={vm.otp[index] ?? ''}
              index={index}
              key={index}
              progress={verificationProgress}
              textColor={colors.text}
              trackWidth={trackWidth}
              width={digitWidth}
            />
          ))}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.statusCircle,
              {
                backgroundColor: vm.isVerified ? `${colors.success}14` : colors.surface,
                borderColor: vm.isVerified ? colors.success : colors.primary,
                boxShadow: vm.isVerified
                  ? `0 8px 24px ${colors.success}30`
                  : `0 8px 24px ${colors.primary}24`,
              },
              statusCircleStyle,
            ]}
          >
            {vm.isVerified ? (
              <>
                <Animated.View style={[styles.successRing, { borderColor: colors.success }, successRingStyle]} />
                <Animated.View style={checkStyle}>
                  <Icon color={colors.success} size={30} source="check-bold" />
                </Animated.View>
              </>
            ) : (
              <ActivityIndicator color={colors.primary} size="small" />
            )}
          </Animated.View>
        </View>
      </Pressable>

      {vm.error ? <Text accessibilityRole="alert" selectable style={[styles.centerText, { color: colors.danger }]}>{vm.error}</Text> : null}

      <View style={styles.expiryRow}>
        {vm.isVerified ? (
          <Text accessibilityLiveRegion="polite" style={[styles.successText, { color: colors.success }]}>Verified successfully</Text>
        ) : vm.isExpired ? (
          <Pressable accessibilityRole="button" hitSlop={10} onPress={() => navigation.goBack()}>
            <Text style={[styles.resendLink, { color: colors.primary }]}> 
              Sign in again for a new code
            </Text>
          </Pressable>
        ) : (
          <Text style={[styles.expiryText, { color: colors.textMuted }]}> 
            Code expires in <Text style={styles.expiryTime}>{vm.formattedTime}</Text>
          </Text>
        )}
      </View>

      <PrimaryButton
        disabled={!vm.canSubmit || isVerifying}
        loading={vm.isSubmitting && !vm.isVerified}
        onPress={vm.submit}
        title={vm.isVerified ? 'Verified successfully' : isVerifying ? 'Verifying…' : 'Verify and continue'}
      />

      <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.backAction}>
        <Text style={[styles.backLink, { color: colors.textMuted }]}>Back to login</Text>
      </Pressable>
    </AuthShell>
  );
}

function OtpDigit({
  backgroundColor,
  borderColor,
  digit,
  index,
  progress,
  textColor,
  trackWidth,
  width,
}: {
  backgroundColor: string;
  borderColor: string;
  digit: string;
  index: number;
  progress: SharedValue<number>;
  textColor: string;
  trackWidth: number;
  width: number;
}) {
  const gap = (trackWidth - (width * 6)) / 5;
  const startLeft = index * (width + gap);
  const centerLeft = (trackWidth - width) / 2;
  const collapseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.64, 0.84], [1, 1, 0], 'clamp'),
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, centerLeft - startLeft]) },
      { translateY: interpolate(progress.value, [0, 0.55, 1], [0, index % 2 === 0 ? -5 : 5, 0]) },
      { scale: interpolate(progress.value, [0, 0.68, 1], [1, 0.82, 0.58]) },
      { rotate: `${interpolate(progress.value, [0, 1], [0, (index - 2.5) * -3.2])}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.digit,
        { backgroundColor, borderColor, left: startLeft, width },
        collapseStyle,
      ]}
    >
      <Text style={[styles.digitText, { color: textColor }]}>{digit}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  codeArea: { width: '100%' },
  hiddenInput: { height: 1, opacity: 0, position: 'absolute', width: 1 },
  codeTrack: { height: 68, position: 'relative', width: '100%' },
  digit: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 14, borderWidth: 1.5, height: 60, justifyContent: 'center', position: 'absolute', top: 4 },
  digitText: { fontFamily: fontFamilies.bold, fontSize: 24, fontVariant: ['tabular-nums'] },
  statusCircle: { alignItems: 'center', borderRadius: 30, borderWidth: 1.5, height: 60, justifyContent: 'center', left: '50%', marginLeft: -30, position: 'absolute', top: 4, width: 60 },
  successRing: { borderRadius: 30, borderWidth: 1.5, height: 60, position: 'absolute', width: 60 },
  centerText: { fontFamily: fontFamilies.regular, fontSize: 13, textAlign: 'center' },
  expiryRow: { alignItems: 'flex-end', minHeight: 22, width: '100%' },
  expiryText: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 20 },
  expiryTime: { fontFamily: fontFamilies.semibold, fontVariant: ['tabular-nums'] },
  successText: { fontFamily: fontFamilies.semibold, fontSize: 13, lineHeight: 20 },
  resendLink: { fontFamily: fontFamilies.semibold, fontSize: 14, lineHeight: 20 },
  backAction: { alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 2 },
  backLink: { fontFamily: fontFamilies.semibold, fontSize: 14 },
});
