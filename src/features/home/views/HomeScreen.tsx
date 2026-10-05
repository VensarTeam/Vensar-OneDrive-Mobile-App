import { useCallback, useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  DEFAULT_FOLDER_APPEARANCE,
  getFolderAppearance,
  type FolderAppearanceSettings,
} from "../../../core/settings/folderAppearance";

import { Image } from "expo-image";

import { LinearGradient } from "expo-linear-gradient";

import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { Icon } from "react-native-paper";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getUnreadNotificationCount } from "../../notifications/services/notification-service";

import { useResponsiveLayout } from "../../../core/responsive";

import { useAppTheme } from "../../../core/theme";
import { apiRequest } from '../../../core/api/apiClient';
import type { ApiEnvelope } from '../../../core/api/api-response';
import { unwrapApiData } from '../../../core/api/api-response';

import { fontFamilies } from "../../../core/theme/typography";

import type { HomeTabParamList } from "../../../navigation/HomeTabs";

import type { RootStackParamList } from "../../../navigation/routes";

import { useAuthSession } from "../../auth/services/auth-session-provider";

import type { Service } from "../models/service-model";

import { useHomeViewModel } from "../viewmodels/useHomeViewModel";

import {
  clearRecentlyOpened,
  getRecentlyOpened,
  type RecentlyOpenedItem,
} from "../../drive/services/recently-opened-service";

import {
  getStarredItems,
  toggleStarred,
  type StarredItem,
} from "../../../core/settings/starred";

const serviceIcons: Record<string, string> = {
  airports: "airplane",

  automation: "robot-industrial",

  "banking-financial": "bank",

  "car-parks": "car-multiple",

  commercial: "office-building",

  "company-documents": "file-document-outline",

  elevated: "bridge",

  facilities: "domain",

  factories: "factory",

  highways: "highway",

  "hydro-power": "hydro-power",

  industrial: "city-variant-outline",

  institutional: "bank-outline",

  "intake-treatment": "water-pump",

  irrigation: "sprinkler-variant",

  metro: "subway-variant",

  mining: "pickaxe",

  "ohd-substation": "transmission-tower",

  pipeline: "pipe",

  "power-plants": "lightning-bolt",

  railways: "train",

  "railway-stations": "train-car",

  residential: "home-city-outline",

  "storage-distribution": "warehouse",

  transmission: "transmission-tower-export",

  "transit-terminals": "bus-marker",

  tunnels: "tunnel-outline",
};

const serviceNameIcons: Record<string, string> = {
  irrigation: "sprinkler-variant",

  automation: "robot-industrial",

  airports: "airplane",

  "banking & financial": "bank",

  commercial: "office-building",

  "company documents": "file-document-outline",

  "elevated corridors": "bridge",

  facilities: "domain",

  factories: "factory",

  highways: "highway",

  "hydro power projects": "hydro-power",

  "industrial plans": "factory",

  institutional: "domain",

  "intake & treatment": "water-pump",

  "metro rails": "subway-variant",

  "multi level car parks": "car-multiple",

  "ohd sub station": "transmission-tower",

  "open cast & underground": "pickaxe",

  "pipeline distribution": "pipe",

  "power plants": "lightning-bolt",

  "railway stations": "train-car",

  "railways (including tunnels)": "train",

  residential: "home-city-outline",

  "storage & distribution": "warehouse",

  "transit terminals": "bus-marker",

  "transmission & distribution": "transmission-tower-export",

  tunnels: "tunnel-outline",
};

function getServiceIcon(service: Service) {
  const name = service.serviceName

    .trim()

    .toLowerCase()

    .replace(/\s+/g, " ");

  return (
    serviceNameIcons[name] ??
    serviceIcons[service.serviceIcon] ??
    "shape-outline"
  );
}

const SERVICE_CATEGORY_COLORS = {
  water: "#3B82C4",

  transportation: "#E58A3A",

  power: "#C9A23A",

  buildings: "#8064B8",

  industrial: "#C95B5B",

  corporate: "#3A9B68",

  automation: "#159A98",
} as const;

function getServiceCategory(serviceId: string) {
  const id = serviceId.toLowerCase();

  if (
    [
      "irrigation",

      "intake-treatment",

      "pipeline",

      "storage-distribution",
    ].includes(id)
  ) {
    return "water";
  }

  if (
    [
      "airports",

      "elevated",

      "highways",

      "metro",

      "car-parks",

      "railway-stations",

      "railways",

      "transit-terminals",

      "tunnels",
    ].includes(id)
  ) {
    return "transportation";
  }

  if (
    ["hydro-power", "ohd-substation", "power-plants", "transmission"].includes(
      id,
    )
  ) {
    return "power";
  }

  if (
    ["commercial", "facilities", "institutional", "residential"].includes(id)
  ) {
    return "buildings";
  }

  if (["factories", "industrial", "mining"].includes(id)) {
    return "industrial";
  }

  if (["banking-financial", "company-documents"].includes(id)) {
    return "corporate";
  }

  if (id === "automation") {
    return "automation";
  }

  return "buildings";
}

function serviceAccent(
  serviceId: string,

  folderAppearance?: FolderAppearanceSettings,
) {
  if (folderAppearance?.mode === "monochrome") {
    return folderAppearance.color;
  }

  const category = getServiceCategory(serviceId);

  return SERVICE_CATEGORY_COLORS[category];
}

function serviceCategoryLabel(serviceId: string) {
  const category = getServiceCategory(serviceId);

  const labels: Record<typeof category, string> = {
    water: "Water Infrastructure",

    transportation: "Transportation & Mobility",

    power: "Power & Energy",

    buildings: "Buildings & Urban Development",

    industrial: "Industrial & Mining",

    corporate: "Corporate & Business",

    automation: "Technology & Automation",
  };

  return labels[category];
}

const SERVICE_CATEGORY_ORDER = [
  "water",

  "automation",

  "power",

  "transportation",

  "buildings",

  "corporate",

  "industrial",
] as const;

function sortServicesByCategory(services: Service[]) {
  return [...services].sort((a, b) => {
    const categoryA = getServiceCategory(a.serviceId);

    const categoryB = getServiceCategory(b.serviceId);

    return (
      SERVICE_CATEGORY_ORDER.indexOf(categoryA) -
      SERVICE_CATEGORY_ORDER.indexOf(categoryB)
    );
  });
}

function chunkServices<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }

  return pages;
}

export function HomeScreen() {
  const navigation =
    useNavigation<BottomTabNavigationProp<HomeTabParamList, "Dashboard">>();

  const insets = useSafeAreaInsets();

  const layout = useResponsiveLayout();

  const { colorScheme, theme } = useAppTheme();

  const { colors } = theme;

  const vm = useHomeViewModel();

  const { user } = useAuthSession();

  const canApproveRequests =
    user?.role === "manager" ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  const [pendingAccessRequestCount, setPendingAccessRequestCount] =
  useState(0);
  
  const loadPendingAccessRequestCount = useCallback(async () => {
  if (!canApproveRequests) {
    setPendingAccessRequestCount(0);
    return;
  }

  try {
    const response = await apiRequest<
  ApiEnvelope<unknown[]> | unknown[]
>('/download-requests?pending=true', {
      method: 'GET',
      authenticated: true,
    });

    const requests = unwrapApiData(response) as unknown[];

    setPendingAccessRequestCount(requests.length);
  } catch {
    setPendingAccessRequestCount(0);
  }
}, [canApproveRequests]);

  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [folderAppearance, setFolderAppearance] =
    useState<FolderAppearanceSettings>(DEFAULT_FOLDER_APPEARANCE);

  const [isFolderAppearanceModalVisible, setFolderAppearanceModalVisible] =
    useState(false);

  useFocusEffect(
  useCallback(() => {
    void getFolderAppearance().then(setFolderAppearance);
    void loadPendingAccessRequestCount();
  }, [loadPendingAccessRequestCount]),
);

  const [recentlyOpened, setRecentlyOpened] = useState<RecentlyOpenedItem[]>(
    [],
  );

  const [starredItems, setStarredItems] = useState<StarredItem[]>([]);

  const [servicePageIndex, setServicePageIndex] = useState(0);

  const [servicesView, setServicesView] = useState<"folders" | "list">(
    "folders",
  );

  const searchInputRef = useRef<TextInput>(null);

  const searchWidth = useSharedValue(42);

  const displayName = user?.name || "User";

  const firstName = displayName.trim().split(/\s+/)[0] || "User";

  const sortedServices = sortServicesByCategory(vm.filteredServices);

  const expandedSearchWidth = Math.max(
    150,

    Math.min(
      layout.width - layout.horizontalPadding * 2 - 200,

      layout.isCompact ? 236 : 340,
    ),
  );

  const animatedSearchStyle = useAnimatedStyle(() => ({
    width: searchWidth.value,
  }));

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setServicePageIndex(0);
  }, [vm.searchQuery]);

  const loadRecentlyOpened = useCallback(async () => {
  if (!user?.id) {
    setRecentlyOpened([]);
    return;
  }

  setRecentlyOpened(await getRecentlyOpened(user.id));
}, [user?.id]);

  const loadStarredItems = useCallback(async () => {
    if (!user?.id) {
      setStarredItems([]);
      return;
    }

    setStarredItems(await getStarredItems(user.id));
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      void loadRecentlyOpened();
      void loadStarredItems();
    }, [loadRecentlyOpened, loadStarredItems]),
  );

  const loadUnreadNotificationCount = useCallback(async () => {
    if (!user?.id) {
      setUnreadNotificationCount(0);

      return;
    }

    try {
      const count = await getUnreadNotificationCount(
        user.id,

        user.role,
      );

      setUnreadNotificationCount(count);
    } catch {
      setUnreadNotificationCount(0);
    }
  }, [user?.id, user?.role]);

  useFocusEffect(
    useCallback(() => {
      void loadUnreadNotificationCount();
    }, [loadUnreadNotificationCount]),
  );

  function openSearch() {
    setIsSearchOpen(true);

    searchWidth.value = withTiming(
      expandedSearchWidth,

      {
        duration: 240,

        easing: Easing.out(Easing.cubic),
      },
    );
  }

  function closeSearch() {
    Keyboard.dismiss();

    vm.clearSearch();

    searchWidth.value = withTiming(
      42,

      {
        duration: 220,

        easing: Easing.inOut(Easing.cubic),
      },
    );

    setTimeout(
      () => setIsSearchOpen(false),

      220,
    );
  }

  function toggleServicesView() {
    setServicesView((currentView) =>
      currentView === "folders" ? "list" : "folders",
    );

    setServicePageIndex(0);
  }

  function openNotifications() {
    navigation

      .getParent<NativeStackNavigationProp<RootStackParamList>>()

      ?.navigate("Notifications");
  }

  function openRecentlyOpened(item: RecentlyOpenedItem) {
    navigation.navigate("Files", {
      serviceId: item.serviceId,

      serviceName: item.serviceName,

      projectId: item.projectId,

      folderId: item.folderId,

      folderName: item.folderName,

      permission: item.permission,

      ...(item.type === "file" ? { openFileId: item.id } : {}),
    });
  }

  async function removeRecentlyOpened() {
  if (!user?.id) {
    return;
  }

  await clearRecentlyOpened(user.id);

  setRecentlyOpened([]);
}

  return (
    <View
      style={[
        styles.screen,

        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.contentInner,

          {
            maxWidth: layout.maxContentWidth,
          },
        ]}
      >
        <ScrollView
  contentContainerStyle={[
    styles.servicesContent,
    {
      paddingHorizontal: layout.horizontalPadding,
      paddingTop: insets.top + 8,
    },
  ]}
  keyboardDismissMode="on-drag"
  keyboardShouldPersistTaps="handled"
  refreshControl={
    <RefreshControl
      colors={[colors.primary]}
      onRefresh={vm.refreshServices}
      progressBackgroundColor={colors.surface}
      refreshing={vm.isRefreshing}
      tintColor={colors.primary}
    />
  }
  showsVerticalScrollIndicator={false}
>
          {/* Header */}

          <View style={styles.header}>
            <View style={styles.brand}>
              <Image
                accessibilityLabel="V Drive"
                contentFit="contain"
                source={
                  colorScheme === "dark"
                    ? require("../../../../assets/onedrive-vensar-dark.png")
                    : require("../../../../assets/v-drive-header.png")
                }
                style={styles.brandLogo}
              />
            </View>

            {/* Notification Button */}

            <Pressable
              accessibilityLabel={
                unreadNotificationCount > 0
                  ? `Notifications, ${unreadNotificationCount} unread`
                  : "Notifications"
              }
              accessibilityRole="button"
              hitSlop={6}
              onPress={openNotifications}
              style={({ pressed }) => [
                styles.notificationButton,

                {
                  backgroundColor: pressed
                    ? colors.surfaceMuted
                    : colors.surface,

                  borderColor: pressed ? colors.primary : colors.border,

                  boxShadow:
                    colorScheme === "dark"
                      ? "0 4px 12px rgba(0, 0, 0, 0.20)"
                      : "0 4px 12px rgba(27, 48, 78, 0.08)",

                  transform: [
                    {
                      scale: pressed ? 0.94 : 1,
                    },
                  ],
                },
              ]}
            >
              <Icon color={colors.primary} size={21} source="bell-outline" />

              {unreadNotificationCount > 0 && (
                <View
                  style={[
                    styles.notificationBadge,

                    {
                      backgroundColor: colors.danger,

                      borderColor: colors.surface,
                    },
                  ]}
                >
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Hero */}

          <View style={styles.hero}>
            <Text
              selectable
              style={[
                styles.heroTitle,

                {
                  color: colors.text,
                },
              ]}
            >
              Welcome Back, {firstName}
            </Text>

            <Text
              selectable
              style={[
                styles.heroCopy,

                {
                  color: colors.textMuted,
                },
              ]}
            >
              Find your service area and access its project files.
            </Text>
          </View>

          <StarredServicesSection
            items={starredItems}
            userId={user?.id ?? ''}
            services={sortedServices}
            servicesView={servicesView}
            folderAppearance={folderAppearance}
            onPress={(service) =>
              navigation.navigate("Files", {
                serviceId: service.serviceId,

                serviceName: service.serviceName,
              })
            }
            onStarredChange={() => {
              void loadStarredItems();
            }}
          />
          
          {/* Services Header */}

          <View style={styles.sectionHeader}>
            <Text
              selectable
              style={[
                styles.sectionTitle,

                {
                  color: colors.text,
                },
              ]}
            >
              Services
            </Text>

            <View style={styles.toolbarActions}>
              <Animated.View
                style={[
                  styles.search,

                  animatedSearchStyle,

                  {
                    backgroundColor: colors.surface,

                    borderColor: isSearchOpen ? colors.primary : colors.border,

                    boxShadow:
                      colorScheme === "dark"
                        ? "0 5px 14px rgba(0, 0, 0, 0.25)"
                        : "0 5px 14px rgba(27, 48, 78, 0.10)",
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
                      style={[
                        styles.searchInput,

                        {
                          color: colors.text,
                        },
                      ]}
                      value={vm.searchQuery}
                    />

                    <Pressable
                      accessibilityLabel="Close search"
                      hitSlop={8}
                      onPress={closeSearch}
                    >
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

              <Pressable
                accessibilityLabel={
                  servicesView === "folders"
                    ? "Switch to list view"
                    : "Switch to folder view"
                }
                accessibilityRole="switch"
                hitSlop={6}
                onPress={toggleServicesView}
                style={({ pressed }) => [
                  styles.viewToggle,

                  {
                    backgroundColor: colors.surface,

                    borderColor: colors.border,

                    boxShadow:
                      colorScheme === "dark"
                        ? "0 5px 14px rgba(0, 0, 0, 0.25)"
                        : "0 5px 14px rgba(27, 48, 78, 0.10)",

                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.viewToggleOption,

                    servicesView === "folders" && {
                      backgroundColor: `${colors.primary}14`,

                      borderColor: `${colors.primary}28`,

                      borderWidth: 1,

                      boxShadow:
                        colorScheme === "dark"
                          ? "0 2px 6px rgba(0, 0, 0, 0.18)"
                          : "0 2px 6px rgba(27, 48, 78, 0.08)",
                    },
                  ]}
                >
                  <Icon
                    color={
                      servicesView === "folders"
                        ? colors.primary
                        : colors.textMuted
                    }
                    size={18}
                    source="folder-outline"
                  />
                </View>

                <View
                  style={[
                    styles.viewToggleOption,

                    servicesView === "list" && {
                      backgroundColor: `${colors.primary}14`,

                      borderColor: `${colors.primary}28`,

                      borderWidth: 1,

                      boxShadow:
                        colorScheme === "dark"
                          ? "0 2px 6px rgba(0, 0, 0, 0.18)"
                          : "0 2px 6px rgba(27, 48, 78, 0.08)",
                    },
                  ]}
                >
                  <Icon
                    color={
                      servicesView === "list"
                        ? colors.primary
                        : colors.textMuted
                    }
                    size={18}
                    source="format-list-bulleted"
                  />
                </View>
              </Pressable>
            </View>
          </View>

          {vm.isLoading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator color={colors.primary} size="small" />

              <Text
                selectable
                style={[
                  styles.stateMessage,

                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                Loading services…
              </Text>
            </View>
          ) : vm.error ? (
            <View
              style={[
                styles.errorState,

                {
                  backgroundColor: `${colors.danger}0D`,

                  borderColor: `${colors.danger}30`,
                },
              ]}
            >
              <View
                style={[
                  styles.stateIcon,

                  {
                    backgroundColor: `${colors.danger}14`,
                  },
                ]}
              >
                <Icon
                  color={colors.danger}
                  size={25}
                  source="cloud-alert-outline"
                />
              </View>

              <Text
                selectable
                style={[
                  styles.stateTitle,

                  {
                    color: colors.text,
                  },
                ]}
              >
                Couldn’t load services
              </Text>

              <Text
                selectable
                style={[
                  styles.stateMessage,

                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                {vm.error}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={vm.loadServices}
                style={({ pressed }) => [
                  styles.retryButton,

                  {
                    backgroundColor: pressed
                      ? colors.primaryPressed
                      : colors.primary,
                  },
                ]}
              >
                <Icon color={colors.onPrimary} size={18} source="refresh" />

                <Text
                  style={[
                    styles.retryLabel,

                    {
                      color: colors.onPrimary,
                    },
                  ]}
                >
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : vm.filteredServices.length === 0 ? (
            <View style={styles.stateContainer}>
              <View
                style={[
                  styles.stateIcon,

                  {
                    backgroundColor: colors.surfaceMuted,
                  },
                ]}
              >
                <Icon
                  color={colors.textMuted}
                  size={25}
                  source="magnify-close"
                />
              </View>

              <Text
                selectable
                style={[
                  styles.stateTitle,

                  {
                    color: colors.text,
                  },
                ]}
              >
                No matching services
              </Text>

              <Text
                selectable
                style={[
                  styles.stateMessage,

                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                Try a different service name or keyword.
              </Text>
            </View>
          ) : (
            <Animated.View
              entering={FadeIn.duration(180)}
              style={
                servicesView === "folders"
                  ? styles.servicesCarousel
                  : styles.servicesList
              }
            >
              {servicesView === "folders" ? (
                <>
                  <ScrollView
                    horizontal
                    nestedScrollEnabled
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => {
                      const pageWidth =
                        layout.width - layout.horizontalPadding * 2;

                      if (pageWidth <= 0) return;

                      setServicePageIndex(
                        Math.round(
                          event.nativeEvent.contentOffset.x / pageWidth,
                        ),
                      );
                    }}
                    style={styles.carouselScroll}
                    contentContainerStyle={styles.carouselContent}
                  >
                    {chunkServices(sortedServices, 9).map((page, pageIndex) => (
                      <View
                        key={`service-page-${pageIndex}`}
                        style={[
                          styles.servicePage,

                          {
                            width: layout.width - layout.horizontalPadding * 2,
                          },
                        ]}
                      >
                        {page.map((service) => {
                          const openService = () =>
                            navigation.navigate("Files", {
                              serviceId: service.serviceId,

                              serviceName: service.serviceName,
                            });

                          return (
                            <ServiceCard
                              accent={serviceAccent(
                                service.serviceId,
                                folderAppearance,
                              )}
                              key={service.id}
                              onPress={openService}
                              service={service}
                              userId={user?.id ?? ''}
                              starred={starredItems.some(
                                (item) =>
                                  item.type === "service" &&
                                  item.id === `service:${service.id}`,
                              )}
                              onStarredChange={() => {
                                void loadStarredItems();
                              }}
                            />
                          );
                        })}
                      </View>
                    ))}
                  </ScrollView>

                  {sortedServices.length > 3 ? (
                    <View style={styles.carouselDots}>
                      {chunkServices(sortedServices, 9).map((_, index) => (
                        <View
                          key={`service-dot-${index}`}
                          style={[
                            styles.carouselDot,

                            {
                              backgroundColor:
                                index === servicePageIndex
                                  ? colors.primary
                                  : `${colors.primary}35`,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  ) : null}
                </>
              ) : (
                <View style={styles.serviceList}>
                  {sortedServices.map((service) => {
                    const openService = () =>
                      navigation.navigate("Files", {
                        serviceId: service.serviceId,

                        serviceName: service.serviceName,
                      });

                    return (
                      <ServiceListItem
                        accent={serviceAccent(
                          service.serviceId,
                          folderAppearance,
                        )}
                        key={service.id}
                        onPress={openService}
                        service={service}
                        userId={user?.id ?? ''}
                        starred={starredItems.some(
                          (item) =>
                            item.type === "service" &&
                            item.id === `service:${service.id}`,
                        )}
                        onStarredChange={() => {
                          void loadStarredItems();
                        }}
                      />
                    );
                  })}
                </View>
              )}
            </Animated.View>
          )}

          

          <RecentlyOpenedSection
            items={recentlyOpened}
            onClear={removeRecentlyOpened}
            onPress={openRecentlyOpened}
          />
        </ScrollView>
      </View>
    </View>
  );
}

function StarredServicesSection({
  items,

  services,

  servicesView,

  folderAppearance,

  onPress,

  onStarredChange,
  userId,
}: {
  items: StarredItem[];

  services: Service[];

  servicesView: "folders" | "list";

  folderAppearance: FolderAppearanceSettings;

  onPress: (service: Service) => void;

  onStarredChange: () => void;
  userId: string;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const layout = useResponsiveLayout();
  const [starredServicePageIndex, setStarredServicePageIndex] = useState(0);

  const starredServices = services.filter((service) =>
    items.some(
      (item) => item.type === "service" && item.id === `service:${service.id}`,
    ),
  );

  const starredServicePages = chunkServices(starredServices, 3);

  useEffect(() => {
    setStarredServicePageIndex(0);
  }, [servicesView, starredServices.length]);

  if (!starredServices.length) {
    return null;
  }

  return (
    <View style={styles.recentSection}>
      <View style={styles.recentHeader}>
        <View style={styles.recentTitleCopy}>
          <Text selectable style={[styles.recentTitle, { color: colors.text }]}>
            Starred Services
          </Text>

          <Text
            selectable
            style={[styles.recentSubtitle, { color: colors.textMuted }]}
          >
            Your favorite services
          </Text>
        </View>
      </View>

      {servicesView === "list" ? (
        <View style={styles.serviceList}>
          {starredServices.map((service) => (
            <ServiceListItem
              accent={serviceAccent(service.serviceId, folderAppearance)}
              key={service.id}
              onPress={() => onPress(service)}
              service={service}
              userId={userId}
              
              starred
              onStarredChange={onStarredChange}
            />
          ))}
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            nestedScrollEnabled
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const pageWidth = layout.width - layout.horizontalPadding * 2;

              if (pageWidth <= 0) return;

              setStarredServicePageIndex(
                Math.round(event.nativeEvent.contentOffset.x / pageWidth),
              );
            }}
            style={styles.carouselScroll}
            contentContainerStyle={styles.carouselContent}
          >
            {starredServicePages.map((page, pageIndex) => (
              <View
                key={`starred-service-page-${pageIndex}`}
                style={[
                  styles.starredServicePage,
{
  width:
    layout.width -
    layout.horizontalPadding * 2,
  justifyContent:
    page.length === 3
      ? 'space-between'
      : 'flex-start',
  gap: page.length === 2 ? 16 : 0,
},
                ]}
              >
                {page.map((service) => (
                  <ServiceCard
                    accent={serviceAccent(service.serviceId, folderAppearance)}
                    key={service.id}
                    onPress={() => onPress(service)}
                    service={service}
                    userId={userId}
                    starred
                    onStarredChange={onStarredChange}
                  />
                ))}
              </View>
            ))}
          </ScrollView>

          {starredServicePages.length > 1 ? (
            <View style={styles.carouselDots}>
              {starredServicePages.map((_, index) => (
                <View
                  key={`starred-service-dot-${index}`}
                  style={[
                    styles.carouselDot,
                    {
                      backgroundColor:
                        index === starredServicePageIndex
                          ? colors.primary
                          : `${colors.primary}35`,
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

function RecentlyOpenedSection({
  items,

  onClear,

  onPress,
}: {
  items: RecentlyOpenedItem[];

  onClear: () => void | Promise<void>;

  onPress: (item: RecentlyOpenedItem) => void;
}) {
  const { colorScheme, theme } = useAppTheme();

  const { colors } = theme;

  if (!items.length) return null;

  return (
    <View style={styles.recentSection}>
      <View style={styles.recentHeader}>
        <View style={styles.recentTitleCopy}>
          <Text selectable style={[styles.recentTitle, { color: colors.text }]}>
            Recently Opened
          </Text>

          <Text
            selectable
            style={[styles.recentSubtitle, { color: colors.textMuted }]}
          >
            Pick up where you left off
          </Text>
        </View>

        <Pressable
          accessibilityLabel="Clear recently opened"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => void onClear()}
          style={({ pressed }) => [
            styles.clearRecentButton,

            {
              backgroundColor: pressed ? colors.surfaceMuted : "transparent",
            },
          ]}
        >
          <Text style={[styles.clearRecentLabel, { color: colors.primary }]}>
            Clear
          </Text>
        </Pressable>
      </View>

      <View style={styles.recentList}>
        {items.map((item) => {
          const visual = getRecentVisual(item);

          return (
            <Pressable
              accessibilityHint={
                item.type === "folder" ? "Opens this folder" : "Opens this file"
              }
              accessibilityLabel={`Open ${item.name}`}
              accessibilityRole="button"
              key={`${item.type}-${item.id}`}
              onPress={() => onPress(item)}
              style={({ pressed }) => [
                styles.recentCard,

                {
                  backgroundColor: pressed
                    ? colors.surfaceMuted
                    : colors.surface,

                  borderColor: pressed ? colors.primary : colors.border,

                  boxShadow:
                    colorScheme === "dark"
                      ? "0 5px 14px rgba(0, 0, 0, 0.20)"
                      : "0 5px 14px rgba(27, 48, 78, 0.065)",

                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}
            >
              <View
                style={[
                  styles.recentIcon,

                  { backgroundColor: `${visual.color}14` },
                ]}
              >
                <Icon color={visual.color} size={22} source={visual.icon} />
              </View>

              <View style={styles.recentCopy}>
                <Text
                  numberOfLines={1}
                  selectable
                  style={[styles.recentName, { color: colors.text }]}
                >
                  {item.name}
                </Text>

                <Text
                  selectable
                  style={[styles.recentMeta, { color: colors.textMuted }]}
                >
                  {item.projectId
                    ? `${item.serviceName ?? "Drive"}${item.projectName ? ` • ${item.projectName}` : ""} • ${
                        item.type === "folder" ? "Folder" : "File"
                      }`
                    : item.type === "folder"
                      ? "Folder"
                      : "File"}
                </Text>
              </View>

              <Icon color={colors.textMuted} size={18} source="chevron-right" />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getRecentVisual(item: RecentlyOpenedItem) {
  if (item.type === "folder") {
    return { color: "#F5B700", icon: "folder" };
  }

  const mime = item.mimeType?.toLocaleLowerCase() ?? "";

  const extension = item.name.split(".").at(-1)?.toLocaleLowerCase() ?? "";

  if (mime.includes("pdf") || extension === "pdf") {
    return { color: "#E5484D", icon: "file-pdf-box" };
  }

  if (mime.startsWith("image/")) {
    return { color: "#8E5CD9", icon: "file-image" };
  }

  if (mime.startsWith("video/")) {
    return { color: "#D6409F", icon: "file-video" };
  }

  if (mime.startsWith("audio/")) {
    return { color: "#7C66DC", icon: "file-music" };
  }

  if (
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    ["csv", "xls", "xlsx"].includes(extension)
  ) {
    return { color: "#2E8B57", icon: "file-excel" };
  }

  if (
    mime.includes("presentation") ||
    mime.includes("powerpoint") ||
    ["ppt", "pptx"].includes(extension)
  ) {
    return { color: "#D65A31", icon: "file-powerpoint" };
  }

  if (mime.includes("word") || ["doc", "docx"].includes(extension)) {
    return { color: "#2B6CB0", icon: "file-word-box" };
  }

  return {
    color: "#4C7BD9",

    icon: "file-document-outline",
  };
}

function ServiceListItem({
  accent,

  onPress,

  service,

  starred,

  onStarredChange,
   userId,
}: {
  accent: string;

  onPress: () => void;

  service: Service;

  starred: boolean;

  onStarredChange?: () => void;
  userId: string;
}) {
  const { colorScheme, theme } = useAppTheme();

  const icon = getServiceIcon(service);

  const [isStarred, setIsStarred] = useState(starred);

  useEffect(() => {
    setIsStarred(starred);
  }, [starred]);

  return (
    <Pressable
      accessibilityHint="Opens projects and files for this service"
      accessibilityLabel={service.serviceName}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.listCard,

        {
          backgroundColor: pressed
            ? theme.colors.surfaceMuted
            : theme.colors.surface,

          borderColor: pressed ? theme.colors.primary : theme.colors.border,

          boxShadow:
            colorScheme === "dark"
              ? "0 5px 16px rgba(0, 0, 0, 0.20)"
              : "0 5px 16px rgba(27, 48, 78, 0.06)",

          transform: [
            {
              scale: pressed ? 0.985 : 1,
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={[`${accent}00`, `${accent}18`, `${accent}38`]}
        end={{ x: 1, y: 0.5 }}
        pointerEvents="none"
        start={{ x: 0, y: 0.5 }}
        style={styles.listAccentFill}
      />

      <View
        style={[
          styles.listIcon,

          {
            backgroundColor: `${accent}12`,
          },
        ]}
      >
        <Icon color={accent} size={25} source={icon} />
      </View>

      <View style={styles.listCopy}>
        <Text
          numberOfLines={2}
          selectable
          style={[
            styles.listServiceName,

            {
              color: theme.colors.text,
            },
          ]}
        >
          {service.serviceName}
        </Text>

        <Text
          numberOfLines={1}
          style={[styles.listCategoryLabel, { color: accent }]}
        >
          {serviceCategoryLabel(service.serviceId)}
        </Text>
      </View>

      <Pressable
        accessibilityLabel={
          isStarred
            ? `Unstar ${service.serviceName}`
            : `Star ${service.serviceName}`
        }
        accessibilityRole="button"
        hitSlop={8}
        onPress={async () => {
          setIsStarred((current) => !current);

          await toggleStarred(userId, {
            id: `service:${service.id}`,

            type: "service",

            name: service.serviceName,

            serviceId: service.serviceId,

            serviceName: service.serviceName,
          });

          onStarredChange?.();
        }}
        style={styles.listStarButton}
      >
        <Icon
          color={isStarred ? "#F5B301" : `${accent}88`}
          size={19}
          source={isStarred ? "star" : "star-outline"}
        />
      </Pressable>

      <View
        style={[
          styles.listArrow,

          {
            backgroundColor: `${accent}26`,

            borderColor: `${accent}38`,
          },
        ]}
      >
        <Icon color={accent} size={18} source="chevron-right" />
      </View>
    </Pressable>
  );
}

function ServiceCard({
  accent,

  onPress,

  service,

  starred,

  onStarredChange,
  userId,
}: {
  accent: string;

  onPress: () => void;

  service: Service;

  starred: boolean;

  onStarredChange?: () => void;
  userId: string;
}) {
  const [isStarred, setIsStarred] = useState(starred);

  const { colorScheme, theme } = useAppTheme();

  const icon = getServiceIcon(service);

  useEffect(() => {
    setIsStarred(starred);
  }, [starred]);

  return (
    <Pressable
      accessibilityHint="Opens projects and files for this service"
      accessibilityLabel={service.serviceName}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,

        {
          backgroundColor: pressed
            ? theme.colors.surfaceMuted
            : theme.colors.surface,

          borderColor: pressed ? theme.colors.primary : theme.colors.border,

          boxShadow:
            colorScheme === "dark"
              ? "0 8px 20px rgba(0, 0, 0, 0.24)"
              : "0 8px 20px rgba(27, 48, 78, 0.075)",

          transform: [
            {
              scale: pressed ? 0.975 : 1,
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={[`${accent}00`, `${accent}10`, `${accent}28`]}
        end={{ x: 1, y: 0.5 }}
        pointerEvents="none"
        start={{ x: 0, y: 0.5 }}
        style={styles.cardAccentFill}
      />

      <Pressable
        accessibilityLabel={
          isStarred
            ? `Unstar ${service.serviceName}`
            : `Star ${service.serviceName}`
        }
        accessibilityRole="button"
        hitSlop={8}
        onPress={async () => {
          setIsStarred((current) => !current);

          await toggleStarred(userId, {
            id: `service:${service.id}`,

            type: "service",

            name: service.serviceName,

            serviceId: service.serviceId,

            serviceName: service.serviceName,
          });

          onStarredChange?.();
        }}
        style={styles.starButton}
      >
        <Icon
          color={isStarred ? "#F5B301" : `${accent}88`}
          size={17}
          source={isStarred ? "star" : "star-outline"}
        />
      </Pressable>

      <View style={styles.folderIcon}>
        <View
          style={[
            styles.folderTab,

            {
              backgroundColor: `${accent}CC`,
            },
          ]}
        />

        <View
          style={[
            styles.folderFace,

            {
              backgroundColor: `${accent}E6`,

              boxShadow:
                colorScheme === "dark"
                  ? "0 5px 10px rgba(0, 0, 0, 0.24)"
                  : "0 6px 12px rgba(27, 48, 78, 0.15)",
            },
          ]}
        >
          <View style={styles.folderHighlight} />
        </View>

        <View
          style={[
            styles.folderBadge,

            {
              borderColor: `${accent}40`,
            },
          ]}
        >
          <Icon color={accent} size={14} source={icon} />
        </View>
      </View>

      <Text
        numberOfLines={2}
        selectable
        style={[
          styles.serviceName,

          {
            color: theme.colors.text,
          },
        ]}
      >
        {service.serviceName}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  contentInner: {
    alignSelf: "center",

    flex: 1,

    width: "100%",
  },
  
  servicesContent: {
    paddingBottom: 24,
  },

  header: {
    alignItems: "center",

    flexDirection: "row",

    gap: 12,

    justifyContent: "space-between",
  },

  brand: {
    alignItems: "center",

    flexShrink: 0,

    height: 56,

    justifyContent: "center",

    width: 56,
  },

  brandLogo: {
    height: 48,

    width: 48,
  },

  notificationButton: {
    alignItems: "center",

    borderCurve: "continuous",

    borderRadius: 22,

    borderWidth: StyleSheet.hairlineWidth,

    height: 44,

    justifyContent: "center",

    width: 44,
  },

  notificationBadge: {
    alignItems: "center",

    borderRadius: 10,

    borderWidth: 2,

    height: 20,

    justifyContent: "center",

    minWidth: 20,

    paddingHorizontal: 4,

    position: "absolute",

    right: -4,

    top: -4,
  },

  notificationBadgeText: {
    color: "#FFFFFF",

    fontFamily: fontFamilies.bold,

    fontSize: 9,

    lineHeight: 11,
  },

  hero: {
    gap: 4,

    paddingTop: 18,
  },

  eyebrow: {
    fontFamily: fontFamilies.bold,

    fontSize: 14,

    letterSpacing: 1.3,

    lineHeight: 16,
  },

  heroTitle: {
    fontFamily: fontFamilies.bold,

    fontSize: 25,

    letterSpacing: -0.5,

    lineHeight: 32,
  },

  heroCopy: {
    fontFamily: fontFamilies.regular,

    fontSize: 14,

    lineHeight: 20,
  },

  toolbarActions: {
    alignItems: "center",

    flexDirection: "row",

    flexShrink: 1,

    gap: 8,

    minWidth: 0,
  },

  viewToggle: {
    alignItems: "center",

    borderCurve: "continuous",

    borderRadius: 21,

    borderWidth: 1,

    flexDirection: "row",

    height: 42,

    justifyContent: "space-between",

    overflow: "hidden",

    padding: 4,

    width: 84,
  },

  viewToggleOption: {
    alignItems: "center",

    borderCurve: "continuous",

    borderRadius: 17,

    borderColor: "transparent",

    borderWidth: 1,

    height: 34,

    justifyContent: "center",

    width: 37,
  },

  search: {
    alignItems: "center",

    flexShrink: 1,

    borderRadius: 21,

    borderWidth: 1,

    flexDirection: "row",

    gap: 9,

    height: 42,

    overflow: "hidden",

    paddingHorizontal: 10,
  },

  searchButton: {
    alignItems: "center",

    height: 40,

    justifyContent: "center",

    marginHorizontal: -10,

    width: 40,
  },

  searchInput: {
    flex: 1,

    fontFamily: fontFamilies.regular,

    fontSize: 15,

    height: 40,

    minWidth: 0,

    paddingVertical: 0,
  },

  sectionHeader: {
    alignItems: "center",

    flexDirection: "row",

    gap: 14,

    justifyContent: "space-between",

    paddingBottom: 10,

    paddingTop: 18,
  },

  sectionTitle: {
    fontFamily: fontFamilies.bold,

    fontSize: 21,

    lineHeight: 27,
  },

  servicesCarousel: {
    gap: 4,
  },

  servicesList: {
    paddingTop: 2,
  },

  serviceList: {
    gap: 9,
  },

  carouselScroll: {
    width: "100%",
  },

  carouselContent: {
    alignItems: "stretch",
  },

  servicePage: {
    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",

    rowGap: 12,

    paddingTop: 2,

    paddingBottom: 0,
  },

  starredServicePage: {
    alignItems: "stretch",
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingBottom: 0,
    paddingTop: 2,
  },

  carouselDots: {
    alignItems: "center",

    flexDirection: "row",

    gap: 6,

    justifyContent: "center",

    paddingTop: 5,

    paddingBottom: 2,
  },

  carouselDot: {
    borderRadius: 4,

    height: 6,

    width: 6,
  },

  listCard: {
    alignItems: "center",

    borderCurve: "continuous",

    borderRadius: 16,

    borderWidth: StyleSheet.hairlineWidth,

    flexDirection: "row",

    gap: 10,

    minHeight: 68,

    paddingHorizontal: 10,

    paddingVertical: 6,
  },

  listAccentFill: {
    borderBottomRightRadius: 16,

    borderTopRightRadius: 16,

    bottom: 0,

    position: "absolute",

    right: 0,

    top: 0,

    width: "52%",
  },

  listIcon: {
    alignItems: "center",

    borderCurve: "continuous",

    borderRadius: 12,

    borderWidth: StyleSheet.hairlineWidth,

    height: 40,

    justifyContent: "center",

    width: 40,
  },

  listCopy: {
    flex: 1,

    gap: 1,

    justifyContent: "center",

    minWidth: 0,
  },

  listServiceName: {
    fontFamily: fontFamilies.semibold,

    fontSize: 14.5,

    lineHeight: 18,
  },

  listCategoryLabel: {
    fontFamily: fontFamilies.regular,

    fontSize: 10.5,

    letterSpacing: 0.15,

    lineHeight: 14,
  },

  listArrow: {
    alignItems: "center",

    borderCurve: "continuous",

    borderRadius: 13,

    borderWidth: StyleSheet.hairlineWidth,

    height: 28,

    justifyContent: "center",

    width: 28,
  },

  card: {
    alignItems: "center",

    aspectRatio: 0.94,

    width: "32%",

    borderCurve: "continuous",

    borderRadius: 18,

    borderWidth: StyleSheet.hairlineWidth,

    justifyContent: "flex-end",

    paddingBottom: 10,

    paddingHorizontal: 6,

    paddingTop: 17,

    position: "relative",
  },

  cardAccentFill: {
    borderBottomLeftRadius: 18,

    borderBottomRightRadius: 18,

    borderTopLeftRadius: 18,

    borderTopRightRadius: 18,

    bottom: 0,

    left: 0,

    position: "absolute",

    right: 0,

    top: 0,
  },

  cornerIcon: {
    position: "absolute",

    right: 8,

    top: 8,
  },

  starButton: {
    alignItems: "center",

    justifyContent: "center",

    padding: 6,

    position: "relative",

    right: 38,

    top: 20,

    zIndex: 10,

    elevation: 10,
  },

  listStarButton: {
    alignItems: "center",

    justifyContent: "center",

    marginRight: 12,

    padding: 4,
  },

  folderIcon: {
    height: 50,

    marginBottom: 7,

    position: "relative",

    transform: [{ translateY: 6 }],

    width: 60,
  },

  folderTab: {
    borderCurve: "continuous",

    borderRadius: 6,

    height: 16,

    left: 2,

    position: "absolute",

    top: 1,

    width: 30,
  },

  folderFace: {
    borderCurve: "continuous",

    borderRadius: 8,

    bottom: 0,

    height: 41,

    left: 0,

    overflow: "hidden",

    position: "absolute",

    width: 60,
  },

  folderHighlight: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",

    borderRadius: 4,

    height: 6,

    left: 7,

    position: "absolute",

    right: 13,

    top: 5,
  },

  folderBadge: {
    alignItems: "center",

    backgroundColor: "rgba(255, 255, 255, 0.94)",

    borderCurve: "continuous",

    borderRadius: 12,

    borderWidth: 1,

    bottom: -2,

    height: 26,

    justifyContent: "center",

    position: "absolute",

    right: -4,

    width: 26,

    boxShadow: "0 3px 8px rgba(27, 48, 78, 0.12)",
  },

  serviceName: {
    fontFamily: fontFamilies.semibold,

    fontSize: 12.5,

    lineHeight: 16,

    minHeight: 32,

    textAlign: "center",

    transform: [{ translateY: 5 }],

    width: "100%",
  },

  recentSection: {
    gap: 12,

    paddingBottom: 4,

    paddingTop: 26,
  },

  recentHeader: {
    alignItems: "center",

    flexDirection: "row",

    gap: 12,

    justifyContent: "space-between",
  },

  recentTitleCopy: {
    flex: 1,

    gap: 2,
  },

  recentTitle: {
    fontFamily: fontFamilies.bold,

    fontSize: 19,

    lineHeight: 25,
  },

  recentSubtitle: {
    fontFamily: fontFamilies.regular,

    fontSize: 12,

    lineHeight: 17,
  },

  clearRecentButton: {
    alignItems: "center",

    borderRadius: 14,

    minHeight: 34,

    justifyContent: "center",

    paddingHorizontal: 8,
  },

  clearRecentLabel: {
    fontFamily: fontFamilies.semibold,

    fontSize: 12,
  },

  recentList: {
    gap: 9,
  },

  recentCard: {
    alignItems: "center",

    borderCurve: "continuous",

    borderRadius: 17,

    borderWidth: StyleSheet.hairlineWidth,

    flexDirection: "row",

    gap: 11,

    minHeight: 64,

    paddingHorizontal: 10,

    paddingVertical: 8,
  },

  recentIcon: {
    alignItems: "center",

    borderCurve: "continuous",

    borderRadius: 13,

    height: 46,

    justifyContent: "center",

    width: 46,
  },

  recentCopy: {
    flex: 1,

    gap: 2,

    minWidth: 0,
  },

  recentName: {
    fontFamily: fontFamilies.semibold,

    fontSize: 13.5,

    lineHeight: 18,
  },

  recentMeta: {
    fontFamily: fontFamilies.regular,

    fontSize: 11,

    lineHeight: 15,
  },

  stateContainer: {
    alignItems: "center",

    gap: 9,

    justifyContent: "center",

    minHeight: 220,

    paddingHorizontal: 24,
  },

  accessRequestsCard: {
  alignItems: 'center',
  borderRadius: 16,
  borderWidth: 1,
  flexDirection: 'row',
  marginTop: 18,
  padding: 16,
},

accessRequestsIcon: {
  alignItems: 'center',
  backgroundColor: '#EAF2FF',
  borderRadius: 12,
  height: 48,
  justifyContent: 'center',
  marginRight: 14,
  position: 'relative',
  width: 48,
},

accessRequestsContent: {
  flex: 1,
  flexDirection: 'column',
  alignItems: 'flex-start',
},
accessRequestsTitle: {
  fontSize: 16,
  fontWeight: '700',
},

accessRequestsTitleRow: {
  flex: 1,
  justifyContent: 'center',
},

accessRequestsBadge: {
  alignItems: 'center',
  backgroundColor: '#C7354A',
  borderRadius: 10,
  height: 22,
  justifyContent: 'center',
  minWidth: 22,
  paddingHorizontal: 6,
  position: 'absolute',
  right: -7,
  top: -7,
},

accessRequestsBadgeText: {
  color: '#FFFFFF',
  fontSize: 12,
  fontWeight: '700',
},

accessRequestsSubtitle: {
  fontSize: 13,
  marginTop: 4,
},

  errorState: {
    alignItems: "center",

    borderCurve: "continuous",

    borderRadius: 20,

    borderWidth: 1,

    gap: 9,

    minHeight: 250,

    padding: 24,
  },

  stateIcon: {
    alignItems: "center",

    borderCurve: "continuous",

    borderRadius: 14,

    height: 48,

    justifyContent: "center",

    width: 48,
  },

  stateTitle: {
    fontFamily: fontFamilies.semibold,

    fontSize: 16,

    lineHeight: 22,

    textAlign: "center",
  },

  stateMessage: {
    fontFamily: fontFamilies.regular,

    fontSize: 13,

    lineHeight: 19,

    textAlign: "center",
  },

  retryButton: {
    alignItems: "center",

    borderRadius: 20,

    flexDirection: "row",

    gap: 7,

    marginTop: 5,

    minHeight: 40,

    paddingHorizontal: 17,
  },

  retryLabel: {
    fontFamily: fontFamilies.semibold,

    fontSize: 13,
  },
});
