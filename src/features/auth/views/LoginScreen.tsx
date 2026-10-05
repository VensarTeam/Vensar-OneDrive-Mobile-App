import { useCallback, useEffect, useRef } from 'react';
import {
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Icon, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../navigation/routes';
import type { OtpDeliveryDetails } from '../models/authApiModels';
import { useAuthSession } from '../services/auth-session-provider';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';
import { useSplashFinished } from '../../../bootstrap/SplashGate';
import { fontFamilies } from '../../../core/theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const splashFinished = useSplashFinished();

  const {
    isAuthenticated,
    isLocked,
    isUnlocking,
    unlock,
  } = useAuthSession();

  const biometricRequestedRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const goToOtp = useCallback(
    ({
      email,
      identifier,
      mobile,
    }: OtpDeliveryDetails) =>
      navigation.navigate('Otp', {
        email,
        identifier,
        mobile,
      }),
    [navigation],
  );

  const vm = useLoginViewModel(goToOtp);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  /*
   * ===============================================================
   * AUTOMATIC BIOMETRIC LOGIN
   * ===============================================================
   */

  useEffect(() => {
    if (!splashFinished) {
      return;
    }

    if (!isAuthenticated) {
      biometricRequestedRef.current = false;
      return;
    }

    if (!isLocked) {
      return;
    }

    if (isUnlocking) {
      return;
    }

    if (biometricRequestedRef.current) {
      return;
    }

    biometricRequestedRef.current = true;

    const authenticate = async () => {
      const success = await unlock();

      if (success) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Home',
            },
          ],
        });
      }
    };

    void authenticate();
  }, [
    splashFinished,
    isAuthenticated,
    isLocked,
    isUnlocking,
    navigation,
    unlock,
  ]);

  /*
   * ===============================================================
   * MANUAL FINGERPRINT LOGIN
   * ===============================================================
   */

  const handleFingerprintLogin = async () => {
    if (!isAuthenticated || isUnlocking) {
      return;
    }

    const success = await unlock();

    if (success) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Home',
          },
        ],
      });
    }
  };

  return (
    <View style={styles.screen}>

      {/* ========================================================= */}
      {/* BACKGROUND DECORATION                                    */}
      {/* ========================================================= */}

      <View
        pointerEvents="none"
        style={styles.topLeftCircle}
      />

      <View
        pointerEvents="none"
        style={styles.topLeftSmallCircle}
      />

      <View
        pointerEvents="none"
        style={styles.topRightCircle}
      />

      <View
        pointerEvents="none"
        style={styles.bottomBlueLarge}
      />

      <View
        pointerEvents="none"
        style={styles.bottomBlueSmall}
      />

      <View
        pointerEvents="none"
        style={styles.bottomOrangeCurve}
      />

      <KeyboardAvoidingView
  behavior="height"
  style={{ flex: 1 }}
>
  <ScrollView
    ref={scrollViewRef}
    bounces={false}
    contentContainerStyle={[
      styles.scrollContent,
      {
        paddingTop: Math.max(insets.top + 18, 28),
        paddingBottom: Math.max(insets.bottom + 12, 18),
      },
    ]}
    keyboardShouldPersistTaps="handled"
    keyboardDismissMode="interactive"
    showsVerticalScrollIndicator={false}
  >

        {/* ======================================================= */}
        {/* LOGO                                                    */}
        {/* ======================================================= */}

        <View style={styles.brandSection}>
          <Image
            accessibilityLabel="V Drive"
            contentFit="contain"
            source={require('../../../../assets/onedrive-vensar-light.png')}
            style={styles.logo}
          />
        </View>

        {/* ======================================================= */}
        {/* HEADING                                                 */}
        {/* ======================================================= */}

        <View style={styles.headingSection}>
          <Text
            accessibilityRole="header"
            style={styles.heading}
          >
            Welcome{' '}
            <Text style={styles.headingBlue}>
              Back
            </Text>
          </Text>

          <Text style={styles.subtitle}>
            Sign in with your mobile number
            {'\n'}
            to continue.
          </Text>
        </View>

        {/* ======================================================= */}
        {/* FORM                                                    */}
        {/* ======================================================= */}

        <View style={styles.formSection}>

          {/* ===================================================== */}
          {/* LOGIN ID                                              */}
          {/* ===================================================== */}

          <View>
            <TextInput
              autoCapitalize="none"
              autoComplete="username"
              onFocus={() => {
  scrollViewRef.current?.scrollTo({
    y: 110,
    animated: true,
  });
}}
              dense
              mode="outlined"
              onChangeText={vm.setLoginId}
              onSubmitEditing={() => undefined}
              placeholder="Mobile number"
              keyboardType="phone-pad"
              returnKeyType="next"
              textContentType="username"
              value={vm.loginId}
              left={
                <TextInput.Icon
                  color="#526A8B"
                  icon="account-outline"
                  size={21}
                />
              }
              placeholderTextColor="#7183A0"
              outlineColor="#DCE7F4"
              activeOutlineColor="#9DBDE5"
              textColor="#18355D"
              contentStyle={styles.inputContent}
              style={styles.input}
              theme={{
                roundness: 19,
              }}
            />

            {vm.errors.loginId ? (
              <Text style={styles.errorText}>
                {vm.errors.loginId}
              </Text>
            ) : null}
          </View>

          {/* ===================================================== */}
          {/* PASSWORD                                               */}
          {/* ===================================================== */}

          <View>
            <TextInput
              autoComplete="current-password"
              dense
              mode="outlined"
              onChangeText={vm.setPassword}
              onSubmitEditing={vm.submit}
              placeholder="Password"
              returnKeyType="done"
              secureTextEntry={!vm.isPasswordVisible}
              textContentType="password"
              value={vm.password}
              left={
                <TextInput.Icon
                  color="#526A8B"
                  icon="lock-outline"
                  size={21}
                />
              }
              right={
                <TextInput.Icon
                  accessibilityLabel={
                    vm.isPasswordVisible
                      ? 'Hide password'
                      : 'Show password'
                  }
                  color="#526A8B"
                  icon={
                    vm.isPasswordVisible
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  onPress={vm.togglePasswordVisibility}
                  size={21}
                />
              }
              placeholderTextColor="#7183A0"
              outlineColor="#DCE7F4"
              activeOutlineColor="#9DBDE5"
              textColor="#18355D"
              contentStyle={styles.inputContent}
              style={styles.input}
              theme={{
                roundness: 19,
              }}
            />

            {vm.errors.password ? (
              <Text style={styles.errorText}>
                {vm.errors.password}
              </Text>
            ) : null}
          </View>

          {/* ===================================================== */}
          {/* SIGN IN                                                */}
          {/* ===================================================== */}

          <Pressable
            accessibilityRole="button"
            disabled={!vm.canSubmit || vm.isSubmitting}
            onPress={vm.submit}
            style={({ pressed }) => [
              styles.signInWrapper,
              !vm.canSubmit &&
                styles.signInButtonDisabled,
              pressed &&
                vm.canSubmit &&
                styles.signInButtonPressed,
            ]}
          >
            <LinearGradient
              colors={[
                '#28B2FF',
                '#1478F4',
                '#1558D5',
              ]}
              start={{
                x: 0,
                y: 0.5,
              }}
              end={{
                x: 1,
                y: 0.5,
              }}
              style={styles.signInButton}
            >
              {vm.isSubmitting ? (
                <Text style={styles.signInText}>
                  Signing in...
                </Text>
              ) : (
                <>
                  <Text style={styles.signInText}>
                    Sign in
                  </Text>

                  <Icon
                    color="#FFFFFF"
                    size={28}
                    source="arrow-right"
                  />
                </>
              )}
            </LinearGradient>
          </Pressable>

          {/* ===================================================== */}
          {/* OR                                                     */}
          {/* ===================================================== */}

          <View style={styles.dividerRow}>
            <View style={styles.divider} />

            <Text style={styles.orText}>
              OR
            </Text>

            <View style={styles.divider} />
          </View>

          {/* ===================================================== */}
          {/* FINGERPRINT                                            */}
          {/* ===================================================== */}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled:
                !isAuthenticated ||
                isUnlocking,
            }}
            disabled={
              !isAuthenticated ||
              isUnlocking
            }
            onPress={handleFingerprintLogin}
            style={({ pressed }) => [
              styles.fingerprintButton,
              !isAuthenticated &&
                styles.fingerprintButtonDisabled,
              pressed &&
                isAuthenticated &&
                styles.fingerprintButtonPressed,
            ]}
          >
            <Icon
              color={
                isAuthenticated
                  ? '#0875F5'
                  : '#A8B3C2'
              }
              size={32}
              source="fingerprint"
            />

            <Text
              style={[
                styles.fingerprintText,
                !isAuthenticated &&
                  styles.fingerprintTextDisabled,
              ]}
            >
              Login with fingerprint
            </Text>
          </Pressable>
        </View>
      </ScrollView>
</KeyboardAvoidingView>

      {/* ========================================================= */}
      {/* APP VERSION                                              */}
      {/* ========================================================= */}

      <View
        pointerEvents="none"
        style={[
          styles.versionContainer,
          {
            bottom: Math.max(insets.bottom + 6, 10),
          },
        ]}
      >
        <Text style={styles.versionText}>
          Version {appVersion}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  /*
   * ===============================================================
   * SCREEN
   * ===============================================================
   */

  screen: {
    flex: 1,
    backgroundColor: '#FBFDFF',
    overflow: 'hidden',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },

  /*
   * ===============================================================
   * BACKGROUND
   * ===============================================================
   */

  topLeftCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#DCEEFF',
    top: -175,
    left: -135,
  },

  topLeftSmallCircle: {
    position: 'absolute',
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: '#E8F3FF',
    top: 105,
    left: -48,
  },

  topRightCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFE4CF',
    top: 205,
    right: -140,
  },

  bottomBlueLarge: {
    position: 'absolute',
    width: 390,
    height: 160,
    borderRadius: 200,
    backgroundColor: '#D8EAFF',
    bottom: -115,
    left: -205,
    transform: [
      {
        rotate: '-8deg',
      },
    ],
  },

  bottomBlueSmall: {
    position: 'absolute',
    width: 350,
    height: 105,
    borderRadius: 180,
    backgroundColor: '#BEDDFF',
    bottom: -78,
    left: -180,
    transform: [
      {
        rotate: '-8deg',
      },
    ],
  },

  bottomOrangeCurve: {
    position: 'absolute',
    width: 320,
    height: 125,
    borderRadius: 170,
    borderWidth: 3,
    borderColor: '#FFD3AD',
    bottom: -90,
    right: -155,
    transform: [
      {
        rotate: '-20deg',
      },
    ],
  },

  /*
   * ===============================================================
   * LOGO
   * ===============================================================
   */

  brandSection: {
    alignItems: 'center',
    marginTop: 10,
  },

  logo: {
    width: 190,
    height: 112,
  },

  /*
   * ===============================================================
   * HEADING
   * ===============================================================
   */

  headingSection: {
    alignItems: 'center',
    marginTop: 42,
  },

  heading: {
    color: '#0A2348',
    fontFamily: fontFamilies.bold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -1.1,
    textAlign: 'center',
  },

  headingBlue: {
    color: '#1675F5',
  },

  subtitle: {
    marginTop: 8,
    color: '#71819B',
    fontFamily: fontFamilies.regular,
    fontSize: 15.5,
    lineHeight: 23,
    textAlign: 'center',
  },

  /*
   * ===============================================================
   * FORM
   * ===============================================================
   */

  formSection: {
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    marginTop: 38,
    gap: 10,
  },

  input: {
    height: 58,
    backgroundColor: '#F1F6FD',
    borderRadius: 19,
  },

  inputContent: {
    paddingHorizontal: 2,
    fontFamily: fontFamilies.regular,
    fontSize: 15,
    color: '#18355D',
  },

  errorText: {
    color: '#D14343',
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    marginLeft: 7,
    marginTop: 3,
  },

  /*
   * ===============================================================
   * SIGN IN
   * ===============================================================
   */

  signInWrapper: {
    borderRadius: 22,
    marginTop: 1,
    shadowColor: '#1477E8',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  signInButton: {
    height: 58,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  signInText: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.bold,
    fontSize: 18,
    marginRight: 15,
  },

  signInButtonDisabled: {
    opacity: 0.45,
  },

  signInButtonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  /*
   * ===============================================================
   * DIVIDER
   * ===============================================================
   */

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    gap: 10,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#CAD7E7',
  },

  orText: {
    color: '#71819A',
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
    paddingHorizontal: 2,
  },

  /*
   * ===============================================================
   * FINGERPRINT
   * ===============================================================
   */

  fingerprintButton: {
    height: 58,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1.5,
    borderColor: '#D2DFEE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
  },

  fingerprintButtonDisabled: {
    backgroundColor: '#FAFBFD',
    borderColor: '#E1E6EC',
  },

  fingerprintButtonPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  fingerprintText: {
    color: '#0B3475',
    fontFamily: fontFamilies.semibold,
    fontSize: 15,
  },

  fingerprintTextDisabled: {
    color: '#A8B3C2',
  },

  /*
   * ===============================================================
   * APP VERSION
   * ===============================================================
   */

  versionContainer: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },

  versionText: {
    color: '#8A98AA',
    fontFamily: fontFamilies.regular,
    fontSize: 10,
    letterSpacing: 0.2,
  },
});