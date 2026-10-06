import React, {
  useCallback,
  useState,
} from 'react';

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import type {
  RouteProp,
} from '@react-navigation/native';

import type {
  RootStackParamList,
} from '../../../navigation/routes';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';


/* ========================================================= */
/* NAVIGATION TYPES */
/* ========================================================= */

type PrivacyPolicyNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'PrivacyPolicy'
  >;

type PrivacyPolicyRouteProp =
  RouteProp<
    RootStackParamList,
    'PrivacyPolicy'
  >;


/* ========================================================= */
/* SCREEN */
/* ========================================================= */

export function PrivacyPolicyScreen() {
  const navigation =
    useNavigation<PrivacyPolicyNavigationProp>();

  const route =
    useRoute<PrivacyPolicyRouteProp>();

  const insets = useSafeAreaInsets();


  /* ======================================================= */
  /* CONSENT STATE */
  /* ======================================================= */

  const [
    privacyConsented,
    setPrivacyConsented,
  ] = useState(false);

  const [
    termsConsented,
    setTermsConsented,
  ] = useState(false);


  /* ======================================================= */
  /* RECEIVE ACCEPTANCE FROM DETAIL SCREEN */
  /* ======================================================= */

  useFocusEffect(
    useCallback(() => {

      if (route.params?.privacyAccepted) {
        setPrivacyConsented(true);
      }

      if (route.params?.termsAccepted) {
        setTermsConsented(true);
      }

    }, [
      route.params?.privacyAccepted,
      route.params?.termsAccepted,
    ]),
  );


  /* ======================================================= */
  /* CONTINUE STATE */
  /* ======================================================= */

  const canContinue =
    privacyConsented &&
    termsConsented;


  /* ======================================================= */
  /* OPEN PRIVACY POLICY */
  /* ======================================================= */

  const openPrivacyPolicy = () => {

    /*
     * If the Privacy Policy has already been accepted,
     * tapping the row again will uncheck it.
     */
    if (privacyConsented) {
      setPrivacyConsented(false);
      return;
    }

    /*
     * Otherwise open the detailed Privacy Policy.
     */
    navigation.navigate(
      'PrivacyPolicyDetail',
    );
  };


  /* ======================================================= */
  /* TERMS */
/* ======================================================= */

  const openTerms = () => {

    /*
     * If the Terms have already been accepted,
     * tapping the row again will uncheck them.
     */
    if (termsConsented) {
      setTermsConsented(false);
      return;
    }

    /*
     * Otherwise open the detailed Terms screen.
     */
    navigation.navigate(
      'TermsConditionsDetail',
    );
  };


  /* ======================================================= */
  /* SUPPORT */
/* ======================================================= */

  const openSupport = () => {

    /*
     * Open the dedicated Vensar contact/support screen.
     */
    navigation.navigate(
      'ContactSupport',
    );
  };


  /* ======================================================= */
  /* RENDER */
/* ======================================================= */

  return (
    <View style={styles.container}>

      {/* Decorative background circles */}

      <View style={styles.topCircle} />

      <View style={styles.leftCircle} />

      <View style={styles.rightCircle} />

      <View style={styles.bottomCircle} />


      {/* ================================================= */}
      {/* MAIN SCROLL CONTENT */}
      {/* ================================================= */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
        bounces={true}
      >

        {/* Vensar Logo */}

        <Image
          source={require(
            '../../../../assets/vensar-company-logo.png'
          )}
          style={styles.logo}
          resizeMode="contain"
        />


        {/* Privacy Icon */}

        <View style={styles.iconCircle}>

          <MaterialCommunityIcons
            name="shield-outline"
            size={46}
            color="#5B93E6"
            style={styles.shieldIcon}
          />

          <Text style={styles.shieldInfo}>
            i
          </Text>

        </View>


        {/* Title */}

        <Text style={styles.title}>
          Your Privacy Matters
        </Text>


        {/* Description */}

        <Text style={styles.description}>
          V Drive collects only the information required to provide secure
          project, file management, and workspace services.
        </Text>


        {/* ================================================= */}
        {/* INFORMATION CARD */}
        {/* ================================================= */}

        <View style={styles.infoCard}>

          <Text style={styles.cardTitle}>
            We may collect:
          </Text>


          <View style={styles.bulletRow}>

            <View style={styles.bullet} />

            <Text style={styles.bulletText}>
              Name and employee information
            </Text>

          </View>


          <View style={styles.bulletRow}>

            <View style={styles.bullet} />

            <Text style={styles.bulletText}>
              Project and file access information
            </Text>

          </View>


          <View style={styles.bulletRow}>

            <View style={styles.bullet} />

            <Text style={styles.bulletText}>
              Device information required for security and diagnostics
            </Text>

          </View>


          <View
            style={[
              styles.bulletRow,
              styles.lastBulletRow,
            ]}
          >

            <View style={styles.bullet} />

            <Text style={styles.bulletText}>
              Activity required to maintain secure access
            </Text>

          </View>

        </View>


        {/* ================================================= */}
        {/* SECURITY CARD */}
        {/* ================================================= */}

        <View style={styles.securityCard}>

          <View style={styles.lockCircle}>

            <Text style={styles.lockIcon}>
              🔒
            </Text>

          </View>


          <Text style={styles.securityText}>
            Your information is securely stored and is not sold to third
            parties.
          </Text>

        </View>


        {/* ================================================= */}
        {/* CONSENT SECTION */}
        {/* ================================================= */}

        <View style={styles.consentSection}>

          {/* ============================================= */}
          {/* PRIVACY POLICY */}
          {/* ============================================= */}

          <Pressable
            style={styles.consentRow}
            onPress={openPrivacyPolicy}
          >

            <View
              style={[
                styles.checkbox,
                privacyConsented &&
                  styles.checkboxChecked,
              ]}
            >

              {privacyConsented && (
                <Text style={styles.checkmark}>
                  ✓
                </Text>
              )}

            </View>


            <View
              style={styles.consentTextContainer}
            >

              <Text style={styles.consentText}>
                Review the Privacy Policy to provide your consent.
              </Text>


              {!privacyConsented && (
                <Text style={styles.tapToReview}>
                  Tap to review
                </Text>
              )}


              {privacyConsented && (
                <Text style={styles.acceptedText}>
                  Privacy Policy accepted
                </Text>
              )}

            </View>

          </Pressable>


          {/* ============================================= */}
          {/* TERMS AND CONDITIONS */}
          {/* ============================================= */}

          <Pressable
            style={styles.consentRow}
            onPress={openTerms}
          >

            <View
              style={[
                styles.checkbox,
                termsConsented &&
                  styles.checkboxChecked,
              ]}
            >

              {termsConsented && (
                <Text style={styles.checkmark}>
                  ✓
                </Text>
              )}

            </View>


            <View
              style={styles.consentTextContainer}
            >

              <Text style={styles.consentText}>
                I agree to the Terms and Conditions.
              </Text>


              {!termsConsented && (
                <Text style={styles.tapToReview}>
                  Tap to review
                </Text>
              )}


              {termsConsented && (
                <Text style={styles.acceptedText}>
                  Terms and Conditions accepted
                </Text>
              )}

            </View>

          </Pressable>

        </View>


        {/* ================================================= */}
        {/* SUPPORT + POLICY VERSION */}
        {/* ================================================= */}

        <View style={styles.linksSection}>

          <Pressable
            style={({ pressed }) => [
              styles.supportButton,
              pressed &&
                styles.supportButtonPressed,
            ]}
            onPress={openSupport}
          >

            <MaterialCommunityIcons
              name="headset"
              size={19}
              color="#3F7FD9"
            />

            <Text style={styles.supportText}>
              Support
            </Text>

          </Pressable>


          <Text style={styles.version}>
            Policy version 2026-10-06
          </Text>

        </View>

      </ScrollView>


      {/* ================================================= */}
      {/* FIXED BOTTOM BUTTON PANEL */}
      {/* ================================================= */}

      <View
        style={[
          styles.bottomPanel,
          {
            paddingBottom:
              insets.bottom + 13,
          },
        ]}
      >

        <View style={styles.buttonsRow}>

          {/* ============================================= */}
          {/* EXIT */}
          {/* ============================================= */}

          <Pressable
            style={styles.exitButton}
            onPress={() =>
              navigation.goBack()
            }
          >

            <Text style={styles.exitText}>
              Exit app
            </Text>

          </Pressable>


          {/* ============================================= */}
          {/* CONTINUE */}
          {/* ============================================= */}

          <Pressable
            disabled={!canContinue}
            style={[
              styles.continueButton,
              !canContinue &&
                styles.continueButtonDisabled,
            ]}
            onPress={() =>
              navigation.navigate(
                'Login',
              )
            }
          >

            <Text
              style={[
                styles.continueText,
                !canContinue &&
                  styles.continueTextDisabled,
              ]}
            >
              Continue
            </Text>

          </Pressable>

        </View>

      </View>

    </View>
  );
}


/* ========================================================= */
/* STYLES */
/* ========================================================= */

const styles = StyleSheet.create({

  /* ---------------------------------- */
  /* Container */
  /* ---------------------------------- */

  container: {
    backgroundColor: '#F8FBFF',
    flex: 1,
    overflow: 'hidden',
  },


  /* ---------------------------------- */
  /* Scroll */
  /* ---------------------------------- */

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 120,
  },


  /* ---------------------------------- */
  /* Decorative Background */
  /* ---------------------------------- */

  topCircle: {
    backgroundColor: '#DDEEFF',
    borderRadius: 180,
    height: 270,
    position: 'absolute',
    right: -115,
    top: -125,
    width: 270,
  },

  leftCircle: {
    backgroundColor: '#E7F2FC',
    borderRadius: 140,
    height: 230,
    left: -145,
    position: 'absolute',
    top: 455,
    width: 230,
  },

  rightCircle: {
    backgroundColor: '#FFE9D5',
    borderRadius: 140,
    bottom: 90,
    height: 220,
    position: 'absolute',
    right: -135,
    width: 220,
  },

  bottomCircle: {
    backgroundColor: '#DDEEFF',
    borderRadius: 160,
    bottom: -125,
    height: 250,
    left: -90,
    position: 'absolute',
    width: 250,
  },


  /* ---------------------------------- */
  /* Branding */
  /* ---------------------------------- */

  logo: {
    height: 78,
    marginBottom: 25,
    width: 175,
  },


  /* ---------------------------------- */
  /* Privacy Icon */
  /* ---------------------------------- */

  iconCircle: {
    alignItems: 'center',
    backgroundColor: '#E5F1FF',
    borderColor: '#C9E0FA',
    borderRadius: 40,
    borderWidth: 1,
    height: 78,
    justifyContent: 'center',
    marginBottom: 20,
    width: 78,
  },

  shieldIcon: {
    position: 'absolute',
  },

  shieldInfo: {
    color: '#5B93E6',
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 25,
    position: 'absolute',
    textAlign: 'center',
    width: 46,
  },


  /* ---------------------------------- */
  /* Heading */
  /* ---------------------------------- */

  title: {
    color: '#194897',
    fontSize: 29,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
  },

  description: {
    color: '#71839B',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 410,
    paddingHorizontal: 4,
    textAlign: 'center',
  },


  /* ---------------------------------- */
  /* Information Card */
  /* ---------------------------------- */

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0EAF5',
    borderRadius: 22,
    borderWidth: 1,
    elevation: 2,
    paddingHorizontal: 21,
    paddingTop: 20,
    paddingBottom: 17,
    shadowColor: '#194897',
    shadowOffset: {
      height: 3,
      width: 0,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    width: '100%',
  },

  cardTitle: {
    color: '#194897',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 17,
  },

  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 15,
  },

  lastBulletRow: {
    marginBottom: 0,
  },

  bullet: {
    backgroundColor: '#5B93E6',
    borderRadius: 5,
    height: 9,
    marginRight: 13,
    marginTop: 7,
    width: 9,
  },

  bulletText: {
    color: '#53677F',
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },


  /* ---------------------------------- */
  /* Security */
  /* ---------------------------------- */

  securityCard: {
    alignItems: 'center',
    backgroundColor: '#EDF6FF',
    borderColor: '#D8EAFB',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '100%',
  },

  lockCircle: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    height: 46,
    justifyContent: 'center',
    marginRight: 13,
    width: 46,
  },

  lockIcon: {
    fontSize: 20,
  },

  securityText: {
    color: '#53677F',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },


  /* ---------------------------------- */
  /* Support */
  /* ---------------------------------- */

  linksSection: {
    alignItems: 'center',
    marginTop: 2,
    width: '100%',
  },

  supportButton: {
    alignItems: 'center',
    backgroundColor: '#EDF6FF',
    borderColor: '#D8EAFB',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 118,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  supportButtonPressed: {
    backgroundColor: '#E3F1FF',
  },

  supportText: {
    color: '#3F7FD9',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 7,
  },

  version: {
    color: '#9BAABD',
    fontSize: 12,
    marginTop: 11,
  },


  /* ---------------------------------- */
  /* Consent */
  /* ---------------------------------- */

  consentSection: {
    marginTop: 24,
    width: '100%',
  },

  consentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 30,
    paddingHorizontal: 4,
    width: '100%',
  },

  checkbox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#AFC1D5',
    borderRadius: 6,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    marginRight: 12,
    width: 22,
  },

  checkboxChecked: {
    backgroundColor: '#5B93E6',
    borderColor: '#5B93E6',
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
  },

  consentTextContainer: {
    flex: 1,
  },

  consentText: {
    color: '#53677F',
    fontSize: 14,
    lineHeight: 19,
  },

  tapToReview: {
    color: '#5B93E6',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  acceptedText: {
    color: '#4FA66A',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },


  /* ---------------------------------- */
  /* Bottom Panel */
  /* ---------------------------------- */

  bottomPanel: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E1EAF4',
    borderTopWidth: 1,
    elevation: 10,
    paddingHorizontal: 24,
    paddingTop: 12,
    shadowColor: '#194897',
    shadowOffset: {
      height: -3,
      width: 0,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },


  /* ---------------------------------- */
  /* Buttons Row */
  /* ---------------------------------- */

  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },


  /* ---------------------------------- */
  /* Exit Button */
  /* ---------------------------------- */

  exitButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD9E8',
    borderRadius: 17,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    width: '32%',
  },

  exitText: {
    color: '#53677F',
    fontSize: 15,
    fontWeight: '700',
  },


  /* ---------------------------------- */
  /* Continue Button */
  /* ---------------------------------- */

  continueButton: {
    alignItems: 'center',
    backgroundColor: '#5B93E6',
    borderRadius: 17,
    flex: 1,
    height: 52,
    justifyContent: 'center',
  },

  continueButtonDisabled: {
    backgroundColor: '#D4E1EF',
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  continueTextDisabled: {
    color: '#9BAABD',
  },

});