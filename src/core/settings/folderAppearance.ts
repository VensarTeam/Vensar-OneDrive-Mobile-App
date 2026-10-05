import {
  getPreference,
  setPreference,
} from '../storage/preferencesStore';

export type FolderAppearanceMode =
  | 'service'
  | 'monochrome';

export type MonochromeFolderColor =
  | '#2F80ED'
  | '#27AE60'
  | '#F2994A';

export type FolderAppearanceSettings = {
  mode: FolderAppearanceMode;
  color: MonochromeFolderColor;
};

export const DEFAULT_FOLDER_APPEARANCE: FolderAppearanceSettings = {
  mode: 'service',
  color: '#2F80ED',
};

export const FOLDER_APPEARANCE_STORAGE_KEY =
  '@vdrive/folder-appearance';

export async function getFolderAppearance(): Promise<FolderAppearanceSettings> {
  const stored = await getPreference(FOLDER_APPEARANCE_STORAGE_KEY);

  if (!stored) {
    return DEFAULT_FOLDER_APPEARANCE;
  }

  try {
    return {
      ...DEFAULT_FOLDER_APPEARANCE,
      ...JSON.parse(stored),
    };
  } catch {
    return DEFAULT_FOLDER_APPEARANCE;
  }
}

export async function saveFolderAppearance(
  settings: FolderAppearanceSettings,
): Promise<void> {
  await setPreference(
    FOLDER_APPEARANCE_STORAGE_KEY,
    JSON.stringify(settings),
  );
}