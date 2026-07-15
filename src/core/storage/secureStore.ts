import * as SecureStore from 'expo-secure-store';

export async function getSecureItem(key: string) {
  return SecureStore.getItemAsync(key);
}

export async function setSecureItem(key: string, value: string) {
  if (typeof value !== 'string') {
    throw new TypeError(`Secure storage value for "${key}" must be a string.`);
  }

  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}

export async function removeSecureItem(key: string) {
  await SecureStore.deleteItemAsync(key);
}
