import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = '@vdrive/recently-opened:';
const MAX_ITEMS = 6;

export type RecentlyOpenedItem = {
  id: string;
  type: 'file' | 'folder';
  name: string;
  mimeType?: string;
  serviceId: string;
  serviceName?: string;
  projectId?: string;
  projectName?: string;
  folderId?: string;
  folderName?: string;
  permission?: 'admin' | 'editor' | 'viewer';
  openedAt: number;
};

function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export async function getRecentlyOpened(
  userId: string,
): Promise<RecentlyOpenedItem[]> {
  try {
    const raw = await AsyncStorage.getItem(getStorageKey(userId));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isRecentlyOpenedItem).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export async function addRecentlyOpened(
  userId: string,
  item: Omit<RecentlyOpenedItem, 'openedAt'>,
): Promise<RecentlyOpenedItem[]> {
  const current = await getRecentlyOpened(userId);

  const nextItem: RecentlyOpenedItem = {
    ...item,
    openedAt: Date.now(),
  };

  const next = [
    nextItem,
    ...current.filter(
      (entry) => !(entry.id === item.id && entry.type === item.type),
    ),
  ].slice(0, MAX_ITEMS);

  await AsyncStorage.setItem(
    getStorageKey(userId),
    JSON.stringify(next),
  );

  return next;
}

export async function clearRecentlyOpened(
  userId: string,
): Promise<void> {
  await AsyncStorage.removeItem(getStorageKey(userId));
}

function isRecentlyOpenedItem(
  value: unknown,
): value is RecentlyOpenedItem {
  if (!value || typeof value !== 'object') return false;

  const item = value as Partial<RecentlyOpenedItem>;

  return (
    typeof item.id === 'string' &&
    (item.type === 'file' || item.type === 'folder') &&
    typeof item.name === 'string' &&
    typeof item.serviceId === 'string' &&
    typeof item.openedAt === 'number'
  );
}