import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import {
  DEFAULT_FOLDER_APPEARANCE,
  getFolderAppearance,
  saveFolderAppearance,
  type FolderAppearanceSettings,
} from '../../../core/settings/folderAppearance';

import { useAppTheme } from '../../../core/theme';
import { fontFamilies } from '../../../core/theme/typography';
import type { RootStackParamList } from '../../../navigation/routes';
import type { ProfileDetail } from '../models/profileModel';
import { useProfileViewModel } from '../viewmodels/useProfileViewModel';

function DetailRow({
  detail,
  isLast,
  isAccount,
  isSecurity,
}: {
  detail: ProfileDetail;
  isLast: boolean;
  isAccount: boolean;
  isSecurity: boolean;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const displayLabel =
    detail.label === 'Address' ? 'Location' : detail.label;

  const isDesignation = displayLabel === 'Designation';

  const shouldStack =
    !isDesignation && detail.value.length > 34;

  return (
    <View
      style={[
        styles.detailRow,
        isAccount && styles.accountDetailRow,
        shouldStack && styles.stackedDetailRow,
      ]}
    >
      <View
        style={[
          styles.detailIcon,
          {
            backgroundColor: isAccount
              ? `${colors.primary}0D`
              : colors.surfaceMuted,
          },
        ]}
      >
        <Icon
          color={colors.primary}
          size={isAccount ? 19 : 20}
          source={detail.icon}
        />
      </View>

      <View
        style={[
          styles.detailContent,
          shouldStack && styles.stackedDetailContent,
          !isLast && styles.detailDivider,
          !isLast && {
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.detailLabel,
            isAccount && styles.accountDetailLabel,
            shouldStack && styles.stackedDetailLabel,
            {
              color: isAccount
                ? colors.textMuted
                : colors.text,
            },
          ]}
        >
          {displayLabel}
        </Text>

        <Text
          ellipsizeMode="tail"
          numberOfLines={
            isDesignation
              ? 2
              : shouldStack
                ? 3
                : 1
          }
          selectable
          style={[
            styles.detailValue,
            isAccount && styles.accountDetailValue,
            isDesignation && styles.designationDetailValue,
            shouldStack && styles.stackedDetailValue,
            {
              color: isAccount
                ? detail.valueTone === 'positive'
                  ? colors.success
                  : colors.text
                : detail.valueTone === 'positive'
                  ? colors.success
                  : colors.textMuted,
            },
          ]}
        >
          {isDesignation &&
          detail.value.trim().split(/\s+/).length === 2 ? (
            <>
              <Text style={styles.designationFirstLine}>
                {detail.value.trim().split(/\s+/)[0]}
              </Text>
              {'\n'}
              {detail.value.trim().split(/\s+/)[1]}
            </>
          ) : (
            detail.value
          )}
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

  const [folderAppearance, setFolderAppearance] =
    useState<FolderAppearanceSettings>(
      DEFAULT_FOLDER_APPEARANCE,
    );

  const [
    isFolderAppearanceModalVisible,
    setFolderAppearanceModalVisible,
  ] = useState(false);

  useEffect(() => {
    void getFolderAppearance().then(setFolderAppearance);
  }, []);

  const appVersion =
    Constants.expoConfig?.version ?? '1.0.0';

  const handleSignedOut = useCallback(() => {
    navigation
      .getParent<
        NativeStackNavigationProp<RootStackParamList>
      >()
      ?.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
  }, [navigation]);

  const vm = useProfileViewModel(handleSignedOut);

  const confirmSignOut = () => {
    Alert.alert(
      'Sign out?',
      'You will need to verify your work account again.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: vm.signOut,
        },
      ],
    );
  };

  const openAccessRequests = () => {
    navigation
      .getParent<NativeStackNavigationProp<RootStackParamList>>()
      ?.navigate('AccessRequests');
  };

  return (
    <><ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: insets.bottom + 30,
          paddingHorizontal: responsive.horizontalPadding,
          paddingTop: (responsive.isCompact ? 8 : 16) +
            (process.env.EXPO_OS === 'android'
              ? insets.top
              : 0),
        },
      ]}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.content,
          {
            maxWidth: responsive.maxContentWidth,
          },
        ]}
      >
        <View style={styles.topBar}>
          <Text
            accessibilityRole="header"
            style={[
              styles.pageTitle,
              { color: colors.text },
            ]}
          >
            Account
          </Text>

          {/* V DRIVE LOGO */}
          {/* No dark-mode box/background/border/shadow */}
          <View style={styles.brandLogoSurface}>
            <Image
              accessibilityLabel="V Drive by Vensar"
              contentFit="contain"
              source={colorScheme === 'dark'
                ? require('../../../../assets/onedrive-vensar-dark.png')
                : require('../../../../assets/onedrive-vensar-light.png')}
              style={styles.brandLogo} />
          </View>
        </View>

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surface,
              borderColor: `${colors.primary}22`,
              boxShadow: colorScheme === 'dark'
                ? '0 10px 28px rgba(0, 0, 0, 0.24)'
                : '0 10px 28px rgba(29, 78, 121, 0.08)',
            },
          ]}
        >
          <View
            style={[
              styles.profileGlow,
              {
                backgroundColor: `${colors.primary}14`,
              },
            ]} />

          <View
            style={[
              styles.profileGlowSmall,
              {
                backgroundColor: `${colors.primary}0A`,
              },
            ]} />

          <View style={styles.profileIdentityRow}>
            <View
              style={[
                styles.avatarRing,
                {
                  borderColor: `${colors.primary}35`,
                  backgroundColor: `${colors.primary}0D`,
                },
              ]}
            >
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                {vm.profile.avatar ? (
                  <Image
                    accessibilityLabel={`${vm.profile.displayName} profile photo`}
                    source={vm.profile.avatar}
                    style={styles.avatarImage} />
                ) : (
                  <Text
                    style={[
                      styles.avatarText,
                      {
                        color: colors.onPrimary,
                      },
                    ]}
                  >
                    {vm.profile.initials}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.identity}>
              <Text
                ellipsizeMode="tail"
                numberOfLines={2}
                selectable
                style={[
                  styles.name,
                  { color: colors.text },
                ]}
              >
                {vm.profile.displayName}
              </Text>

              <Text
                ellipsizeMode="middle"
                numberOfLines={1}
                selectable
                style={[
                  styles.email,
                  { color: colors.textMuted },
                ]}
              >
                {vm.profile.email}
              </Text>

              <View
                style={[
                  styles.accountBadge,
                  {
                    backgroundColor: `${colors.primary}10`,
                    borderColor: `${colors.primary}20`,
                  },
                ]}
              >
                <Icon
                  color={colors.primary}
                  size={13}
                  source="briefcase-outline" />

                <Text
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  style={[
                    styles.accountBadgeText,
                    { color: colors.primary },
                  ]}
                >
                  {vm.profile.role}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.profileSecurityRow,
              {
                backgroundColor: colorScheme === 'dark'
                  ? `${colors.primary}0A`
                  : `${colors.primary}08`,
                borderTopColor: `${colors.primary}16`,
              },
            ]}
          >
            <View
              style={[
                styles.securityIcon,
                {
                  backgroundColor: `${colors.primary}12`,
                },
              ]}
            >
              <Icon
                color={colors.primary}
                size={15}
                source="shield-check-outline" />
            </View>

            <Text
              style={[
                styles.readOnlyText,
                { color: colors.textMuted },
              ]}
            >
              Managed securely by Vensar
            </Text>

            <Icon
              color={colors.primary}
              size={16}
              source="check-circle-outline" />
          </View>
        </View>

        {vm.sections.map((section) => {
          const sectionKey = section.title.trim().toLowerCase();

          const isAccountSection = sectionKey === 'account';

          const isSecuritySection = sectionKey.includes('security') ||
            sectionKey.includes('access');

          return (
            <View
              key={section.title}
              style={styles.section}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.textMuted },
                ]}
              >
                {section.title}
              </Text>

              <View
                style={[
                  styles.sectionCard,
                  isAccountSection &&
                  styles.accountSectionCard,
                  isSecuritySection &&
                  styles.securitySectionCard,
                  {
                    boxShadow: isAccountSection
                      ? colorScheme === 'dark'
                        ? '0 7px 20px rgba(0, 0, 0, 0.20)'
                        : '0 7px 20px rgba(29, 78, 121, 0.055)'
                      : isSecuritySection
                        ? colorScheme === 'dark'
                          ? '0 7px 20px rgba(0, 0, 0, 0.18)'
                          : '0 7px 20px rgba(29, 78, 121, 0.045)'
                        : undefined,
                    borderColor: isSecuritySection
                      ? `${colors.primary}20`
                      : colors.border,
                    backgroundColor: isSecuritySection
                      ? `${colors.primary}04`
                      : colors.surface,
                  },
                ]}
              >
                {section.details.map(
                  (detail, index) => (
                    <DetailRow
                      detail={detail}
                      isAccount={section.title
                        .trim()
                        .toLowerCase() ===
                        'account'}
                      isSecurity={isSecuritySection}
                      isLast={index ===
                        section.details.length - 1}
                      key={detail.label} />
                  )
                )}
              </View>
            </View>
          );
        })}

        {/* ACCESS REQUESTS */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textMuted },
            ]}
          >
            Access
          </Text>

          <View
            style={[
              styles.sectionCard,
              styles.accessRequestsCard,
              {
                backgroundColor: `${colors.primary}04`,
                borderColor: `${colors.primary}18`,
                boxShadow: colorScheme === 'dark'
                  ? '0 7px 20px rgba(0, 0, 0, 0.18)'
                  : '0 7px 20px rgba(29, 78, 121, 0.045)',
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open access requests"
              onPress={openAccessRequests}
              style={({ pressed }) => [
                styles.accessRequestsButton,
                {
                  backgroundColor: pressed
                    ? `${colors.primary}0C`
                    : 'transparent',
                },
              ]}
            >
              <View
                style={[
                  styles.detailIcon,
                  {
                    backgroundColor: `${colors.primary}0D`,
                  },
                ]}
              >
                <Icon
                  color={colors.primary}
                  size={20}
                  source="lock-open-outline" />
              </View>

              <View
                style={styles.accessRequestsContent}
              >
                <Text
                  style={[
                    styles.accessRequestsTitle,
                    { color: colors.text },
                  ]}
                >
                  Access Requests
                </Text>

                <Text
                  style={[
                    styles.accessRequestsSubtitle,
                    { color: colors.textMuted },
                  ]}
                >
                  View requests you've sent
                </Text>
              </View>

              <Icon
                color={colors.textMuted}
                size={22}
                source="chevron-right" />
            </Pressable>
          </View>
        </View>

        {/* APPEARANCE */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textMuted },
            ]}
          >
            Appearance
          </Text>

          <View
            style={[
              styles.sectionCard,
              styles.appearanceSectionCard,
              {
                backgroundColor: `${colors.primary}04`,
                borderColor: `${colors.primary}18`,
                boxShadow: colorScheme === 'dark'
                  ? '0 7px 20px rgba(0, 0, 0, 0.18)'
                  : '0 7px 20px rgba(29, 78, 121, 0.045)',
              },
            ]}
          >
            <View style={styles.appearanceRow}>
              <View
                style={[
                  styles.detailIcon,
                  {
                    backgroundColor: `${colors.primary}0D`,
                  },
                ]}
              >
                <Icon
                  color={colors.primary}
                  size={20}
                  source={vm.isDarkMode
                    ? 'weather-night'
                    : 'white-balance-sunny'} />
              </View>

              <View style={styles.appearanceContent}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: colors.text },
                  ]}
                >
                  Dark mode
                </Text>

                <View style={styles.switchContainer}>
                  <Switch
                    accessibilityLabel="Dark mode"
                    onValueChange={vm.setDarkMode}
                    thumbColor={colors.onPrimary}
                    trackColor={{
                      false: colors.border,
                      true: colors.primary,
                    }}
                    value={vm.isDarkMode} />
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Folder Appearance"
              onPress={() => {
                setFolderAppearanceModalVisible(true);
              } }
              style={({ pressed }) => [
                styles.appearanceRow,
                {
                  backgroundColor: pressed
                    ? `${colors.primary}08`
                    : 'transparent',
                },
              ]}
            >
              <View
                style={[
                  styles.detailIcon,
                  {
                    backgroundColor: `${colors.primary}0D`,
                  },
                ]}
              >
                <Icon
                  color={colors.primary}
                  size={20}
                  source="folder-outline" />
              </View>

              <View style={styles.appearanceContent}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: colors.text },
                  ]}
                >
                  Folder Appearance
                </Text>

                <Text
                  style={[
                    styles.folderAppearanceValue,
                    { color: colors.textMuted },
                  ]}
                >
                  {folderAppearance.mode === 'service'
                    ? 'Service Colors'
                    : 'Monochrome'}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.signOutSection,
            {
              backgroundColor: `${colors.danger}04`,
              borderColor: `${colors.danger}18`,
              boxShadow: colorScheme === 'dark'
                ? '0 7px 20px rgba(0, 0, 0, 0.16)'
                : '0 7px 20px rgba(180, 45, 45, 0.035)',
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            disabled={vm.isSigningOut}
            onPress={confirmSignOut}
            style={({ pressed }) => [
              styles.signOutButton,
              {
                backgroundColor: pressed
                  ? `${colors.danger}0C`
                  : 'transparent',
                opacity: vm.isSigningOut
                  ? 0.65
                  : 1,
              },
            ]}
          >
            {vm.isSigningOut ? (
              <ActivityIndicator
                color={colors.danger}
                size="small" />
            ) : (
              <Icon
                color={colors.danger}
                size={20}
                source="logout" />
            )}

            <Text
              style={[
                styles.signOutText,
                { color: colors.danger },
              ]}
            >
              Sign out
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.versionText,
              { color: colors.primary },
            ]}
          >
            App Version {appVersion}
          </Text>
        </View>
      </View>
    </ScrollView><Modal
      animationType="fade"
      transparent
      visible={isFolderAppearanceModalVisible}
      onRequestClose={() => {
        setFolderAppearanceModalVisible(false);
      } }
    >
        <Pressable
          style={styles.folderAppearanceModalOverlay}
          onPress={() => {
            setFolderAppearanceModalVisible(false);
          } }
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              styles.folderAppearanceModalCard,
              {
                backgroundColor: colors.surface,
                borderColor: `${colors.primary}20`,
                boxShadow: colorScheme === 'dark'
                  ? '0 12px 34px rgba(0, 0, 0, 0.35)'
                  : '0 12px 34px rgba(29, 78, 121, 0.14)',
              },
            ]}
          >
            <View style={styles.folderAppearanceModalHeader}>
              <View
                style={[
                  styles.folderAppearanceModalIcon,
                  { backgroundColor: `${colors.primary}12` },
                ]}
              >
                <Icon color={colors.primary} size={21} source="folder-outline" />
              </View>

              <View style={styles.folderAppearanceModalHeaderText}>
                <Text
                  style={[styles.folderAppearanceModalTitle, { color: colors.text }]}
                >
                  Folder appearance
                </Text>
                <Text
                  style={[styles.folderAppearanceModalSubtitle, { color: colors.textMuted }]}
                >
                  Choose how your folders should look
                </Text>
              </View>
            </View>

            <View style={styles.folderAppearanceModeSection}>
              <View
                style={[
                  styles.folderAppearanceModeToggle,
                  {
                    backgroundColor: colorScheme === 'dark'
                      ? `${colors.primary}08`
                      : colors.surfaceMuted,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected: folderAppearance.mode === 'service',
                  }}
                  onPress={async () => {
                    const nextSettings: FolderAppearanceSettings = {
                      mode: 'service',
                      color: folderAppearance.color,
                    };

                    setFolderAppearance(nextSettings);
                    await saveFolderAppearance(nextSettings);
                  } }
                  style={[
                    styles.folderAppearanceModeOption,
                    folderAppearance.mode === 'service' && {
                      backgroundColor: colors.surface,
                      boxShadow: colorScheme === 'dark'
                        ? '0 2px 6px rgba(0, 0, 0, 0.18)'
                        : '0 2px 6px rgba(29, 78, 121, 0.08)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.folderAppearanceModeOptionText,
                      {
                        color: folderAppearance.mode === 'service'
                          ? colors.primary
                          : colors.textMuted,
                      },
                    ]}
                  >
                    Service Colors
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected: folderAppearance.mode === 'monochrome',
                  }}
                  onPress={async () => {
                    const nextSettings: FolderAppearanceSettings = {
                      mode: 'monochrome',
                      color: folderAppearance.color,
                    };

                    setFolderAppearance(nextSettings);
                    await saveFolderAppearance(nextSettings);
                  } }
                  style={[
                    styles.folderAppearanceModeOption,
                    folderAppearance.mode === 'monochrome' && {
                      backgroundColor: colors.surface,
                      boxShadow: colorScheme === 'dark'
                        ? '0 2px 6px rgba(0, 0, 0, 0.18)'
                        : '0 2px 6px rgba(29, 78, 121, 0.08)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.folderAppearanceModeOptionText,
                      {
                        color: folderAppearance.mode === 'monochrome'
                          ? colors.primary
                          : colors.textMuted,
                      },
                    ]}
                  >
                    Monochrome
                  </Text>
                </Pressable>
              </View>

              <Text
                style={[
                  styles.folderAppearanceModeDescription,
                  { color: colors.textMuted },
                ]}
              >
                {folderAppearance.mode === 'service'
                  ? 'Keep category-specific colors for your folders'
                  : 'Use one V Drive color for every folder'}
              </Text>
            </View>

            {folderAppearance.mode === 'monochrome' ? (
              <View style={styles.folderAppearanceColorSection}>
                <Text
                  style={[
                    styles.folderAppearanceColorSectionTitle,
                    { color: colors.textMuted },
                  ]}
                >
                  FOLDER COLOR
                </Text>

                <View
                  style={[
                    styles.folderAppearanceColorOptions,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  {[
                    { label: 'Blue', color: '#2F80ED' as const },
                    { label: 'Green', color: '#27AE60' as const },
                    { label: 'Orange', color: '#F2994A' as const },
                  ].map((option, index) => {
                    const selected = folderAppearance.color === option.color;

                    return (
                      <Pressable
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        key={option.label}
                        onPress={async () => {
                          const nextSettings: FolderAppearanceSettings = {
                            mode: 'monochrome',
                            color: option.color,
                          };

                          setFolderAppearance(nextSettings);
                          await saveFolderAppearance(nextSettings);
                        } }
                        style={({ pressed }) => [
                          styles.folderAppearanceColorOption,
                          {
                            backgroundColor: pressed
                              ? `${option.color}0A`
                              : selected
                                ? `${option.color}08`
                                : 'transparent',
                            borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                            borderTopColor: colors.border,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.folderAppearanceColorDot,
                            { backgroundColor: option.color },
                          ]} />

                        <Text
                          style={[
                            styles.folderAppearanceColorOptionText,
                            { color: colors.text },
                          ]}
                        >
                          {option.label}
                        </Text>

                        {selected ? (
                          <View
                            style={[
                              styles.folderAppearanceCheck,
                              { backgroundColor: option.color },
                            ]}
                          >
                            <Icon
                              color="#FFFFFF"
                              size={13}
                              source="check" />
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close folder appearance"
              onPress={() => {
                setFolderAppearanceModalVisible(false);
              } }
              style={({ pressed }) => [
                styles.folderAppearanceModalClose,
                {
                  backgroundColor: pressed ? `${colors.primary}0A` : 'transparent',
                },
              ]}
            >
              <Text
                style={[styles.folderAppearanceModalCloseText, { color: colors.primary }]}
              >
                Done
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal></>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scrollContent: {
    alignItems: 'center',
  },

  content: {
    alignSelf: 'center',
    width: '100%',
  },

  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
  },

  pageTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 28,
    letterSpacing: -0.6,
  },

  brandLogo: {
    height: 48,
    width: 48,
  },

  brandLogoSurface: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileCard: {
    borderCurve: 'continuous',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 24,
    overflow: 'hidden',
  },

  profileIdentityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 19,
    minHeight: 168,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
  },

  profileGlow: {
    borderRadius: 140,
    height: 190,
    position: 'absolute',
    right: -72,
    top: -104,
    width: 190,
  },

  profileGlowSmall: {
    borderRadius: 90,
    height: 120,
    position: 'absolute',
    right: 36,
    top: -70,
    width: 120,
  },

  profileSecurityRow: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 9,
    minHeight: 54,
    paddingHorizontal: 18,
  },

  securityIcon: {
    alignItems: 'center',
    borderRadius: 9,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },

  avatarRing: {
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: 7,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },

  avatar: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 80,
  },

  avatarText: {
    fontFamily: fontFamilies.bold,
    fontSize: 21,
    letterSpacing: 0.4,
  },

  avatarImage: {
    height: '100%',
    width: '100%',
  },

  identity: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 4,
    minWidth: 0,
  },

  name: {
    fontFamily: fontFamilies.bold,
    fontSize: 21,
    letterSpacing: -0.25,
    width: '100%',
  },

  email: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    width: '100%',
  },

  accountBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderCurve: 'continuous',
    borderRadius: 99,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  accountBadgeText: {
    flexShrink: 1,
    fontFamily: fontFamilies.semibold,
    fontSize: 12,
    minWidth: 0,
  },

  readOnlyText: {
    flexShrink: 1,
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    textAlign: 'center',
  },

  section: {
    gap: 9,
    paddingTop: 15,
  },

  sectionTitle: {
    fontFamily: fontFamilies.semibold,
    fontSize: 12,
    letterSpacing: 0.7,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
  },

  sectionCard: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  /* ACCESS REQUESTS */

  accessRequestsCard: {
    borderRadius: 21,
    overflow: 'hidden',
  },

  accessRequestsButton: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 76,
    paddingHorizontal: 15,
  },

  accessRequestsContent: {
    flex: 1,
    marginLeft: 13,
    minWidth: 0,
  },

  accessRequestsTitle: {
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
  },

  accessRequestsSubtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    marginTop: 4,
  },

  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 65,
    paddingLeft: 14,
  },

  accountSectionCard: {
    borderRadius: 21,
  },

  securitySectionCard: {
    borderRadius: 21,
    borderWidth: StyleSheet.hairlineWidth,
  },

  accountDetailRow: {
    minHeight: 72,
    paddingLeft: 15,
  },

  securityDetailRow: {
    minHeight: 68,
    paddingLeft: 15,
  },

  detailIcon: {
    alignItems: 'center',
    borderRadius: 11,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },

  detailContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 65,
    minWidth: 0,
    paddingHorizontal: 15,
  },

  detailDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  detailLabel: {
    flex: 1,
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
    minWidth: 0,
  },

  detailValue: {
    flexShrink: 1,
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    maxWidth: '62%',
    minWidth: 0,
    textAlign: 'right',
  },

  accountDetailLabel: {
    fontFamily: fontFamilies.semibold,
    fontSize: 12.5,
    letterSpacing: 0.1,
  },

  accountDetailValue: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    maxWidth: '68%',
  },

  designationDetailValue: {
    lineHeight: 18,
    maxWidth: '68%',
    textAlign: 'right',
  },

  designationFirstLine: {
    fontFamily: fontFamilies.regular,
  },

  stackedDetailRow: {
    minHeight: 82,
  },

  stackedDetailContent: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 3,
    justifyContent: 'center',
    paddingVertical: 11,
  },

  stackedDetailLabel: {
    flex: 0,
  },

  stackedDetailValue: {
    lineHeight: 18,
    maxWidth: '100%',
    textAlign: 'left',
    transform: [
      { translateX: 12 },
      { translateY: -2 },
    ],
    width: '100%',
  },

  appearanceSectionCard: {
    borderRadius: 21,
    overflow: 'hidden',
  },

  appearanceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 70,
    paddingLeft: 15,
  },

  appearanceContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 70,
    paddingHorizontal: 15,
  },

  switchContainer: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    minWidth: 52,
  },

  folderAppearanceValue: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
  },

  folderAppearanceModalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.46)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  folderAppearanceModalCard: {
    borderCurve: 'continuous',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 430,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    width: '100%',
  },

  folderAppearanceModalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
    paddingBottom: 14,
  },

  folderAppearanceModalIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },

  folderAppearanceModalHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  folderAppearanceModalTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 19,
    letterSpacing: -0.25,
  },

  folderAppearanceModalSubtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: 12.5,
    marginTop: 2,
  },

  folderAppearanceModeSection: {
    marginTop: 2,
  },

  folderAppearanceModeToggle: {
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    padding: 3,
  },

  folderAppearanceModeOption: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 8,
  },

  folderAppearanceModeOptionText: {
    fontFamily: fontFamilies.semibold,
    fontSize: 12.5,
  },

  folderAppearanceModeDescription: {
    fontFamily: fontFamilies.regular,
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 8,
    paddingHorizontal: 2,
  },

  folderAppearanceColorSection: {
    marginTop: 15,
  },

  folderAppearanceColorSectionTitle: {
    fontFamily: fontFamilies.semibold,
    fontSize: 9.5,
    letterSpacing: 1,
    marginBottom: 7,
    paddingHorizontal: 2,
  },

  folderAppearanceColorOptions: {
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  folderAppearanceColorOption: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
    minHeight: 48,
    paddingHorizontal: 12,
  },

  folderAppearanceColorOptionText: {
    flex: 1,
    fontFamily: fontFamilies.semibold,
    fontSize: 13,
  },

  folderAppearanceColorDot: {
    borderRadius: 999,
    height: 18,
    width: 18,
  },

  folderAppearanceCheck: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },

  folderAppearanceModalClose: {
    alignItems: 'center',
    borderRadius: 13,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 42,
  },

  folderAppearanceModalCloseText: {
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
  },

  signOutSection: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 24,
    overflow: 'hidden',
  },

  signOutButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 18,
  },

  signOutText: {
    fontFamily: fontFamilies.semibold,
    fontSize: 15,
  },

  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    justifyContent: 'center',
    paddingTop: 18,
  },

  footerText: {
    fontFamily: fontFamilies.regular,
    fontSize: 11,
  },

  versionBadge: {
    borderCurve: 'continuous',
    borderRadius: 99,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  versionText: {
    fontFamily: fontFamilies.semibold,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
});