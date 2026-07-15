import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
  const { theme } = useAppTheme();
  const { colors } = theme;
  const complete = useCallback(() => navigation.replace('Home'), [navigation]);
  const vm = useOtpViewModel(route.params.identifier, complete);
  const deliveryDestination = [route.params.email, route.params.mobile].filter(Boolean).join(' or ');

  useEffect(() => {
    verificationProgress.value = withTiming(vm.isAutoVerifying ? 1 : 0, {
      duration: 420,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [verificationProgress, vm.isAutoVerifying]);

  const codeMorphStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(verificationProgress.value, [0, 1], [14, 18]),
    borderWidth: interpolate(verificationProgress.value, [0, 1], [0, 1.5]),
    width: interpolate(verificationProgress.value, [0, 1], [codeWidth || 60, 60]),
  }));
  const digitsStyle = useAnimatedStyle(() => ({ opacity: 1 - verificationProgress.value }));
  const loaderStyle = useAnimatedStyle(() => ({ opacity: verificationProgress.value }));

  return (
    <AuthShell
      subtitle={`Enter the code sent to ${deliveryDestination || route.params.identifier}`}
      title="Verify it’s you"
    >
      <Pressable
        accessibilityLabel="Enter verification code"
        disabled={vm.isAutoVerifying}
        onPress={() => inputRef.current?.focus()}
        style={styles.codeArea}
      >
        <TextInput
          ref={inputRef}
          autoComplete="one-time-code"
          caretHidden
          editable={!vm.isAutoVerifying}
          keyboardType="number-pad"
          maxLength={6}
          onChangeText={vm.setOtp}
          onSubmitEditing={vm.submit}
          style={styles.hiddenInput}
          textContentType="oneTimeCode"
          value={vm.otp}
        />
        <View onLayout={(event) => setCodeWidth(event.nativeEvent.layout.width)} style={styles.codeTrack}>
          <Animated.View
            style={[
              styles.codeMorph,
              { backgroundColor: '#F9FBFD', borderColor: colors.primary },
              codeMorphStyle,
            ]}
          >
            <Animated.View style={[styles.digitRow, { width: codeWidth || '100%' }, digitsStyle]}>
              {Array.from({ length: 6 }, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.digit,
                    {
                      backgroundColor: '#F9FBFD',
                      borderColor: vm.error ? colors.danger : index === vm.otp.length ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.digitText, { color: colors.text }]}>{vm.otp[index] ?? ''}</Text>
                </View>
              ))}
            </Animated.View>
            <Animated.View pointerEvents="none" style={[styles.verifyingLoader, loaderStyle]}>
              <ActivityIndicator color={colors.primary} size="small" />
            </Animated.View>
          </Animated.View>
        </View>
      </Pressable>

      {vm.error ? <Text accessibilityRole="alert" selectable style={[styles.centerText, { color: colors.danger }]}>{vm.error}</Text> : null}

      <View style={styles.expiryRow}>
        {vm.isExpired ? (
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
        disabled={!vm.canSubmit || vm.isAutoVerifying}
        loading={vm.isSubmitting}
        onPress={vm.submit}
        title={vm.isAutoVerifying ? 'Verifying…' : 'Verify and continue'}
      />

      <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.backAction}>
        <Text style={[styles.backLink, { color: colors.textMuted }]}>Back to login</Text>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  codeArea: { width: '100%' },
  hiddenInput: { height: 1, opacity: 0, position: 'absolute', width: 1 },
  codeTrack: { alignItems: 'center', height: 60, width: '100%' },
  codeMorph: { alignItems: 'center', height: 60, justifyContent: 'center', overflow: 'hidden' },
  digitRow: { flexDirection: 'row', gap: 8, height: 60, justifyContent: 'space-between' },
  digit: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 14, borderWidth: 1.5, flex: 1, height: 60, justifyContent: 'center', maxWidth: 58 },
  digitText: { fontFamily: fontFamilies.bold, fontSize: 24, fontVariant: ['tabular-nums'] },
  verifyingLoader: { alignItems: 'center', height: 60, justifyContent: 'center', position: 'absolute', width: 60 },
  centerText: { fontFamily: fontFamilies.regular, fontSize: 13, textAlign: 'center' },
  expiryRow: { alignItems: 'flex-end', minHeight: 22, width: '100%' },
  expiryText: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 20 },
  expiryTime: { fontFamily: fontFamilies.semibold, fontVariant: ['tabular-nums'] },
  resendLink: { fontFamily: fontFamilies.semibold, fontSize: 14, lineHeight: 20 },
  backAction: { alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 2 },
  backLink: { fontFamily: fontFamilies.semibold, fontSize: 14 },
});
