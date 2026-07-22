import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsiveLayout } from '../../../core/responsive';
import { useAppTheme } from '../../../core/theme';
import { fontFamilies } from '../../../core/theme/typography';
import type { HomeTabParamList } from '../../../navigation/HomeTabs';
import { useToast } from '../../../shared/toast/toast-provider';
import type { SharedDriveItem } from '../models/drive-models';
import { getSharedWithMe } from '../repositories/drive-repository';
import { downloadAndOpenFile, prepareFileForPreview } from '../services/file-download-service';
import type { PreparedFile } from './resource-action-modal';
import { FilePreviewModal } from './resource-action-modal';

function formatSize(size: number | null) {
  if (size == null) return 'Folder';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function formatSharedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(value));
}

function getSharedFileIcon(item: SharedDriveItem) {
  if (item.resourceType === 'folder') return 'folder-account-outline';
  const mime = item.mimeType?.toLocaleLowerCase() ?? '';
  const extension = item.name.split('.').at(-1)?.toLocaleLowerCase() ?? '';
  if (mime.includes('pdf') || extension === 'pdf') return 'file-pdf-box';
  if (mime.startsWith('image/')) return 'file-image-outline';
  if (mime.startsWith('video/')) return 'file-video-outline';
  if (mime.startsWith('audio/')) return 'file-music-outline';
  if (mime.includes('spreadsheet') || ['csv', 'xls', 'xlsx'].includes(extension)) return 'file-excel-outline';
  if (mime.includes('presentation') || ['ppt', 'pptx'].includes(extension)) return 'file-powerpoint-outline';
  if (mime.includes('word') || ['doc', 'docx'].includes(extension)) return 'file-word-outline';
  if (mime.startsWith('text/')) return 'file-document-outline';
  return 'file-account-outline';
}

export function SharedScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<HomeTabParamList, 'Shared'>>();
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveLayout();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { showToast } = useToast();
  const [items, setItems] = useState<SharedDriveItem[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string>();
  const [openingId, setOpeningId] = useState<string>();
  const [sharingId, setSharingId] = useState<string>();
  const [previewFile, setPreviewFile] = useState<PreparedFile>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getSharedWithMe());
    } catch (error) {
      showToast({ message: error instanceof Error ? error.message : 'Unable to load shared items.', tone: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void load(); }, [load]);

  const download = async (item: SharedDriveItem) => {
    if (item.resourceType !== 'file' || !item.mimeType) return;
    setDownloadingId(item.id);
    try {
      const saved = await downloadAndOpenFile(item.resourceId, item.name, item.mimeType);
      showToast({ message: `${saved.fileName} saved to ${saved.directoryName}.`, title: 'Download complete' });
    } catch (error) {
      showToast({ message: error instanceof Error ? error.message : 'Unable to download file.', tone: 'error' });
    } finally {
      setDownloadingId(undefined);
    }
  };

  const openFolder = (item: SharedDriveItem) => {
    navigation.navigate('Files', {
      folderId: item.resourceId,
      folderName: item.name,
      projectId: item.projectId,
      permission: item.permission,
      serviceId: item.serviceId,
      serviceName: item.serviceId.replaceAll('-', ' '),
    });
  };

  const viewFile = async (item: SharedDriveItem) => {
    if (item.resourceType !== 'file' || !item.mimeType) return;
    setOpeningId(item.id);
    try {
      setPreviewFile(await prepareFileForPreview(item.resourceId, item.name, item.mimeType));
    } catch (error) {
      showToast({ message: error instanceof Error ? error.message : 'Unable to open file preview.', tone: 'error' });
    } finally {
      setOpeningId(undefined);
    }
  };

  const shareFile = async (item: SharedDriveItem) => {
    if (item.resourceType !== 'file' || !item.mimeType) return;
    setSharingId(item.id);
    try {
      if (!await Sharing.isAvailableAsync()) throw new Error('Sharing is not available on this device.');
      const file = await prepareFileForPreview(item.resourceId, item.name, item.mimeType);
      await Sharing.shareAsync(file.uri, { dialogTitle: `Share ${file.fileName}`, mimeType: file.mimeType });
    } catch (error) {
      showToast({ message: error instanceof Error ? error.message : 'Unable to share this file.', tone: 'error' });
    } finally {
      setSharingId(undefined);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, {
        paddingHorizontal: responsive.horizontalPadding,
        paddingTop: (responsive.isCompact ? 8 : 16) + (process.env.EXPO_OS === 'android' ? insets.top : 0),
      }]}
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={[styles.content, { maxWidth: responsive.maxContentWidth }]}>
        <View style={styles.header}><View><Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Shared</Text><Text style={[styles.subtitle, { color: colors.textMuted }]}>Files and folders shared with you</Text></View><Pressable accessibilityLabel="Refresh" hitSlop={10} onPress={load}><Icon color={colors.primary} size={24} source="refresh" /></Pressable></View>
        {isLoading ? <View style={styles.state}><ActivityIndicator color={colors.primary} /><Text style={[styles.message, { color: colors.textMuted }]}>Loading shared items…</Text></View> : items.length === 0 ? <View style={styles.state}><View style={[styles.stateIcon, { backgroundColor: colors.surfaceMuted }]}><Icon color={colors.primary} size={32} source="account-multiple-outline" /></View><Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing shared yet</Text><Text style={[styles.message, { color: colors.textMuted }]}>Items other people share with your account will appear here.</Text></View> : <View style={styles.list}>{items.map((item) => <SharedItemRow downloading={downloadingId === item.id} item={item} key={item.id} onDownload={() => download(item)} onOpenFolder={() => openFolder(item)} onShare={() => shareFile(item)} onView={() => viewFile(item)} opening={openingId === item.id} sharing={sharingId === item.id} />)}</View>}
      </View>
      {previewFile ? <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(undefined)} /> : null}
    </ScrollView>
  );
}

function SharedItemRow({ downloading, item, onDownload, onOpenFolder, onShare, onView, opening, sharing }: { downloading: boolean; item: SharedDriveItem; onDownload: () => void; onOpenFolder: () => void; onShare: () => void; onView: () => void; opening: boolean; sharing: boolean }) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const content = <><View style={[styles.itemIcon, { backgroundColor: colors.surfaceMuted }]}><Icon color={colors.primary} size={25} source={getSharedFileIcon(item)} /></View><View style={styles.copy}><Text numberOfLines={2} style={[styles.name, { color: colors.text }]}>{item.name}</Text><Text numberOfLines={1} style={[styles.meta, { color: colors.textMuted }]}>{item.permission === 'editor' ? 'Can edit' : 'Can view'} · {formatSize(item.size)}</Text><Text numberOfLines={1} style={[styles.context, { color: colors.textMuted }]}>{item.projectId.replaceAll('-', ' ')} · {formatSharedDate(item.sharedAt)}</Text></View></>;

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {item.resourceType === 'folder' ? <Pressable accessibilityRole="button" onPress={onOpenFolder} style={styles.rowMain}>{content}<Icon color={colors.textMuted} size={21} source="chevron-right" /></Pressable> : <Pressable accessibilityLabel={`View ${item.name}`} accessibilityRole="button" disabled={opening} onPress={onView} style={styles.rowMain}>{content}{opening ? <ActivityIndicator color={colors.primary} size="small" /> : null}</Pressable>}
      {item.resourceType === 'file' ? <View style={styles.fileActions}><Pressable accessibilityLabel={`Share ${item.name} to another app`} disabled={sharing} hitSlop={6} onPress={onShare} style={styles.fileAction}>{sharing ? <ActivityIndicator color={colors.primary} size="small" /> : <Icon color={colors.primary} size={21} source="export-variant" />}</Pressable><Pressable accessibilityLabel={`Download ${item.name}`} disabled={downloading} hitSlop={6} onPress={onDownload} style={styles.fileAction}>{downloading ? <ActivityIndicator color={colors.primary} size="small" /> : <Icon color={colors.primary} size={21} source="download-outline" />}</Pressable></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scrollContent: { alignItems: 'center', paddingBottom: 32 }, content: { width: '100%' }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, title: { fontFamily: fontFamilies.bold, fontSize: 28, letterSpacing: -0.6 }, subtitle: { fontFamily: fontFamilies.regular, fontSize: 13, paddingTop: 2 }, state: { alignItems: 'center', gap: 9, justifyContent: 'center', minHeight: 430, paddingHorizontal: 24 }, stateIcon: { alignItems: 'center', borderRadius: 22, height: 76, justifyContent: 'center', width: 76 }, emptyTitle: { fontFamily: fontFamilies.semibold, fontSize: 18, paddingTop: 7 }, message: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 20, maxWidth: 300, textAlign: 'center' }, list: { gap: 8, paddingTop: 25 }, row: { alignItems: 'center', borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 82, overflow: 'hidden' }, rowMain: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12, minHeight: 80, paddingLeft: 11, paddingRight: 8 }, itemIcon: { alignItems: 'center', borderRadius: 13, height: 48, justifyContent: 'center', width: 48 }, copy: { flex: 1, gap: 2 }, name: { fontFamily: fontFamilies.semibold, fontSize: 14 }, meta: { fontFamily: fontFamilies.regular, fontSize: 11 }, context: { fontFamily: fontFamilies.regular, fontSize: 10, textTransform: 'capitalize' }, fileActions: { alignItems: 'center', flexDirection: 'row' }, fileAction: { alignItems: 'center', height: 48, justifyContent: 'center', width: 40 },
});
