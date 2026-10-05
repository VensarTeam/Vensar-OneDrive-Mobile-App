import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';

import { apiRequest } from '../../../core/api/apiClient';
import type { ApiEnvelope } from '../../../core/api/api-response';
import { unwrapApiData } from '../../../core/api/api-response';
import { useAppTheme } from '../../../core/theme';
import { useAuthSession } from '../../auth/services/auth-session-provider';

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

function actionLabel(action: RequestAction) {
  switch (action) {
    case 'share':
      return 'Share access';
    case 'delete':
      return 'Delete access';
    default:
      return 'Download access';
  }
}

function actionIcon(action: RequestAction) {
  switch (action) {
    case 'share':
      return 'share-variant-outline';
    case 'delete':
      return 'delete-outline';
    default:
      return 'download-outline';
  }
}

function formatRelativeTime(timestamp: number) {
  const diff = Math.max(0, Date.now() - timestamp);

  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  return new Date(timestamp).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year:
      new Date(timestamp).getFullYear() === new Date().getFullYear()
        ? undefined
        : 'numeric',
  });
}

function getStatusColor(
  status: RequestStatus,
  colors: {
    success: string;
    danger: string;
    primary: string;
  },
) {
  switch (status) {
    case 'approved':
       return '#27AE60';
    case 'rejected':
      return colors.danger;
    default:
      return colors.primary;
  }
}

function getStatusIcon(status: RequestStatus) {
  switch (status) {
    case 'approved':
      return 'check-circle-outline';
    case 'rejected':
      return 'close-circle-outline';
    default:
      return 'clock-outline';
  }
}

function getStatusLabel(status: RequestStatus) {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Pending';
  }
}

export function AccessRequestsScreen() {
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { user } = useAuthSession();

  const canApproveRequests =
  user?.role === 'manager' ||
  user?.role === 'admin' ||
  user?.role === 'super_admin';

  const [requests, setRequests] = useState<DownloadRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response = await apiRequest<
  ApiEnvelope<DownloadRequest[]> | DownloadRequest[]
>(
  canApproveRequests
    ? '/download-requests'
    : '/download-requests/mine',
  {
    method: 'GET',
    authenticated: true,
  },
);

      const data = unwrapApiData(response) as DownloadRequest[];

      const sortedRequests = [...data].sort((a, b) => {
  if (a.status === 'pending' && b.status !== 'pending') {
    return -1;
  }

  if (a.status !== 'pending' && b.status === 'pending') {
    return 1;
  }

  return (
    new Date(b.createdAt).getTime() -
    new Date(a.createdAt).getTime()
  );
});

      setRequests(sortedRequests);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load access requests.',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const resolveRequest = useCallback(
  async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await apiRequest(
        `/download-requests/${requestId}/${action}`,
        {
          method: 'PATCH',
          authenticated: true,
        },
      );

      await loadRequests(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Unable to ${action} request.`,
      );
    }
  },
  [loadRequests],
);

  useFocusEffect(
    useCallback(() => {
      void loadRequests();
    }, [loadRequests]),
  );

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
          <Icon
            color={colors.text}
            size={25}
            source="chevron-left"
          />
        </Pressable>

        <Text
          numberOfLines={1}
          style={[
            styles.headerTitle,
            { color: colors.text },
          ]}
        >
          Access Requests
        </Text>

        <View style={styles.headerSpacer} />
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
            Loading access requests...
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
            Couldn't load requests
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
            onPress={() => void loadRequests(true)}
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
              onRefresh={() => void loadRequests(true)}
              refreshing={isRefreshing}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {requests.length === 0 ? (
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconContainer,
                  {
                    backgroundColor: colors.surfaceMuted,
                  },
                ]}
              >
                <Icon
                  color={colors.primary}
                  size={34}
                  source="file-lock-outline"
                />
              </View>

              <Text
                style={[
                  styles.emptyTitle,
                  { color: colors.text },
                ]}
              >
                No access requests
              </Text>

              <Text
                style={[
                  styles.emptyMessage,
                  { color: colors.textMuted },
                ]}
              >
                Access requests you send will appear here.
              </Text>
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.textMuted },
                ]}
              >
                {canApproveRequests
  ? 'REQUESTS TO REVIEW'
  : 'YOUR REQUESTS'}
              </Text>

              {requests.map(request => {
                const timestamp = new Date(
                  request.status === 'pending'
                    ? request.createdAt
                    : request.updatedAt || request.createdAt,
                ).getTime();

                const statusColor = getStatusColor(
                  request.status,
                  colors,
                );

                const resourceName =
                  request.resourceName?.trim() ||
                  request.resourceType ||
                  'Unknown resource';

                return (
                  <View
                    key={request.id}
                    style={[
                      styles.requestCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.actionIconContainer,
                        {
                          backgroundColor: `${colors.primary}12`,
                        },
                      ]}
                    >
                      <Icon
                        color={colors.primary}
                        size={23}
                        source={actionIcon(request.action)}
                      />
                    </View>

                    <View style={styles.requestContent}>
                      <Text
                        style={[
                          styles.actionTitle,
                          { color: colors.text },
                        ]}
                      >
                        {actionLabel(request.action)}
                      </Text>

                      <Text
                        numberOfLines={2}
                        style={[
                          styles.resourceName,
                          { color: colors.text },
                        ]}
                      >
                        {resourceName}
                      </Text>

                      {canApproveRequests && (
  <Text
    numberOfLines={1}
    style={[
      styles.requesterName,
      { color: colors.textMuted },
    ]}
  >
    Requested by {request.requesterName}
  </Text>
)}

{canApproveRequests && request.requesterEmail && (
  <Text
    numberOfLines={1}
    style={[
      styles.requesterEmail,
      { color: colors.textMuted },
    ]}
  >
    {request.requesterEmail}
  </Text>
)}

                      <View style={styles.statusRow}>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: `${statusColor}12`,
                              borderColor: `${statusColor}25`,
                            },
                          ]}
                        >
                          <Icon
                            color={statusColor}
                            size={14}
                            source={getStatusIcon(request.status)}
                          />

                          <Text
                            style={[
                              styles.statusText,
                              { color: statusColor },
                            ]}
                          >
                            {getStatusLabel(request.status)}
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.timeText,
                            { color: colors.textMuted },
                          ]}
                        >
                          {formatRelativeTime(timestamp)}
                        </Text>
                      </View>

                      {canApproveRequests && request.status === 'pending' && (
  <View style={styles.requestActions}>
    <Pressable
      onPress={() => void resolveRequest(request.id, 'reject')}
      style={[
        styles.requestActionButton,
        styles.rejectActionButton,
      ]}
    >
      <Icon
        color={colors.danger}
        size={18}
        source="close"
      />

      <Text
        style={[
          styles.requestActionText,
          { color: colors.danger },
        ]}
      >
        Reject
      </Text>
    </Pressable>

    <Pressable
      onPress={() => void resolveRequest(request.id, 'approve')}
      style={[
        styles.requestActionButton,
        styles.approveActionButton,
      ]}
    >
      <Icon
        color="#27AE60"
        size={18}
        source="check"
      />

      <Text
        style={[
          styles.requestActionText,
          { color: '#27AE60' },
        ]}
      >
        Approve
      </Text>
    </Pressable>
  </View>
)}

                      {request.status !== 'pending' &&
                        request.resolvedByName && (
                          <Text
                            style={[
                              styles.resolvedText,
                              { color: colors.textMuted },
                            ]}
                          >
                            {request.status === 'approved'
                              ? 'Approved'
                              : 'Rejected'}{' '}
                            by {request.resolvedByName}
                          </Text>
                        )}
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 18,
  },

  backButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },

  headerTitle: {
    flex: 1,
    fontSize: 27,
    fontWeight: '700',
    marginLeft: 14,
  },

  headerSpacer: {
    width: 44,
  },

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

  requestCard: {
    alignItems: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
  },

  requestActions: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 14,
},

requestActionButton: {
  alignItems: 'center',
  borderRadius: 10,
  borderWidth: 1,
  flex: 1,
  flexDirection: 'row',
  gap: 7,
  justifyContent: 'center',
  minHeight: 42,
  paddingHorizontal: 12,
},

rejectActionButton: {
  backgroundColor: '#FDECEC',
  borderColor: '#F5B5B5',
},

approveActionButton: {
  backgroundColor: '#EAF7EF',
  borderColor: '#B7E3C5',
},

requestActionText: {
  fontSize: 14,
  fontWeight: '700',
},

  actionIconContainer: {
    alignItems: 'center',
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },

  requestContent: {
    flex: 1,
    marginLeft: 13,
    minWidth: 0,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },

  resourceName: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  requesterName: {
  fontSize: 13,
  fontWeight: '600',
  marginTop: 5,
},

requesterEmail: {
  fontSize: 12,
  marginTop: 2,
},

  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 10,
  },

  statusBadge: {
    alignItems: 'center',
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  timeText: {
    fontSize: 11,
  },

  resolvedText: {
    fontSize: 11,
    marginTop: 8,
  },

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