import React, {
  useState,
} from 'react';

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

type PrivacyPolicyDetailNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'PrivacyPolicyDetail'
  >;

type PrivacyPolicyDetailRouteProp =
  RouteProp<
    RootStackParamList,
    'PrivacyPolicyDetail'
  >;


/* ========================================================= */
/* SCREEN */
/* ========================================================= */

export function PrivacyPolicyDetailScreen() {

  const navigation =
    useNavigation<
      PrivacyPolicyDetailNavigationProp
    >();

  const route =
    useRoute<
      PrivacyPolicyDetailRouteProp
    >();

  const insets =
    useSafeAreaInsets();


  /* ======================================================= */
  /* OPENED FROM PROFILE? */
  /* ======================================================= */

  const fromProfile =
    route.params?.fromProfile === true;


  /* ======================================================= */
  /* SCROLL STATE */
  /* ======================================================= */

  const [
    hasReachedBottom,
    setHasReachedBottom,
  ] = useState(false);


  /* ======================================================= */
  /* SCROLL DETECTION */
  /* ======================================================= */

  const handleScroll = (
    event: NativeSyntheticEvent<
      NativeScrollEvent
    >,
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
  /* ACCEPT PRIVACY POLICY */
  /* ======================================================= */

  const handleAccept = () => {

    if (!hasReachedBottom) {
      return;
    }

    navigation.popTo(
      'PrivacyPolicy',
      {
        privacyAccepted: true,
      },
    );
  };


  /* ======================================================= */
  /* RENDER */
  /* ======================================================= */

  return (
    <View
      style={styles.container}
    >

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


        <Text
          style={styles.headerTitle}
        >
          Privacy Policy
        </Text>


        <View
          style={styles.headerSpacer}
        />

      </View>


      {/* ================================================= */}
      {/* POLICY CONTENT */}
      {/* ================================================= */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            /*
             * When opened from Profile there is
             * no bottom action panel, so we don't
             * need the extra 150px spacing.
             */
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

        <View
          style={styles.hero}
        >

          <View
            style={styles.iconCircle}
          >

            <MaterialCommunityIcons
              name="shield-check-outline"
              size={42}
              color="#5B93E6"
            />

          </View>


          <Text
            style={styles.title}
          >
            Privacy Policy
          </Text>


          <Text
            style={styles.subtitle}
          >
            Vensar Drive
          </Text>


          <Text
            style={styles.introText}
          >
            This policy describes the information involved when an
            authorized user accesses Vensar Drive.
          </Text>

        </View>


        {/* ============================================= */}
        {/* SECTION 1 */}
        {/* ============================================= */}

        <PolicySection
          number="1"
          title="About this policy"
        >

          <Text
            style={styles.bodyText}
          >
            This policy describes the information involved when an
            authorized user accesses Vensar Drive. Vensar Drive is a
            workspace for managing files, services, projects, and access
            within an organization.
          </Text>

        </PolicySection>


        {/* ============================================= */}
        {/* SECTION 2 */}
        {/* ============================================= */}

        <PolicySection
          number="2"
          title="Information in the workspace"
        >

          <Text
            style={styles.bodyText}
          >
            The workspace may contain account details such as a name,
            email address, mobile number, role, and profile details. It
            may also contain files, project information, sharing records,
            access settings, approval requests, and activity information
            created through use of the service.
          </Text>

        </PolicySection>


        {/* ============================================= */}
        {/* SECTION 3 */}
        {/* ============================================= */}

        <PolicySection
          number="3"
          title="How information is used"
        >

          <Text
            style={styles.bodyText}
          >
            Information is used to provide access to the workspace,
            organize and share work, apply permissions, handle approvals,
            support users, and maintain the service. Access to workspace
            content depends on the permissions assigned by authorized
            administrators.
          </Text>

        </PolicySection>


        {/* ============================================= */}
        {/* SECTION 4 */}
        {/* ============================================= */}

        <PolicySection
          number="4"
          title="Sharing and access"
        >

          <Text
            style={styles.bodyText}
          >
            Authorized users may share content using the features
            available to their account. Workspace administrators can
            manage users and permissions. Information may also be handled
            by service providers that support the operation of the
            workspace, subject to applicable arrangements.
          </Text>

        </PolicySection>


        {/* ============================================= */}
        {/* SECTION 5 */}
        {/* ============================================= */}

        <PolicySection
          number="5"
          title="Security and retention"
        >

          <Text
            style={styles.bodyText}
          >
            Access controls are used to help protect workspace
            information. No system can guarantee absolute security.
            Information is kept according to the organization’s
            operational needs and applicable requirements; exact
            retention periods should be confirmed by the organization.
          </Text>

        </PolicySection>


        {/* ============================================= */}
        {/* SECTION 6 */}
        {/* ============================================= */}

        <PolicySection
          number="6"
          title="Your choices and requests"
        >

          <Text
            style={styles.bodyText}
          >
            For questions about your account, access, or requests
            concerning personal information, contact your Vensar
            administrator. A dedicated privacy contact will be added
            after review.
          </Text>

        </PolicySection>


        {/* ============================================= */}
        {/* SECTION 7 */}
        {/* ============================================= */}

        <PolicySection
          number="7"
          title="Changes"
        >

          <Text
            style={styles.bodyText}
          >
            This policy may be updated as the service and its practices
            change. The current version will be available on this page.
          </Text>

        </PolicySection>


        {/* ============================================= */}
        {/* END OF POLICY */}
        {/* ============================================= */}

        <View
          style={styles.endCard}
        >

          <MaterialCommunityIcons
            name="check-circle-outline"
            size={27}
            color="#5B93E6"
          />


          <Text
            style={styles.endTitle}
          >
            End of Privacy Policy
          </Text>


          <Text
            style={styles.endText}
          >
            You have reached the end of the Privacy Policy.
          </Text>

        </View>

      </ScrollView>


      {/* ================================================= */}
      {/* ONBOARDING ACTION PANEL ONLY */}
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

          {/* ============================================= */}
          {/* NOT READY */}
          {/* ============================================= */}

          {!hasReachedBottom && (

            <View
              style={styles.warningRow}
            >

              <MaterialCommunityIcons
                name="arrow-down-circle-outline"
                size={19}
                color="#8A9BB0"
              />

              <Text
                style={styles.warningText}
              >
                Scroll to the bottom to continue
              </Text>

            </View>

          )}


          {/* ============================================= */}
          {/* READY */}
          {/* ============================================= */}

          {hasReachedBottom && (

            <View
              style={styles.readyRow}
            >

              <MaterialCommunityIcons
                name="check-circle"
                size={19}
                color="#4FA66A"
              />

              <Text
                style={styles.readyText}
              >
                You have reviewed the Privacy Policy
              </Text>

            </View>

          )}


          {/* ============================================= */}
          {/* AGREE BUTTON */}
          {/* ============================================= */}

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
/* REUSABLE POLICY SECTION */
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
    <View
      style={styles.policySection}
    >

      <View
        style={styles.sectionHeader}
      >

        <View
          style={styles.numberCircle}
        >

          <Text
            style={styles.numberText}
          >
            {number}
          </Text>

        </View>


        <Text
          style={styles.sectionTitle}
        >
          {title}
        </Text>

      </View>


      <View
        style={styles.sectionContent}
      >
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


  /* HEADER */

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


  /* SCROLL */

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 26,
  },


  /* HERO */

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


  /* POLICY */

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


  /* END */

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


  /* ONBOARDING BOTTOM PANEL */

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