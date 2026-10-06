import React from 'react';

import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

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
/* NAVIGATION TYPE */
/* ========================================================= */

type ContactSupportNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'ContactSupport'
  >;


/* ========================================================= */
/* SCREEN */
/* ========================================================= */

export function ContactSupportScreen() {
  const navigation =
    useNavigation<ContactSupportNavigationProp>();

  const insets =
    useSafeAreaInsets();


  /* ======================================================= */
  /* CALL VENSAR */
/* ======================================================= */

  const callVensar = async () => {
    const phoneNumber =
      'tel:+914023551699';

    try {
      const supported =
        await Linking.canOpenURL(
          phoneNumber,
        );

      if (supported) {
        await Linking.openURL(
          phoneNumber,
        );
      }
    } catch (error) {
      console.log(
        'Unable to open phone dialer:',
        error,
      );
    }
  };


  /* ======================================================= */
  /* EMAIL VENSAR */
  /* ======================================================= */

  const emailVensar = async () => {
    const emailUrl =
      'mailto:info@vensar.com';

    try {
      const supported =
        await Linking.canOpenURL(
          emailUrl,
        );

      if (supported) {
        await Linking.openURL(
          emailUrl,
        );
      }
    } catch (error) {
      console.log(
        'Unable to open email client:',
        error,
      );
    }
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
          Contact Vensar
        </Text>


        <View style={styles.headerSpacer} />

      </View>


      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              40 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >

        {/* ============================================= */}
        {/* HERO */}
        {/* ============================================= */}

        <View style={styles.hero}>

          <View style={styles.heroIcon}>

            <MaterialCommunityIcons
              name="headset"
              size={42}
              color="#5B93E6"
            />

          </View>


          <Text style={styles.heroTitle}>
            Vensar Constructions
          </Text>


          <Text style={styles.heroSubtitle}>
            Reach us for assistance and support
          </Text>

        </View>


        {/* ============================================= */}
        {/* CONTACT CARD */}
        {/* ============================================= */}

        <View style={styles.contactCard}>

          {/* ------------------------------------------- */}
          {/* REGISTERED OFFICE */}
          {/* ------------------------------------------- */}

          <ContactItem
            icon="map-marker-outline"
            label="Registered Office"
          >

            <Text style={styles.valueText}>
              8-2-12/76/1/B, 3rd Floor
            </Text>

            <Text style={styles.valueText}>
              Ashoka Hitech Chambers, Road No 2
            </Text>

            <Text style={styles.valueText}>
              Banjara Hills, Hyderabad - 500034
            </Text>

          </ContactItem>


          <View style={styles.divider} />


          {/* ------------------------------------------- */}
          {/* DIRECT LINE */}
          {/* ------------------------------------------- */}

          <Pressable
            onPress={callVensar}
            style={({ pressed }) => [
              styles.contactItemPressable,
              pressed &&
                styles.contactItemPressed,
            ]}
          >

            <View style={styles.contactIcon}>

              <MaterialCommunityIcons
                name="phone-outline"
                size={23}
                color="#3F7FD9"
              />

            </View>


            <View style={styles.contactContent}>

              <Text style={styles.label}>
                Direct Line
              </Text>

              <Text style={styles.linkText}>
                +91 040 23551699
              </Text>

              <Text style={styles.tapHint}>
                Tap to call
              </Text>

            </View>


            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#AFC1D5"
            />

          </Pressable>


          <View style={styles.divider} />


          {/* ------------------------------------------- */}
          {/* EMAIL */}
          {/* ------------------------------------------- */}

          <Pressable
            onPress={emailVensar}
            style={({ pressed }) => [
              styles.contactItemPressable,
              pressed &&
                styles.contactItemPressed,
            ]}
          >

            <View style={styles.contactIcon}>

              <MaterialCommunityIcons
                name="email-outline"
                size={23}
                color="#3F7FD9"
              />

            </View>


            <View style={styles.contactContent}>

              <Text style={styles.label}>
                Email
              </Text>

              <Text style={styles.linkText}>
                info@vensar.com
              </Text>

              <Text style={styles.tapHint}>
                Tap to email
              </Text>

            </View>


            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#AFC1D5"
            />

          </Pressable>


          <View style={styles.divider} />


          {/* ------------------------------------------- */}
          {/* REGISTERED AS */}
          {/* ------------------------------------------- */}

          <ContactItem
            icon="domain"
            label="Registered As"
          >

            <Text style={styles.valueText}>
              Vensar Constructions Company Limited
            </Text>

          </ContactItem>

        </View>


        {/* ================================================= */}
        {/* OFFICE HOURS */}
        {/* ================================================= */}

        <View style={styles.hoursCard}>

          <View style={styles.hoursHeader}>

            <View style={styles.hoursIcon}>

              <MaterialCommunityIcons
                name="clock-outline"
                size={23}
                color="#3F7FD9"
              />

            </View>


            <Text style={styles.hoursTitle}>
              Office Hours
            </Text>

          </View>


          <View style={styles.hoursDivider} />


          {/* Monday - Friday */}

          <View style={styles.hoursRow}>

            <Text style={styles.dayText}>
              Monday – Friday
            </Text>

            <Text style={styles.timeText}>
              9:30 AM – 6:00 PM IST
            </Text>

          </View>


          {/* Saturday */}

          <View style={styles.hoursRow}>

            <Text style={styles.dayText}>
              Saturday
            </Text>

            <Text style={styles.timeText}>
              9:30 AM – 4:00 PM IST
            </Text>

          </View>


          {/* Sunday */}

          <View
            style={[
              styles.hoursRow,
              styles.lastHoursRow,
            ]}
          >

            <Text style={styles.dayText}>
              Sunday
            </Text>

            <Text style={styles.closedText}>
              Closed
            </Text>

          </View>

        </View>


        {/* ================================================= */}
        {/* FOOTER NOTE */}
        {/* ================================================= */}

        <View style={styles.footerCard}>

          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color="#5B93E6"
          />


          <Text style={styles.footerText}>
            For V Drive account, access, or workspace-related
            assistance, please contact your Vensar administrator
            or use the contact details above.
          </Text>

        </View>

      </ScrollView>

    </View>
  );
}


/* ========================================================= */
/* REUSABLE CONTACT ITEM */
/* ========================================================= */

function ContactItem({
  icon,
  label,
  children,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.contactItem}>

      <View style={styles.contactIcon}>

        <MaterialCommunityIcons
          name={icon}
          size={23}
          color="#3F7FD9"
        />

      </View>


      <View style={styles.contactContent}>

        <Text style={styles.label}>
          {label}
        </Text>

        {children}

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
  },


  /* ---------------------------------- */
  /* Header */
  /* ---------------------------------- */

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


  /* ---------------------------------- */
  /* Scroll */
  /* ---------------------------------- */

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 28,
  },


  /* ---------------------------------- */
  /* Hero */
  /* ---------------------------------- */

  hero: {
    alignItems: 'center',
    marginBottom: 25,
  },

  heroIcon: {
    alignItems: 'center',
    backgroundColor: '#E5F1FF',
    borderColor: '#C9E0FA',
    borderRadius: 39,
    borderWidth: 1,
    height: 78,
    justifyContent: 'center',
    marginBottom: 16,
    width: 78,
  },

  heroTitle: {
    color: '#194897',
    fontSize: 27,
    fontWeight: '700',
    textAlign: 'center',
  },

  heroSubtitle: {
    color: '#71839B',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    textAlign: 'center',
  },


  /* ---------------------------------- */
  /* Contact Card */
  /* ---------------------------------- */

  contactCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0EAF5',
    borderRadius: 22,
    borderWidth: 1,
    elevation: 2,
    paddingHorizontal: 18,
    paddingVertical: 6,
    shadowColor: '#194897',
    shadowOffset: {
      height: 3,
      width: 0,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    width: '100%',
  },


  /* ---------------------------------- */
  /* Contact Item */
  /* ---------------------------------- */

  contactItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingVertical: 17,
  },

  contactItemPressable: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 17,
  },

  contactItemPressed: {
    opacity: 0.65,
  },

  contactIcon: {
    alignItems: 'center',
    backgroundColor: '#EDF6FF',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginRight: 13,
    width: 44,
  },

  contactContent: {
    flex: 1,
  },

  label: {
    color: '#8A9BB0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },

  valueText: {
    color: '#53677F',
    fontSize: 15,
    lineHeight: 22,
  },

  linkText: {
    color: '#194897',
    fontSize: 16,
    fontWeight: '600',
  },

  tapHint: {
    color: '#5B93E6',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },


  /* ---------------------------------- */
  /* Divider */
  /* ---------------------------------- */

  divider: {
    backgroundColor: '#E7EEF6',
    height: 1,
    marginLeft: 57,
  },


  /* ---------------------------------- */
  /* Office Hours */
  /* ---------------------------------- */

  hoursCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0EAF5',
    borderRadius: 22,
    borderWidth: 1,
    elevation: 2,
    marginTop: 17,
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#194897',
    shadowOffset: {
      height: 3,
      width: 0,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    width: '100%',
  },

  hoursHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  hoursIcon: {
    alignItems: 'center',
    backgroundColor: '#EDF6FF',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginRight: 13,
    width: 44,
  },

  hoursTitle: {
    color: '#194897',
    fontSize: 18,
    fontWeight: '700',
  },

  hoursDivider: {
    backgroundColor: '#E7EEF6',
    height: 1,
    marginBottom: 5,
    marginTop: 15,
  },

  hoursRow: {
    alignItems: 'center',
    borderBottomColor: '#E7EEF6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },

  lastHoursRow: {
    borderBottomWidth: 0,
    paddingBottom: 3,
  },

  dayText: {
    color: '#53677F',
    fontSize: 14,
  },

  timeText: {
    color: '#53677F',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },

  closedText: {
    color: '#8A9BB0',
    fontSize: 14,
    fontWeight: '600',
  },


  /* ---------------------------------- */
  /* Footer */
  /* ---------------------------------- */

  footerCard: {
    alignItems: 'flex-start',
    backgroundColor: '#EDF6FF',
    borderColor: '#D8EAFB',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 17,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '100%',
  },

  footerText: {
    color: '#53677F',
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 10,
  },

});