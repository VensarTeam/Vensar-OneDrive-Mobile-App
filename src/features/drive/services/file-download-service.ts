import { fetch } from 'expo/fetch';
import { Directory } from 'expo-file-system';

import { ApiError } from '../../../core/api/ApiError';
import { env } from '../../../core/config/env';
import { getSecureItem } from '../../../core/storage/secureStore';
import { storageKeys } from '../../../core/storage/storageKeys';
import { getPreference, removePreference, setPreference } from '../../../core/storage/preferencesStore';

const downloadDirectoryName = 'VensarOneDrive';
const downloadParentKey = 'downloads.parent-directory-uri';

function safeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '_');
}

function getAvailableFileName(directory: Directory, requestedName: string) {
  const existingNames = new Set(directory.list().map((entry) => entry.name.toLocaleLowerCase()));
  if (!existingNames.has(requestedName.toLocaleLowerCase())) return requestedName;

  const extensionIndex = requestedName.lastIndexOf('.');
  const hasExtension = extensionIndex > 0;
  const baseName = hasExtension ? requestedName.slice(0, extensionIndex) : requestedName;
  const extension = hasExtension ? requestedName.slice(extensionIndex) : '';
  let copyNumber = 1;
  while (existingNames.has(`${baseName} (${copyNumber})${extension}`.toLocaleLowerCase())) {
    copyNumber += 1;
  }
  return `${baseName} (${copyNumber})${extension}`;
}

function ensureVensarDirectory(parent: Directory) {
  if (parent.name === downloadDirectoryName) return parent;
  const existing = parent.list().find(
    (entry) => entry instanceof Directory && entry.name === downloadDirectoryName,
  );
  return existing instanceof Directory ? existing : parent.createDirectory(downloadDirectoryName);
}

async function getDownloadDirectory() {
  const storedUri = await getPreference(downloadParentKey);
  if (storedUri) {
    try {
      return ensureVensarDirectory(new Directory(storedUri));
    } catch {
      await removePreference(downloadParentKey);
    }
  }

  const selectedParent = await Directory.pickDirectoryAsync();
  await setPreference(downloadParentKey, selectedParent.uri);
  return ensureVensarDirectory(selectedParent);
}

export async function downloadAndOpenFile(fileId: string, fileName: string, mimeType: string) {
  const token = await getSecureItem(storageKeys.authToken);
  if (!token) throw new ApiError('Your session has expired. Sign in again.', 401);

  const directory = await getDownloadDirectory();

  const response = await fetch(
    new URL(`${env.endpoints.files}/${encodeURIComponent(fileId)}/download`, env.apiBaseUrl),
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) throw new ApiError('Unable to download this file.', response.status);

  const savedName = getAvailableFileName(directory, safeFileName(fileName));
  const file = directory.createFile(savedName, mimeType);
  file.write(await response.bytes());
  return { directoryName: downloadDirectoryName, fileName: savedName, uri: file.uri };
}
