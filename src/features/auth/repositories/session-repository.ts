import { getSecureItem, removeSecureItem, setSecureItem } from '../../../core/storage/secureStore';
import { storageKeys } from '../../../core/storage/storageKeys';
import type { AuthUser, VerifyOtpResponse } from '../models/authApiModels';

export type StoredSession = {
  accessToken: string;
  user: AuthUser | null;
};

export async function getStoredSession(): Promise<StoredSession | null> {
  const [accessToken, serializedUser] = await Promise.all([
    getSecureItem(storageKeys.authToken),
    getSecureItem(storageKeys.authUser),
  ]);

  if (!accessToken) return null;

  if (!serializedUser) return { accessToken, user: null };

  try {
    return { accessToken, user: JSON.parse(serializedUser) as AuthUser };
  } catch {
    await removeSecureItem(storageKeys.authUser);
    return { accessToken, user: null };
  }
}

export async function saveSession(response: VerifyOtpResponse) {
  const accessToken = response.access_token?.trim();
  if (!accessToken || !response.user || typeof response.user !== 'object') {
    throw new Error('Cannot securely save an invalid login session. Please sign in again.');
  }

  const serializedUser = JSON.stringify(response.user);
  if (!serializedUser) {
    throw new Error('Cannot securely save the user profile. Please sign in again.');
  }

  // Store the profile first so a partial write never leaves a new token without its user.
  await setSecureItem(storageKeys.authUser, serializedUser);
  await setSecureItem(storageKeys.authToken, accessToken);
}

export async function clearSession() {
  await Promise.all([
    removeSecureItem(storageKeys.authToken),
    removeSecureItem(storageKeys.authUser),
  ]);
}
