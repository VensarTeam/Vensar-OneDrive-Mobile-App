import AsyncStorage from '@react-native-async-storage/async-storage';

export type StarredItemType = 'service' | 'folder' | 'file';

export type StarredItem = {
  id: string;
  type: StarredItemType;
  name: string;

  serviceId: string;
  serviceName?: string;

  projectId?: string;
  projectName?: string;

  folderId?: string;
  folderName?: string;

  openFileId?: string;
};

const STARRED_STORAGE_KEY = '@vdrive/starred-items';

function getStarredStorageKey(userId: string): string {
  return `${STARRED_STORAGE_KEY}:${userId}`;
}

export async function getStarredItems(
  userId: string,
): Promise<StarredItem[]> {
  try {
    const stored = await AsyncStorage.getItem(
      getStarredStorageKey(userId),
    );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveStarredItems(
  userId: string,
  items: StarredItem[],
): Promise<void> {
  await AsyncStorage.setItem(
    getStarredStorageKey(userId),
    JSON.stringify(items),
  );
}

export async function isStarred(
  userId: string,
  id: string,
): Promise<boolean> {
  const items = await getStarredItems(userId);

  return items.some((item) => item.id === id);
}

export async function toggleStarred(
  userId: string,
  item: StarredItem,
): Promise<boolean> {
  const items = await getStarredItems(userId);

  const existingIndex = items.findIndex(
    (existing) => existing.id === item.id,
  );

  if (existingIndex >= 0) {
    items.splice(existingIndex, 1);

    await saveStarredItems(userId, items);

    return false;
  }

  await saveStarredItems(userId, [
    ...items,
    item,
  ]);

  return true;
}