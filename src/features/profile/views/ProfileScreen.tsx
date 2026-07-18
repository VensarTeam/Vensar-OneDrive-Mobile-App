import { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsiveLayout } from '../../../core/responsive';
import { useAppTheme } from '../../../core/theme';
import { fontFamilies } from '../../../core/theme/typography';
import type { RootStackParamList } from '../../../navigation/routes';
import type { ProfileDetail } from '../models/profileModel';
import { useProfileViewModel } from '../viewmodels/useProfileViewModel';

function DetailRow({ detail, isLast }: { detail: ProfileDetail; isLast: boolean }) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={styles.detailRow}>
      <View style={[styles.detailIcon, { backgroundColor: colors.surfaceMuted }]}> 
        <Icon color={colors.primary} size={20} source={detail.icon} />
      </View>
      <View
        style={[
          styles.detailContent,
          !isLast && styles.detailDivider,
          !isLast && { borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.detailLabel, { color: colors.text }]}>{detail.label}</Text>
        <Text
          numberOfLines={1}
          selectable
          style={[
            styles.detailValue,
            { color: detail.valueTone === 'positive' ? colors.success : colors.textMuted },
          ]}
        >
          {detail.value}
        </Text>
      </View>
    </View>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveLayout();
  const { colorScheme, theme } = useAppTheme();
  const { colors } = theme;
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleSignedOut = useCallback(() => {
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [navigation]);

  const vm = useProfileViewModel(handleSignedOut);

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'You will need to verify your work account again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: vm.signOut },
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: insets.bottom + 30,
          paddingHorizontal: responsive.horizontalPadding,
          paddingTop: responsive.isCompact ? 8 : 16,
        },
      ]}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={[styles.content, { maxWidth: responsive.maxContentWidth }]}> 
        <View style={styles.topBar}>
          <Text accessibilityRole="header" style={[styles.pageTitle, { color: colors.text }]}>Account</Text>
          <Image
            accessibilityLabel="OneDrive by Vensar"
            contentFit="contain"
            source={
              colorScheme === 'dark'
                ? require('../../../../assets/onedrive-vensar-dark.png')
                : require('../../../../assets/onedrive-vensar-light.png')
            }
            style={styles.brandLogo}
          />
        </View>

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              boxShadow: colorScheme === 'dark'
                ? '0 12px 36px rgba(0, 0, 0, 0.25)'
                : '0 12px 36px rgba(29, 78, 121, 0.10)',
            },
          ]}
        >
          <View style={[styles.glow, { backgroundColor: `${colors.primary}18` }]} />
          <View style={[styles.avatarRing, { borderColor: `${colors.primary}28` }]}> 
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}> 
              {vm.profile.avatar ? (
                <Image accessibilityLabel={`${vm.profile.displayName} profile photo`} source={vm.profile.avatar} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: colors.onPrimary }]}>{vm.profile.initials}</Text>
              )}
            </View>
          </View>
          <View style={styles.identity}>
            <Text selectable style={[styles.name, { color: colors.text }]}>{vm.profile.displayName}</Text>
            <Text selectable style={[styles.email, { color: colors.textMuted }]}>{vm.profile.email}</Text>
            <View style={[styles.accountBadge, { backgroundColor: colors.surfaceMuted }]}> 
              <Icon color={colors.primary} size={14} source="briefcase-outline" />
              <Text style={[styles.accountBadgeText, { color: colors.primary }]}>{vm.profile.role}</Text>
            </View>
          </View>
        </View>

        <View style={styles.readOnlyBanner}>
          <Icon color={colors.textMuted} size={17} source="shield-lock-outline" />
          <Text style={[styles.readOnlyText, { color: colors.textMuted }]}>Managed securely by Vensar</Text>
        </View>

        {vm.sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              {section.details.map((detail, index) => (
                <DetailRow
                  detail={detail}
                  isLast={index === section.details.length - 1}
                  key={detail.label}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Appearance</Text>
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.appearanceRow}>
              <View style={[styles.detailIcon, { backgroundColor: colors.surfaceMuted }]}>
                <Icon
                  color={colors.primary}
                  size={20}
                  source={vm.isDarkMode ? 'weather-night' : 'white-balance-sunny'}
                />
              </View>
              <View style={styles.appearanceContent}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Dark mode</Text>
                <Switch
                  accessibilityLabel="Dark mode"
                  onValueChange={vm.setDarkMode}
                  thumbColor={colors.onPrimary}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  value={vm.isDarkMode}
                />
              </View>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={vm.isSigningOut}
          onPress={confirmSignOut}
          style={({ pressed }) => [
            styles.signOutButton,
            {
              backgroundColor: pressed ? `${colors.danger}12` : colors.surface,
              borderColor: colors.border,
              opacity: vm.isSigningOut ? 0.65 : 1,
            },
          ]}
        >
          {vm.isSigningOut ? (
            <ActivityIndicator color={colors.danger} size="small" />
          ) : (
            <Icon color={colors.danger} size={20} source="logout" />
          )}
          <Text style={[styles.signOutText, { color: colors.danger }]}>Sign out</Text>
        </Pressable>
        <View style={styles.footer}>
            <Text style={[styles.versionText, { color: colors.primary }]}>App Version {appVersion}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { alignItems: 'center' },
  content: { alignSelf: 'center', width: '100%' },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 48 },
  pageTitle: { fontFamily: fontFamilies.bold, fontSize: 28, letterSpacing: -0.6 },
  brandLogo: { height: 44, width: 80},
  profileCard: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 18,
    marginTop: 24,
    minHeight: 156,
    overflow: 'hidden',
    padding: 22,
  },
  glow: { borderRadius: 120, height: 170, position: 'absolute', right: -58, top: -86, width: 170 },
  avatarRing: { alignItems: 'center', borderRadius: 40, borderWidth: 6, height: 80, justifyContent: 'center', width: 80 },
  avatar: { alignItems: 'center', borderRadius: 33, height: 66, justifyContent: 'center', overflow: 'hidden', width: 66 },
  avatarText: { fontFamily: fontFamilies.bold, fontSize: 21, letterSpacing: 0.4 },
  avatarImage: { height: '100%', width: '100%' },
  identity: { alignItems: 'flex-start', flex: 1, gap: 4 },
  name: { fontFamily: fontFamilies.bold, fontSize: 21, letterSpacing: -0.25 },
  email: { fontFamily: fontFamilies.regular, fontSize: 14 },
  accountBadge: { alignItems: 'center', borderRadius: 99, flexDirection: 'row', gap: 6, marginTop: 7, paddingHorizontal: 10, paddingVertical: 6 },
  accountBadgeText: { fontFamily: fontFamilies.semibold, fontSize: 12 },
  readOnlyBanner: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center', paddingVertical: 17 },
  readOnlyText: { fontFamily: fontFamilies.regular, fontSize: 12 },
  section: { gap: 9, paddingTop: 15 },
  sectionTitle: { fontFamily: fontFamilies.semibold, fontSize: 12, letterSpacing: 0.7, paddingHorizontal: 4, textTransform: 'uppercase' },
  sectionCard: { borderCurve: 'continuous', borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  detailRow: { alignItems: 'center', flexDirection: 'row', minHeight: 65, paddingLeft: 14 },
  detailIcon: { alignItems: 'center', borderRadius: 11, height: 38, justifyContent: 'center', width: 38 },
  detailContent: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12, justifyContent: 'space-between', minHeight: 65, paddingHorizontal: 15 },
  detailDivider: { borderBottomWidth: StyleSheet.hairlineWidth },
  detailLabel: { flex: 1, fontFamily: fontFamilies.semibold, fontSize: 14 },
  detailValue: { flexShrink: 1, fontFamily: fontFamilies.regular, fontSize: 13, textAlign: 'right' },
  appearanceRow: { alignItems: 'center', flexDirection: 'row', minHeight: 65, paddingLeft: 14 },
  appearanceContent: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12, minHeight: 65, paddingHorizontal: 15 },
  signOutButton: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 27, minHeight: 54, paddingHorizontal: 18 },
  signOutText: { fontFamily: fontFamilies.semibold, fontSize: 15 },
  footer: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center', paddingTop: 18 },
  footerText: { fontFamily: fontFamilies.regular, fontSize: 11 },
  versionBadge: { borderCurve: 'continuous', borderRadius: 99, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 8, paddingVertical: 4 },
  versionText: { fontFamily: fontFamilies.semibold, fontSize: 16, fontVariant: ['tabular-nums'] },
});
