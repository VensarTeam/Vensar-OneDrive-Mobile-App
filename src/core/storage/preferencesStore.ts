import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getPreference(key: string) {
  return AsyncStorage.getItem(key);
}

export async function setPreference(key: string, value: string) {
  await AsyncStorage.setItem(key, value);
}

export async function removePreference(key: string) {
  await AsyncStorage.removeItem(key);
}
