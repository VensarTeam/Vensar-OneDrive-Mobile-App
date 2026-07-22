import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import Animated, { Easing, FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsiveLayout } from '../../../core/responsive';
import { useAppTheme } from '../../../core/theme';
import { fontFamilies } from '../../../core/theme/typography';
import type { HomeTabParamList } from '../../../navigation/HomeTabs';
import { useAuthSession } from '../../auth/services/auth-session-provider';
import type { Service } from '../models/service-model';
import { useHomeViewModel } from '../viewmodels/useHomeViewModel';

const serviceIcons: Record<string, string> = {
  airports: 'airplane',
  automation: 'robot-industrial',
  'car-parks': 'car-multiple',
  commercial: 'office-building',
  elevated: 'bridge',
  facilities: 'domain',
  factories: 'factory',
  highways: 'highway',
  'hydro-power': 'hydro-power',
  industrial: 'city-variant-outline',
  institutional: 'bank-outline',
  'intake-treatment': 'water-pump',
  irrigation: 'sprinkler-variant',
  metro: 'subway-variant',
  mining: 'pickaxe',
  'ohd-substation': 'transmission-tower',
  pipeline: 'pipe',
  'power-plants': 'lightning-bolt',
  railways: 'train',
  'railway-stations': 'train-car',
  residential: 'home-city-outline',
  'storage-distribution': 'warehouse',
  transmission: 'transmission-tower-export',
  'transit-terminals': 'bus-marker',
  tunnels: 'tunnel-outline',
};

const serviceAccentColor = '#062F7D';
type ServicesViewMode = 'grid' | 'list';

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase())
    .join('') || 'U';
}

export function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<HomeTabParamList, 'Dashboard'>>();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const { colorScheme, theme } = useAppTheme();
  const { colors } = theme;
  const vm = useHomeViewModel();
  const { user } = useAuthSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [servicesViewMode, setServicesViewMode] = useState<ServicesViewMode>('grid');
  const searchInputRef = useRef<TextInput>(null);
  const searchWidth = useSharedValue(42);
  const columns = layout.isCompact ? 3 : 4;
  const displayName = user?.name || 'User';
  const expandedSearchWidth = Math.min(
    layout.width - (layout.horizontalPadding * 2) - 104,
    layout.isCompact ? 236 : 340,
  );
  const animatedSearchStyle = useAnimatedStyle(() => ({
    width: searchWidth.value,
  }));

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  function openSearch() {
    setIsSearchOpen(true);
    searchWidth.value = withTiming(expandedSearchWidth, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  }

  function closeSearch() {
    Keyboard.dismiss();
    vm.clearSearch();
    searchWidth.value = withTiming(42, {
      duration: 220,
      easing: Easing.inOut(Easing.cubic),
    });
    setTimeout(() => setIsSearchOpen(false), 220);
  }

  return (
    <View
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={[styles.contentInner, { maxWidth: layout.maxContentWidth }]}>
        <View
          style={[
            styles.fixedContent,
            {
              paddingHorizontal: layout.horizontalPadding,
              paddingTop: insets.top + 8,
            },
          ]}
        >
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image
              accessibilityLabel="V Drive by Vensar"
              contentFit="contain"
              source={
                colorScheme === 'dark'
                  ? require('../../../../assets/onedrive-vensar-dark.png')
                  : require('../../../../assets/onedrive-vensar-light.png')
              }
              style={styles.brandLogo}
            />
          </View>
          <Pressable
            accessibilityHint="Opens your profile"
            accessibilityLabel={`${displayName} profile`}
            accessibilityRole="button"
            onPress={() => navigation.navigate('Profile')}
            style={({ pressed }) => [styles.userGreeting, { opacity: pressed ? 0.72 : 1 }]}
          >
            <View style={styles.greetingCopy}>
              <Text style={[styles.welcomeLabel, { color: colors.textMuted }]}>Welcome,</Text>
              <Text numberOfLines={1} selectable style={[styles.welcomeName, { color: colors.text }]}>
                {displayName}
              </Text>
            </View>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.surfaceMuted, borderColor: `${colors.primary}22` },
              ]}
            >
              {user?.avatar ? (
                <Image accessibilityLabel={`${displayName} profile photo`} source={user.avatar} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: colors.primary }]}>{getInitials(displayName)}</Text>
              )}
            </View>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text selectable style={[styles.eyebrow, { color: colors.primary }]}>VENSAR SERVICES</Text>
          <Text selectable style={[styles.heroTitle, { color: colors.text }]}>What are you working on?</Text>
          <Text selectable style={[styles.heroCopy, { color: colors.textMuted }]}>
            Find your service area and access its project files.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>Services</Text>
          <View style={styles.toolbarActions}>
            {!isSearchOpen ? (
              <View
                accessibilityLabel="Services view"
                accessibilityRole="tablist"
                style={[styles.viewToggle, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
              >
                {(['grid', 'list'] as const).map((mode) => {
                  const isSelected = servicesViewMode === mode;

                  return (
                    <Pressable
                      accessibilityLabel={`${mode === 'grid' ? 'Grid' : 'List'} view`}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: isSelected }}
                      key={mode}
                      onPress={() => setServicesViewMode(mode)}
                      style={({ pressed }) => [
                        styles.viewToggleButton,
                        {
                          backgroundColor: isSelected ? colors.primary : 'transparent',
                          opacity: pressed ? 0.76 : 1,
                        },
                      ]}
                    >
                      <Icon
                        color={isSelected ? colors.onPrimary : colors.textMuted}
                        size={19}
                        source={mode === 'grid' ? 'view-grid-outline' : 'view-list-outline'}
                      />
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
            <Animated.View
              style={[
                styles.search,
                animatedSearchStyle,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSearchOpen ? colors.primary : colors.border,
                  boxShadow: colorScheme === 'dark'
                    ? '0 5px 14px rgba(0, 0, 0, 0.25)'
                    : '0 5px 14px rgba(27, 48, 78, 0.10)',
                },
              ]}
            >
              {isSearchOpen ? (
                <>
                  <Icon color={colors.primary} size={20} source="magnify" />
                  <TextInput
                    ref={searchInputRef}
                    accessibilityLabel="Search services"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={vm.setSearchQuery}
                    placeholder="Search services"
                    placeholderTextColor={colors.textMuted}
                    returnKeyType="search"
                    selectionColor={colors.primary}
                    style={[styles.searchInput, { color: colors.text }]}
                    value={vm.searchQuery}
                  />
                  <Pressable accessibilityLabel="Close search" hitSlop={8} onPress={closeSearch}>
                    <Icon color={colors.textMuted} size={21} source="close" />
                  </Pressable>
                </>
              ) : (
                <Pressable
                  accessibilityLabel="Open service search"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={openSearch}
                  style={styles.searchButton}
                >
                  <Icon color={colors.primary} size={22} source="magnify" />
                </Pressable>
              )}
            </Animated.View>
          </View>
        </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.servicesContent,
            { paddingHorizontal: layout.horizontalPadding },
          ]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.servicesScroll}
        >
          {vm.isLoading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text selectable style={[styles.stateMessage, { color: colors.textMuted }]}>Loading services…</Text>
            </View>
          ) : vm.error ? (
            <View style={[styles.errorState, { backgroundColor: `${colors.danger}0D`, borderColor: `${colors.danger}30` }]}>
              <View style={[styles.stateIcon, { backgroundColor: `${colors.danger}14` }]}>
                <Icon color={colors.danger} size={25} source="cloud-alert-outline" />
              </View>
              <Text selectable style={[styles.stateTitle, { color: colors.text }]}>Couldn’t load services</Text>
              <Text selectable style={[styles.stateMessage, { color: colors.textMuted }]}>{vm.error}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={vm.loadServices}
                style={({ pressed }) => [styles.retryButton, { backgroundColor: pressed ? colors.primaryPressed : colors.primary }]}
              >
                <Icon color={colors.onPrimary} size={18} source="refresh" />
                <Text style={[styles.retryLabel, { color: colors.onPrimary }]}>Try again</Text>
              </Pressable>
            </View>
          ) : vm.filteredServices.length === 0 ? (
            <View style={styles.stateContainer}>
              <View style={[styles.stateIcon, { backgroundColor: colors.surfaceMuted }]}>
                <Icon color={colors.textMuted} size={25} source="magnify-close" />
              </View>
              <Text selectable style={[styles.stateTitle, { color: colors.text }]}>No matching services</Text>
              <Text selectable style={[styles.stateMessage, { color: colors.textMuted }]}>Try a different service name or keyword.</Text>
            </View>
          ) : servicesViewMode === 'grid' ? (
            <Animated.View entering={FadeIn.duration(180)} style={styles.grid}>
              {vm.filteredServices.map((service) => {
                const openService = () => navigation.navigate('Files', {
                  serviceId: service.serviceId,
                  serviceName: service.serviceName,
                });

                return (
                  <ServiceCard
                    columns={columns}
                    key={service.id}
                    onPress={openService}
                    service={service}
                  />
                );
              })}
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.duration(180)} style={styles.list}>
              {vm.filteredServices.map((service) => (
                <ServiceListItem
                  key={service.id}
                  onPress={() => navigation.navigate('Files', {
                    serviceId: service.serviceId,
                    serviceName: service.serviceName,
                  })}
                  service={service}
                />
              ))}
            </Animated.View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function ServiceListItem({ onPress, service }: { onPress: () => void; service: Service }) {
  const { colorScheme, theme } = useAppTheme();
  const accent = serviceAccentColor;
  const icon = serviceIcons[service.serviceIcon] ?? 'shape-outline';

  return (
    <Pressable
      accessibilityHint="Opens projects and files for this service"
      accessibilityLabel={service.serviceName}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.listCard,
        {
          backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface,
          borderColor: pressed ? theme.colors.primary : theme.colors.border,
          boxShadow: colorScheme === 'dark'
            ? '0 5px 16px rgba(0, 0, 0, 0.20)'
            : '0 5px 16px rgba(27, 48, 78, 0.06)',
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <View style={[styles.listIcon, { backgroundColor: `${accent}12` }]}>
        <Icon color={accent} size={25} source={icon} />
      </View>
      <View style={styles.listCopy}>
        <Text numberOfLines={1} selectable style={[styles.listServiceName, { color: theme.colors.text }]}>
          {service.serviceName}
        </Text>
      </View>
      <View style={[styles.listArrow, { backgroundColor: theme.colors.surfaceMuted }]}>
        <Icon color={theme.colors.primary} size={19} source="chevron-right" />
      </View>
    </Pressable>
  );
}

function ServiceCard({ columns, onPress, service }: { columns: number; onPress: () => void; service: Service }) {
  const { colorScheme, theme } = useAppTheme();
  const accent = serviceAccentColor;
  const icon = serviceIcons[service.serviceIcon] ?? 'shape-outline';

  return (
    <Pressable
      accessibilityHint="Opens projects and files for this service"
      accessibilityLabel={service.serviceName}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface,
          borderColor: pressed ? theme.colors.primary : theme.colors.border,
          boxShadow: colorScheme === 'dark' ? '0 7px 18px rgba(0, 0, 0, 0.22)' : '0 7px 18px rgba(27, 48, 78, 0.07)',
          transform: [{ scale: pressed ? 0.975 : 1 }],
          width: columns === 3 ? '31.5%' : '23.5%',
        },
      ]}
    >
      <View style={styles.cornerIcon}>
        {/* <Icon color={`${accent}66`} size={18} source={icon} /> */}
      </View>
      <View style={styles.folderIcon}>
        <View style={[styles.folderTab, { backgroundColor: accent }]} />
        <View style={[styles.folderFace, { backgroundColor: accent }]} />
        <View style={styles.folderSymbol}>
          <Icon color="#FFFFFF" size={21} source={icon} />
        </View>
      </View>
      <Text
        numberOfLines={2}
        selectable
        style={[styles.serviceName, { color: theme.colors.text }]}
      >
        {service.serviceName}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  contentInner: { alignSelf: 'center', flex: 1, width: '100%' },
  fixedContent: { flexShrink: 0 },
  servicesScroll: { flex: 1 },
  servicesContent: { paddingBottom: 24 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  brand: { flexShrink: 1, height: 54, justifyContent: 'center', transform: [{ translateX: -12 }], width: 144 },
  brandLogo: { height: 64, width: 64 },
  userGreeting: { alignItems: 'center', flexDirection: 'row', flexShrink: 0, gap: 10 },
  greetingCopy: { alignItems: 'flex-end', maxWidth: 104 },
  welcomeLabel: { fontFamily: fontFamilies.regular, fontSize: 11, lineHeight: 14 },
  welcomeName: { fontFamily: fontFamilies.semibold, fontSize: 13, lineHeight: 18 },
  avatar: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, height: 40, justifyContent: 'center', overflow: 'hidden', width: 40 },
  avatarText: { fontFamily: fontFamilies.semibold, fontSize: 13 },
  avatarImage: { height: '100%', width: '100%' },
  hero: { gap: 4, paddingTop: 18 },
  eyebrow: { fontFamily: fontFamilies.bold, fontSize: 14, letterSpacing: 1.3, lineHeight: 16 },
  heroTitle: { fontFamily: fontFamilies.bold, fontSize: 25, letterSpacing: -0.5, lineHeight: 32 },
  heroCopy: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 20 },
  toolbarActions: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  viewToggle: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 21, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 2, height: 42, padding: 3 },
  viewToggleButton: { alignItems: 'center', borderRadius: 17, height: 34, justifyContent: 'center', width: 36 },
  search: { alignItems: 'center', borderRadius: 21, borderWidth: 1, flexDirection: 'row', gap: 9, height: 42, overflow: 'hidden', paddingHorizontal: 10 },
  searchButton: { alignItems: 'center', height: 40, justifyContent: 'center', marginHorizontal: -10, width: 40 },
  searchInput: { flex: 1, fontFamily: fontFamilies.regular, fontSize: 15, height: 40, minWidth: 0, paddingVertical: 0 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between', paddingBottom: 10, paddingTop: 18 },
  sectionTitle: { fontFamily: fontFamilies.bold, fontSize: 21, lineHeight: 27 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  list: { gap: 10 },
  listCard: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 10, minHeight: 58, paddingHorizontal: 10, paddingVertical: 7 },
  listIcon: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 11, height: 42, justifyContent: 'center', width: 42 },
  listCopy: { flex: 1, minWidth: 0 },
  listServiceName: { fontFamily: fontFamilies.semibold, fontSize: 14.5, lineHeight: 20 },
  listArrow: { alignItems: 'center', borderRadius: 14, height: 28, justifyContent: 'center', width: 28 },
  card: { alignItems: 'center', aspectRatio: 1, borderCurve: 'continuous', borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, justifyContent: 'flex-end', paddingBottom: 10, paddingHorizontal: 6, paddingTop: 17, position: 'relative' },
  cornerIcon: { position: 'absolute', right: 8, top: 8 },
  folderIcon: { height: 45, marginBottom: 8, position: 'relative', width: 54 },
  folderTab: { borderRadius: 6, height: 16, left: 2, position: 'absolute', top: 1, width: 27 },
  folderFace: { borderCurve: 'continuous', borderRadius: 7, bottom: 0, height: 38, left: 0, position: 'absolute', width: 54 },
  folderSymbol: { alignItems: 'center', bottom: 3, height: 34, justifyContent: 'center', left: 0, position: 'absolute', width: 54 },
  serviceName: { fontFamily: fontFamilies.semibold, fontSize: 12.5, lineHeight: 16, minHeight: 32, textAlign: 'center', width: '100%' },
  stateContainer: { alignItems: 'center', gap: 9, justifyContent: 'center', minHeight: 220, paddingHorizontal: 24 },
  errorState: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 20, borderWidth: 1, gap: 9, minHeight: 250, padding: 24 },
  stateIcon: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 14, height: 48, justifyContent: 'center', width: 48 },
  stateTitle: { fontFamily: fontFamilies.semibold, fontSize: 16, lineHeight: 22, textAlign: 'center' },
  stateMessage: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retryButton: { alignItems: 'center', borderRadius: 20, flexDirection: 'row', gap: 7, marginTop: 5, minHeight: 40, paddingHorizontal: 17 },
  retryLabel: { fontFamily: fontFamilies.semibold, fontSize: 13 },
});
