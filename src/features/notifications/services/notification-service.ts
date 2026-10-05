import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiRequest } from '../../../core/api/apiClient';
import type { ApiEnvelope } from '../../../core/api/api-response';
import { unwrapApiData } from '../../../core/api/api-response';

type RequestStatus = 'pending' | 'approved' | 'rejected';
type RequestAction = 'download' | 'share' | 'delete';

type DownloadRequest = {
  id: string;
  requesterId: string;
  status: RequestStatus;
  action: RequestAction;
  createdAt: string;
  updatedAt: string;
};

type AdminAlert = {
  id: string;
  isRead: boolean;
  createdAt: string;
};

export const LAST_READ_KEY = '@vdrive/notifications-last-read-at';

export async function getUnreadNotificationCount(
  userId: string,
  role?: string,
) {
  const lastReadAt =
    Number(await AsyncStorage.getItem(LAST_READ_KEY)) || 0;

  const mineResponse = await apiRequest<
    ApiEnvelope<DownloadRequest[]> | DownloadRequest[]
  >('/download-requests/mine', {
    method: 'GET',
    authenticated: true,
  });

  const mine = unwrapApiData(mineResponse) as DownloadRequest[];

  let requests = mine;

  const canApproveRequests =
    role === 'manager' ||
    role === 'admin' ||
    role === 'super_admin';

  if (canApproveRequests) {
    const approverResponse = await apiRequest<
      ApiEnvelope<DownloadRequest[]> | DownloadRequest[]
    >('/download-requests', {
      method: 'GET',
      authenticated: true,
    });

    const approver =
      unwrapApiData(approverResponse) as DownloadRequest[];

    const requestMap = new Map<string, DownloadRequest>();

    [...mine, ...approver].forEach(request => {
      requestMap.set(request.id, request);
    });

    requests = [...requestMap.values()];
  }

  const requestUnreadCount = requests.filter(request => {
    const timestamp = new Date(
      request.status === 'pending'
        ? request.createdAt
        : request.updatedAt || request.createdAt,
    ).getTime();

    return timestamp > lastReadAt;
  }).length;

  let adminUnreadCount = 0;

  const canReadAdminAlerts =
    role === 'admin' || role === 'super_admin';

  if (canReadAdminAlerts) {
    try {
      const adminResponse = await apiRequest<
        ApiEnvelope<AdminAlert[]> | AdminAlert[]
      >('/admin-alerts', {
        method: 'GET',
        authenticated: true,
      });

      const alerts =
        unwrapApiData(adminResponse) as AdminAlert[];

      adminUnreadCount = alerts.filter(alert => {
        const timestamp = new Date(alert.createdAt).getTime();

        return !alert.isRead && timestamp > lastReadAt;
      }).length;
    } catch {
      adminUnreadCount = 0;
    }
  }

  return requestUnreadCount + adminUnreadCount;
}