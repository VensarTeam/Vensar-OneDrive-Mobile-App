import { getSecureItem, removeSecureItem, setSecureItem } from '../../../core/storage/secureStore';
import type { AuthToken } from '../models/authToken';

const tokenKey = 'auth.token';

export async function getAuthToken(): Promise<AuthToken | null> {
  const storedToken = await getSecureItem(tokenKey);
  return storedToken ? JSON.parse(storedToken) : null;
}

export async function saveAuthToken(token: AuthToken) {
  await setSecureItem(tokenKey, JSON.stringify(token));
}

export async function clearAuthToken() {
  await removeSecureItem(tokenKey);
}
