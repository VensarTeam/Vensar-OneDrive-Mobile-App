export type DriveResourceType = 'file' | 'folder';
export type ShareAccessType = 'existing' | 'public' | 'restricted';
export type SharePermission = 'admin' | 'editor' | 'viewer';

export type DriveProject = {
  id: string;
  projectId: string;
  name: string;
  shortName: string;
  serviceId: string;
  stateCode: string;
  title: string;
  workScope: string;
  majorComponents: Array<{ component: string; qty: number; srNo: number }>;
  customFields: Array<{ label: string; value: string }>;
  createdAt: string;
  updatedAt: string;
};

export type DriveFolder = {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  order: number;
  projectId: string;
  serviceId: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  createdByName?: string;
  childrenCount?: number;
  type?: 'folder';
};

export type DriveFile = {
  id: string;
  name: string;
  folderId: string | null;
  mimeType: string;
  size: number;
  serviceId: string;
  projectId: string;
  s3Key: string;
  uploadedAt: string;
  updatedAt: string;
  uploadedBy?: string;
};

export type DocumentListing = {
  rootFolder: Pick<DriveFolder, 'id' | 'name' | 'path'>;
  folders: DriveFolder[];
  files: DriveFile[];
};

export type ShareUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  designation?: string | null;
};

export type ShareGrant = {
  id: string;
  permission: SharePermission;
  user?: ShareUser;
  userId: string;
};

export type ShareLink = {
  id: string;
  permission: SharePermission;
  token?: string;
  shareToken?: string;
  shareUrl?: string;
  url?: string;
  expiresAt?: string | null;
};

export type ResourceShare = {
  grants: ShareGrant[];
  resourceName: string;
  link?: ShareLink | null;
  resourceId: string;
  resourceType: DriveResourceType;
};

export type SharedDriveItem = {
  folderId: string | null;
  id: string;
  mimeType: string | null;
  name: string;
  permission: SharePermission;
  projectId: string;
  resourceId: string;
  resourceType: DriveResourceType;
  serviceId: string;
  sharedAt: string;
  size: number | null;
};

export type ShareResourceInput = {
  accessType: ShareAccessType;
  expiresAt?: string | null;
  linkPermission: SharePermission;
  password?: string | null;
  resourceId: string;
  resourceType: DriveResourceType;
  userGrants: Array<{
    permission: SharePermission;
    userId: string;
  }>;
};
