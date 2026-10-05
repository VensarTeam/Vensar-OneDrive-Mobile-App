import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from 'react-native-paper';

import { apiRequest } from '../../../core/api/apiClient';
import type { ApiEnvelope } from '../../../core/api/api-response';
import { unwrapApiData } from '../../../core/api/api-response';
import { useAppTheme } from '../../../core/theme';
import { useAuthSession } from '../../auth/services/auth-session-provider';
import { RootStackParamList } from '../../../navigation/routes';

type RequestAction = 'download' | 'share' | 'delete';
type RequestStatus = 'pending' | 'approved' | 'rejected';

type DownloadRequest = {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail?: string | null;
  approverId: string;
  action: RequestAction;
  resourceType?: string | null;
  resourceId?: string | null;
  resourceName?: string | null;
  status: RequestStatus;
  resolvedAt?: string | null;
  resolvedById?: string | null;
  resolvedByName?: string | null;
  createdAt: string;
  updatedAt: string;
};

type AdminAlert = {
  id: string;
  type: string;
  actorUserId: string;
  actorUserName: string;
  actorUserEmail?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  resourceName?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  type: 'access' | 'approved' | 'rejected' | 'system';
  unread: boolean;
  source: 'request' | 'admin-alert';
};

const LAST_READ_KEY = '@vdrive/notifications-last-read-at';
const LAST_CLEARED_KEY = '@vdrive/notifications-last-cleared-at';

function requestActionLabel(action: RequestAction) {
  switch (action) {
    case 'share':
      return 'share';
    case 'delete':
      return 'delete';
    default:
      return 'download';
  }
}

function requestResourceLabel(request: DownloadRequest) {
  return request.resourceName?.trim() || request.resourceType || 'this resource';
}

function formatRelativeTime(timestamp: number) {
  const diff = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year:
      new Date(timestamp).getFullYear() === new Date().getFullYear()
        ? undefined
        : 'numeric',
  });
}

function requestToNotification(
  request: DownloadRequest,
  currentUserId: string,
  lastReadAt: number,
): NotificationItem {
  const timestamp = new Date(
    request.status === 'pending'
      ? request.createdAt
      : request.updatedAt || request.createdAt,
  ).getTime();

  const resource = requestResourceLabel(request);
  const action = requestActionLabel(request.action);
  const isRequester = request.requesterId === currentUserId;

  if (isRequester) {
    if (request.status === 'approved') {
      return {
        id: `request-approved-${request.id}`,
        title: 'Access request approved',
        message: `Your ${action} access request for ${resource} was approved${
          request.resolvedByName ? ` by ${request.resolvedByName}` : ''
        }.`,
        time: formatRelativeTime(timestamp),
        timestamp,
        type: 'approved',
        unread: timestamp > lastReadAt,
        source: 'request',
      };
    }

    if (request.status === 'rejected') {
      return {
        id: `request-rejected-${request.id}`,
        title: 'Access request rejected',
        message: `Your ${action} access request for ${resource} was rejected${
          request.resolvedByName ? ` by ${request.resolvedByName}` : ''
        }.`,
        time: formatRelativeTime(timestamp),
        timestamp,
        type: 'rejected',
        unread: timestamp > lastReadAt,
        source: 'request',
      };
    }

    return {
      id: `request-pending-${request.id}`,
      title: 'Access request sent',
      message: `Your ${action} access request for ${resource} is waiting for approval.`,
      time: formatRelativeTime(timestamp),
      timestamp,
      type: 'access',
      unread: timestamp > lastReadAt,
      source: 'request',
    };
  }

  if (request.status === 'approved') {
    return {
      id: `request-manager-approved-${request.id}`,
      title: 'Request approved',
      message: `You approved ${request.requesterName}'s ${action} access request for ${resource}.`,
      time: formatRelativeTime(timestamp),
      timestamp,
      type: 'approved',
      unread: timestamp > lastReadAt,
      source: 'request',
    };
  }

  if (request.status === 'rejected') {
    return {
      id: `request-manager-rejected-${request.id}`,
      title: 'Request rejected',
      message: `You rejected ${request.requesterName}'s ${action} access request for ${resource}.`,
      time: formatRelativeTime(timestamp),
      timestamp,
      type: 'rejected',
      unread: timestamp > lastReadAt,
      source: 'request',
    };
  }

  return {
    id: `request-manager-pending-${request.id}`,
    title: 'New access request',
    message: `${request.requesterName} requested ${action} access for ${resource}.`,
    time: formatRelativeTime(timestamp),
    timestamp,
    type: 'access',
    unread: timestamp > lastReadAt,
    source: 'request',
  };
}

function adminAlertToNotification(
  alert: AdminAlert,
  lastReadAt: number,
): NotificationItem {
  const timestamp = new Date(alert.createdAt).getTime();

  return {
    id: `admin-alert-${alert.id}`,
    title: 'Access alert',
    message: alert.message,
    time: formatRelativeTime(timestamp),
    timestamp,
    type: 'system',
    unread: !alert.isRead && timestamp > lastReadAt,
    source: 'admin-alert',
  };
}

export function NotificationsScreen() {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const navigation =
  useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuthSession();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastReadAt, setLastReadAt] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canApproveRequests =
    user?.role === 'manager' ||
    user?.role === 'admin' ||
    user?.role === 'super_admin';

  const canReadAdminAlerts =
    user?.role === 'admin' || user?.role === 'super_admin';

  const loadNotifications = useCallback(
    async (refresh = false) => {
      if (!user?.id) return;

      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);

      setError(null);

      try {
        const storedLastReadAt =
  Number(await AsyncStorage.getItem(LAST_READ_KEY)) || 0;

const storedLastClearedAt =
  Number(await AsyncStorage.getItem(LAST_CLEARED_KEY)) || 0;

setLastReadAt(storedLastReadAt);
        const minePromise = apiRequest<
          ApiEnvelope<DownloadRequest[]> | DownloadRequest[]
        >('/download-requests/mine', {
          method: 'GET',
          authenticated: true,
        });

        const approverPromise = canApproveRequests
          ? apiRequest<ApiEnvelope<DownloadRequest[]> | DownloadRequest[]>(
              '/download-requests',
              {
                method: 'GET',
                authenticated: true,
              },
            )
          : Promise.resolve<DownloadRequest[]>([]);

        const adminPromise = canReadAdminAlerts
          ? apiRequest<ApiEnvelope<AdminAlert[]> | AdminAlert[]>(
              '/admin-alerts',
              {
                method: 'GET',
                authenticated: true,
              },
            ).catch(() => [] as AdminAlert[])
          : Promise.resolve<AdminAlert[]>([]);

        const [mineResponse, approverResponse, adminResponse] =
          await Promise.all([
            minePromise,
            approverPromise,
            adminPromise,
          ]);

        const mine = unwrapApiData(mineResponse) as DownloadRequest[];
        const approver = unwrapApiData(approverResponse) as DownloadRequest[];
        const adminAlerts = unwrapApiData(adminResponse) as AdminAlert[];

        const requestMap = new Map<string, DownloadRequest>();

        [...mine, ...approver].forEach(request =>
          requestMap.set(request.id, request),
        );

        const requestNotifications = [...requestMap.values()].map(request =>
          requestToNotification(request, user.id, storedLastReadAt),
        );

        const adminNotifications = adminAlerts.map(alert =>
          adminAlertToNotification(alert, storedLastReadAt),
        );

        const nextNotifications = [
  ...requestNotifications,
  ...adminNotifications,
]
  .filter(notification => notification.timestamp > storedLastClearedAt)
  .sort((a, b) => b.timestamp - a.timestamp);

        setNotifications(nextNotifications);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load notifications.',
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [canApproveRequests, canReadAdminAlerts, user?.id],
  );

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications]),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(current =>
        current.map(notification => ({
          ...notification,
          time: formatRelativeTime(notification.timestamp),
        })),
      );
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter(notification => notification.unread).length,
    [notifications],
  );

  const clearNotifications = useCallback(async () => {
    const now = Date.now();

    await AsyncStorage.setItem(LAST_CLEARED_KEY, String(now));
    setLastReadAt(now);

    if (canReadAdminAlerts) {
      try {
        await apiRequest('/admin-alerts/read-all', {
          method: 'PATCH',
          authenticated: true,
        });
      } catch {
        // Local clear state still hides notifications from this device.
      }
    }

    setNotifications([]);
  }, [canReadAdminAlerts]);

  const markAllRead = useCallback(async () => {
    const now = Date.now();

    await AsyncStorage.setItem(LAST_READ_KEY, String(now));
    setLastReadAt(now);

    if (canReadAdminAlerts) {
      try {
        await apiRequest('/admin-alerts/read-all', {
          method: 'PATCH',
          authenticated: true,
        });
      } catch {
        // Local read state still prevents the request cards from appearing unread.
      }
    }

    setNotifications(current =>
      current.map(notification => ({
        ...notification,
        unread: false,
      })),
    );
  }, [canReadAdminAlerts]);

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: pressed
                  ? colors.surfaceMuted
                  : colors.surface,
                borderColor: colors.border,
                transform: [{ scale: pressed ? 0.94 : 1 }],
              },
            ]}
          >
            <Icon color={colors.text} size={25} source="chevron-left" />
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit={false}
              style={[styles.title, { color: colors.text }]}
            >
              Notifications
            </Text>

            {unreadCount > 0 && (
              <View
                style={[
                  styles.unreadBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          {notifications.length > 0 ? (
            <Pressable
              accessibilityLabel="Clear notifications"
              accessibilityRole="button"
              onPress={() => {
                Alert.alert(
                  'Clear notifications',
                  'Are you sure you want to clear all notifications? Your access requests will not be deleted.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear',
                      style: 'destructive',
                      onPress: () => void clearNotifications(),
                    },
                  ],
                );
              }}
              style={({ pressed }) => [
                styles.clearButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Icon
                color={colors.danger}
                size={22}
                source="delete-outline"
              />
            </Pressable>
          ) : (
            <View style={styles.clearButtonSpacer} />
          )}
        </View>

        {notifications.length > 0 && (
          <Pressable
            accessibilityLabel="Mark all notifications as read"
            accessibilityRole="button"
            onPress={markAllRead}
            style={({ pressed }) => [
              styles.markReadButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Icon
              color={colors.primary}
              size={17}
              source="check-all"
            />
            <Text
              style={[
                styles.markReadText,
                { color: colors.primary },
              ]}
            >
              Mark all read
            </Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} />
          <Text
            style={[
              styles.stateText,
              { color: colors.textMuted },
            ]}
          >
            Loading notifications...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <View
            style={[
              styles.emptyIconContainer,
              { backgroundColor: colors.surfaceMuted },
            ]}
          >
            <Icon
              color={colors.primary}
              size={32}
              source="alert-circle-outline"
            />
          </View>

          <Text
            style={[
              styles.emptyTitle,
              { color: colors.text },
            ]}
          >
            Couldn't load notifications
          </Text>

          <Text
            style={[
              styles.emptyMessage,
              { color: colors.textMuted },
            ]}
          >
            {error}
          </Text>

          <Pressable
            onPress={() => void loadNotifications(true)}
            style={({ pressed }) => [
              styles.retryButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              colors={[colors.primary]}
              onRefresh={() => void loadNotifications(true)}
              refreshing={isRefreshing}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {notifications.length > 0 ? (
            <>
              {unreadCount > 0 && (
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: colors.textMuted },
                  ]}
                >
                  NEW
                </Text>
              )}

              {notifications.map(notification => (
                <Pressable
                  key={notification.id}
  onPress={() => {
    if (
      canApproveRequests &&
      notification.id.startsWith('request-manager-pending-')
    ) {
      navigation
  navigation.navigate('AccessRequests');
    }
  }}
                  style={({ pressed }) => [
                    styles.notificationCard,
                    {
                      backgroundColor: notification.unread
                        ? colors.surface
                        : colors.surfaceMuted,
                      borderColor: notification.unread
                        ? `${colors.primary}35`
                        : colors.border,
                      opacity: pressed ? 0.85 : 1,
                      transform: [
                        { scale: pressed ? 0.985 : 1 },
                      ],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: getIconBackground(
                          notification.type,
                          colors.primary,
                        ),
                      },
                    ]}
                  >
                    <Icon
                      color={
                        notification.type === 'rejected'
                          ? colors.danger
                          : colors.primary
                      }
                      size={23}
                      source={getNotificationIcon(notification.type)}
                    />
                  </View>

                  <View style={styles.notificationContent}>
                    <View style={styles.notificationTopRow}>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.notificationTitle,
                          { color: colors.text },
                        ]}
                      >
                        {notification.title}
                      </Text>

                      {notification.unread && (
                        <View
                          style={[
                            styles.unreadDot,
                            { backgroundColor: colors.primary },
                          ]}
                        />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.notificationMessage,
                        { color: colors.textMuted },
                      ]}
                    >
                      {notification.message}
                    </Text>

                    <Text
                      style={[
                        styles.notificationTime,
                        { color: colors.textMuted },
                      ]}
                    >
                      {notification.time}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconContainer,
                  { backgroundColor: colors.surfaceMuted },
                ]}
              >
                <Icon
                  color={colors.primary}
                  size={34}
                  source="bell-off-outline"
                />
              </View>

              <Text
                style={[
                  styles.emptyTitle,
                  { color: colors.text },
                ]}
              >
                No notifications
              </Text>

              <Text
                style={[
                  styles.emptyMessage,
                  { color: colors.textMuted },
                ]}
              >
                You're all caught up. New access requests and updates will
                appear here.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function getNotificationIcon(type: NotificationItem['type']) {
  switch (type) {
    case 'approved':
      return 'check-circle-outline';
    case 'rejected':
      return 'close-circle-outline';
    case 'access':
      return 'lock-open-outline';
    default:
      return 'alert-circle-outline';
  }
}

function getIconBackground(
  type: NotificationItem['type'],
  primaryColor: string,
) {
  switch (type) {
    case 'rejected':
      return '#EF444418';
    case 'approved':
    case 'access':
    case 'system':
    default:
      return `${primaryColor}18`;
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  /* ---------------- HEADER ---------------- */

  header: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 12,
  },

  headerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },

  backButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },

  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginLeft: 14,
    minWidth: 0,
  },

  title: {
    flexShrink: 1,
    fontSize: 27,
    fontWeight: '700',
  },

  unreadBadge: {
    alignItems: 'center',
    borderRadius: 10,
    height: 22,
    justifyContent: 'center',
    marginLeft: 9,
    minWidth: 22,
    paddingHorizontal: 6,
  },

  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    padding: 6,
  },

  clearButtonSpacer: {
    marginLeft: 10,
    padding: 6,
    width: 34,
  },

  markReadButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginTop: 7,
    paddingHorizontal: 2,
    paddingVertical: 5,
  },

  markReadText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },

  /* ---------------- CONTENT ---------------- */

  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 4,
  },

  notificationCard: {
    alignItems: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
  },

  iconContainer: {
    alignItems: 'center',
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },

  notificationContent: {
    flex: 1,
    marginLeft: 13,
    minWidth: 0,
  },

  notificationTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  notificationTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },

  unreadDot: {
    borderRadius: 5,
    height: 9,
    marginLeft: 8,
    width: 9,
  },

  notificationMessage: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  notificationTime: {
    fontSize: 11,
    marginTop: 8,
  },

  /* ---------------- STATES ---------------- */

  centerState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  stateText: {
    fontSize: 13,
    marginTop: 12,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500,
    paddingHorizontal: 35,
  },

  emptyIconContainer: {
    alignItems: 'center',
    borderRadius: 28,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 18,
  },

  emptyMessage: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    textAlign: 'center',
  },

  retryButton: {
    borderRadius: 12,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});