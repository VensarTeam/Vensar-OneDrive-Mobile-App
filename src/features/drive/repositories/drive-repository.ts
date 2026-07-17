import type { ApiEnvelope } from '../../../core/api/api-response';
import { unwrapApiData } from '../../../core/api/api-response';
import { apiRequest } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';
import type {
  DocumentListing,
  DriveFile,
  DriveFolder,
  DriveProject,
  DriveResourceType,
  ResourceShare,
  ShareResourceInput,
  ShareUser,
  SharedDriveItem,
} from '../models/drive-models';

type ApiResult<T> = T | ApiEnvelope<T>;
type AuthenticatedRequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

function queryString(values: Record<string, string | null | undefined>) {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

async function authenticatedRequest<T>(path: string, options?: AuthenticatedRequestOptions) {
  const response = await apiRequest<ApiResult<T>>(path, { ...options, authenticated: true });
  return unwrapApiData(response);
}

export function getProjects(serviceId: string) {
  return authenticatedRequest<DriveProject[]>(
    `${env.endpoints.projects}${queryString({ serviceId })}`,
    { method: 'GET' },
  );
}

export function getFolderChildren(serviceId: string, projectId: string, parentId?: string | null) {
  const parent = parentId ?? 'root';
  return authenticatedRequest<DriveFolder[]>(
    `${env.endpoints.folders}/by-parent/${encodeURIComponent(parent)}${queryString({ serviceId, projectId })}`,
    { method: 'GET' },
  );
}

export function getFolders(serviceId: string, projectId: string) {
  return authenticatedRequest<DriveFolder[]>(
    `${env.endpoints.folders}${queryString({ serviceId, projectId })}`,
    { method: 'GET' },
  );
}

export function getFolder(folderId: string) {
  return authenticatedRequest<DriveFolder>(
    `${env.endpoints.folders}/${encodeURIComponent(folderId)}`,
    { method: 'GET' },
  );
}

export function getDocuments(input: {
  folderId?: string | null;
  projectId: string;
  serviceId: string;
}) {
  return authenticatedRequest<DocumentListing>(
    `${env.endpoints.documents}${queryString(input)}`,
    { method: 'GET' },
  );
}

export function copyResource(
  resourceType: DriveResourceType,
  resourceId: string,
  targetFolderId: string,
) {
  const endpoint = resourceType === 'folder' ? env.endpoints.folders : env.endpoints.files;
  return authenticatedRequest<DriveFolder | DriveFile>(
    `${endpoint}/${encodeURIComponent(resourceId)}/copy`,
    { method: 'POST', body: { targetFolderId } },
  );
}

export function moveResource(
  resourceType: DriveResourceType,
  resourceId: string,
  targetFolderId: string,
) {
  const endpoint = resourceType === 'folder' ? env.endpoints.folders : env.endpoints.files;
  return authenticatedRequest<DriveFolder | DriveFile>(
    `${endpoint}/${encodeURIComponent(resourceId)}`,
    {
      method: 'PATCH',
      body: resourceType === 'folder'
        ? { parentId: targetFolderId }
        : { folderId: targetFolderId },
    },
  );
}

export function searchShareUsers(query: string) {
  return authenticatedRequest<ShareUser[]>(
    `${env.endpoints.sharing}/users${queryString({ q: query.trim() })}`,
    { method: 'GET' },
  );
}

export function getSharedWithMe() {
  return authenticatedRequest<SharedDriveItem[]>(`${env.endpoints.sharing}/shared-with-me`, {
    method: 'GET',
  });
}

export function getResourceShare(resourceType: DriveResourceType, resourceId: string) {
  return authenticatedRequest<ResourceShare>(
    `${env.endpoints.sharing}/resource/${resourceType}/${encodeURIComponent(resourceId)}`,
    { method: 'GET' },
  );
}

export function shareResource(input: ShareResourceInput) {
  return authenticatedRequest<ResourceShare>(env.endpoints.sharing, {
    method: 'POST',
    body: input,
  });
}

export function revokeShareGrant(grantId: string) {
  return authenticatedRequest<void>(
    `${env.endpoints.sharing}/grants/${encodeURIComponent(grantId)}`,
    { method: 'DELETE' },
  );
}

export function deactivateShareLink(linkId: string) {
  return authenticatedRequest<void>(
    `${env.endpoints.sharing}/links/${encodeURIComponent(linkId)}`,
    { method: 'DELETE' },
  );
}
