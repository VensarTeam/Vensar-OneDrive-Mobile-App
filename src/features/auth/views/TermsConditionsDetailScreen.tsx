import React, { useState } from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

import {
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

type TermsConditionsDetailNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'TermsConditionsDetail'
  >;

type TermsConditionsDetailRouteProp =
  RouteProp<
    RootStackParamList,
    'TermsConditionsDetail'
  >;


/* ========================================================= */
/* SCREEN */
/* ========================================================= */

export function TermsConditionsDetailScreen() {
  const navigation =
    useNavigation<TermsConditionsDetailNavigationProp>();

  const route =
    useRoute<TermsConditionsDetailRouteProp>();

  const insets = useSafeAreaInsets();

  /*
   * If opened from Profile, this is a read-only
   * Terms & Conditions page.
   *
   * If opened from the consent screen, the user
   * must scroll to the bottom and press I Agree.
   */
  const fromProfile =
    route.params?.fromProfile === true;

  const [
    hasReachedBottom,
    setHasReachedBottom,
  ] = useState(false);


  /* ======================================================= */
  /* SCROLL DETECTION */
  /* ======================================================= */

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const {
      layoutMeasurement,
      contentOffset,
      contentSize,
    } = event.nativeEvent;

    const paddingToBottom = 30;

    const reachedBottom =
      layoutMeasurement.height +
        contentOffset.y >=
      contentSize.height -
        paddingToBottom;

    if (
      reachedBottom &&
      !hasReachedBottom
    ) {
      setHasReachedBottom(true);
    }
  };


  /* ======================================================= */
  /* ACCEPT TERMS */
/* ======================================================= */

  const handleAccept = () => {
    if (!hasReachedBottom) {
      return;
    }

    navigation.popTo(
      'PrivacyPolicy',
      {
        termsAccepted: true,
      },
    );
  };


  /* ======================================================= */
  /* RENDER */
/* ======================================================= */

  return (
    <View style={styles.container}>

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View
        style={[
          styles.header,
          {
            paddingTop:
              insets.top + 8,
          },
        ]}
      >

        <Pressable
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={25}
            color="#194897"
          />
        </Pressable>


        <Text style={styles.headerTitle}>
          Terms and Conditions
        </Text>


        <View style={styles.headerSpacer} />

      </View>


      {/* ================================================= */}
      {/* TERMS CONTENT */}
      {/* ================================================= */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              fromProfile
                ? 40
                : 150 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >

        {/* ============================================= */}
        {/* INTRO */}
        {/* ============================================= */}

        <View style={styles.hero}>

          <View style={styles.iconCircle}>

            <MaterialCommunityIcons
              name="file-document-check-outline"
              size={42}
              color="#5B93E6"
            />

          </View>


          <Text style={styles.title}>
            Terms and Conditions
          </Text>


          <Text style={styles.subtitle}>
            Vensar Drive
          </Text>


          <Text style={styles.introText}>
            Please review these terms before using Vensar Drive.
          </Text>

        </View>


        {/* ============================================= */}
        {/* SECTION 1 */}
        {/* ============================================= */}

        <PolicySection
          number="1"
          title="Using Vensar Drive"
        >
          <Text style={styles.bodyText}>
            Vensar Drive is intended for people who have been given an
            account by an authorized Vensar administrator. Use the
            workspace only for work you are permitted to perform and
            follow the policies that apply within your organization.
          </Text>
        </PolicySection>


        {/* ============================================= */}
        {/* SECTION 2 */}
        {/* ============================================= */}

        <PolicySection
          number="2"
          title="Account responsibility"
        >
          <Text style={styles.bodyText}>
            Keep your sign-in details confidential and use your own
            account. Notify your administrator if you believe your
            account has been accessed without permission. Administrators
            may manage, suspend, or remove access as needed for the
            workspace.
          </Text>
        </PolicySection>


        {/* ============================================= */}
        {/* SECTION 3 */}
        {/* ============================================= */}

        <PolicySection
          number="3"
          title="Files and sharing"
        >
          <Text style={styles.bodyText}>
            Upload and share only content you are authorized to use.
            Check recipients and access settings before sharing. Do not
            use the service to upload unlawful, harmful, or infringing
            material, or to interfere with other users or the service.
          </Text>
        </PolicySection>


        {/* ============================================= */}
        {/* SECTION 4 */}
        {/* ============================================= */}

        <PolicySection
          number="4"
          title="Availability and changes"
        >
          <Text style={styles.bodyText}>
            Features may be updated, interrupted, or removed as the
            service evolves. Users should follow their organization’s
            processes for important records and report service issues to
            their administrator.
          </Text>
        </PolicySection>


        {/* ============================================= */}
        {/* SECTION 5 */}
        {/* ============================================= */}

        <PolicySection
          number="5"
          title="Ending access"
        >
          <Text style={styles.bodyText}>
            Access may end when an account is disabled, removed, or no
            longer authorized by the organization. The organization’s
            applicable policies determine how workspace content is
            handled after access ends.
          </Text>
        </PolicySection>


        {/* ============================================= */}
        {/* SECTION 6 */}
        {/* ============================================= */}

        <PolicySection
          number="6"
          title="Questions and legal details"
        >
          <Text style={styles.bodyText}>
            Contact your Vensar administrator with questions about these
            terms. The contracting legal entity, formal contact details,
            and governing jurisdiction will be added after review.
          </Text>
        </PolicySection>


        {/* ============================================= */}
        {/* END OF TERMS */}
        {/* ============================================= */}

        <View style={styles.endCard}>

          <MaterialCommunityIcons
            name="check-circle-outline"
            size={27}
            color="#5B93E6"
          />


          <Text style={styles.endTitle}>
            End of Terms and Conditions
          </Text>


          <Text style={styles.endText}>
            You have reached the end of the Terms and Conditions.
          </Text>

        </View>

      </ScrollView>


      {/* ================================================= */}
      {/* BOTTOM ACTION PANEL */}
      {/* ================================================= */}

      {!fromProfile && (
        <View
          style={[
            styles.bottomPanel,
            {
              paddingBottom:
                insets.bottom + 13,
            },
          ]}
        >

          {!hasReachedBottom && (
            <View style={styles.warningRow}>

              <MaterialCommunityIcons
                name="arrow-down-circle-outline"
                size={19}
                color="#8A9BB0"
              />

              <Text style={styles.warningText}>
                Scroll to the bottom to continue
              </Text>

            </View>
          )}


          {hasReachedBottom && (
            <View style={styles.readyRow}>

              <MaterialCommunityIcons
                name="check-circle"
                size={19}
                color="#4FA66A"
              />

              <Text style={styles.readyText}>
                You have reviewed the Terms and Conditions
              </Text>

            </View>
          )}


          <Pressable
            disabled={!hasReachedBottom}
            style={[
              styles.agreeButton,
              !hasReachedBottom &&
                styles.agreeButtonDisabled,
            ]}
            onPress={handleAccept}
          >

            <MaterialCommunityIcons
              name="check"
              size={21}
              color={
                hasReachedBottom
                  ? '#FFFFFF'
                  : '#9BAABD'
              }
            />


            <Text
              style={[
                styles.agreeText,
                !hasReachedBottom &&
                  styles.agreeTextDisabled,
              ]}
            >
              I Agree
            </Text>

          </Pressable>

        </View>
      )}

    </View>
  );
}


/* ========================================================= */
/* REUSABLE SECTION */
/* ========================================================= */

function PolicySection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.policySection}>

      <View style={styles.sectionHeader}>

        <View style={styles.numberCircle}>

          <Text style={styles.numberText}>
            {number}
          </Text>

        </View>


        <Text style={styles.sectionTitle}>
          {title}
        </Text>

      </View>


      <View style={styles.sectionContent}>
        {children}
      </View>

    </View>
  );
}


/* ========================================================= */
/* STYLES */
/* ========================================================= */

const styles = StyleSheet.create({

  container: {
    backgroundColor: '#F8FBFF',
    flex: 1,
  },

  header: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E1EAF4',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingBottom: 13,
    paddingHorizontal: 18,
  },

  backButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },

  headerTitle: {
    color: '#194897',
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },

  headerSpacer: {
    width: 42,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 26,
  },

  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },

  iconCircle: {
    alignItems: 'center',
    backgroundColor: '#E5F1FF',
    borderColor: '#C9E0FA',
    borderRadius: 38,
    borderWidth: 1,
    height: 76,
    justifyContent: 'center',
    marginBottom: 17,
    width: 76,
  },

  title: {
    color: '#194897',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },

  subtitle: {
    color: '#5B93E6',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 5,
  },

  introText: {
    color: '#71839B',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    maxWidth: 500,
    textAlign: 'center',
  },

  policySection: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0EAF5',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 14,
  },

  numberCircle: {
    alignItems: 'center',
    backgroundColor: '#E5F1FF',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    marginRight: 11,
    width: 34,
  },

  numberText: {
    color: '#3F7FD9',
    fontSize: 14,
    fontWeight: '800',
  },

  sectionTitle: {
    color: '#194897',
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },

  sectionContent: {
    paddingLeft: 2,
  },

  bodyText: {
    color: '#53677F',
    fontSize: 15,
    lineHeight: 24,
  },

  endCard: {
    alignItems: 'center',
    backgroundColor: '#EDF6FF',
    borderColor: '#D8EAFB',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 2,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },

  endTitle: {
    color: '#194897',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 9,
  },

  endText: {
    color: '#71839B',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    textAlign: 'center',
  },

  bottomPanel: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E1EAF4',
    borderTopWidth: 1,
    elevation: 10,
    paddingHorizontal: 22,
    paddingTop: 10,
    shadowColor: '#194897',
    shadowOffset: {
      height: -3,
      width: 0,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },

  warningRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 9,
  },

  warningText: {
    color: '#8A9BB0',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  readyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 9,
  },

  readyText: {
    color: '#4FA66A',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  agreeButton: {
    alignItems: 'center',
    backgroundColor: '#5B93E6',
    borderRadius: 17,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
    width: '100%',
  },

  agreeButtonDisabled: {
    backgroundColor: '#D4E1EF',
  },

  agreeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 7,
  },

  agreeTextDisabled: {
    color: '#9BAABD',
  },

});