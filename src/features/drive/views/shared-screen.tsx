import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { downloadAndOpenFile } from '../services/file-download-service';

function formatSize(size: number | null) {
  if (size == null) return 'Folder';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function formatSharedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(value));
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

  return (
    <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: responsive.horizontalPadding, paddingTop: insets.top + 16 }]} contentInsetAdjustmentBehavior="automatic" style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { maxWidth: responsive.maxContentWidth }]}>
        <View style={styles.header}><View><Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Shared</Text><Text style={[styles.subtitle, { color: colors.textMuted }]}>Files and folders shared with you</Text></View><Pressable accessibilityLabel="Refresh" hitSlop={10} onPress={load}><Icon color={colors.primary} size={24} source="refresh" /></Pressable></View>
        {isLoading ? <View style={styles.state}><ActivityIndicator color={colors.primary} /><Text style={[styles.message, { color: colors.textMuted }]}>Loading shared items…</Text></View> : items.length === 0 ? <View style={styles.state}><View style={[styles.stateIcon, { backgroundColor: colors.surfaceMuted }]}><Icon color={colors.primary} size={32} source="account-multiple-outline" /></View><Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing shared yet</Text><Text style={[styles.message, { color: colors.textMuted }]}>Items other people share with your account will appear here.</Text></View> : <View style={styles.list}>{items.map((item) => <SharedItemRow downloading={downloadingId === item.id} item={item} key={item.id} onDownload={() => download(item)} onOpenFolder={() => openFolder(item)} />)}</View>}
      </View>
    </ScrollView>
  );
}

function SharedItemRow({ downloading, item, onDownload, onOpenFolder }: { downloading: boolean; item: SharedDriveItem; onDownload: () => void; onOpenFolder: () => void }) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const content = <><View style={[styles.itemIcon, { backgroundColor: colors.surfaceMuted }]}><Icon color={colors.primary} size={25} source={item.resourceType === 'folder' ? 'folder-account-outline' : item.mimeType?.includes('pdf') ? 'file-pdf-box' : 'file-account-outline'} /></View><View style={styles.copy}><Text numberOfLines={2} style={[styles.name, { color: colors.text }]}>{item.name}</Text><Text numberOfLines={1} style={[styles.meta, { color: colors.textMuted }]}>{item.permission === 'editor' ? 'Can edit' : 'Can view'} · {formatSize(item.size)}</Text><Text numberOfLines={1} style={[styles.context, { color: colors.textMuted }]}>{item.projectId.replaceAll('-', ' ')} · {formatSharedDate(item.sharedAt)}</Text></View></>;

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {item.resourceType === 'folder' ? <Pressable accessibilityRole="button" onPress={onOpenFolder} style={styles.rowMain}>{content}<Icon color={colors.textMuted} size={21} source="chevron-right" /></Pressable> : <View style={styles.rowMain}>{content}</View>}
      {item.resourceType === 'file' ? <Pressable accessibilityLabel={`Download ${item.name}`} disabled={downloading} hitSlop={8} onPress={onDownload} style={styles.download}>{downloading ? <ActivityIndicator color={colors.primary} size="small" /> : <Icon color={colors.primary} size={22} source="download-outline" />}</Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scrollContent: { alignItems: 'center', paddingBottom: 32 }, content: { width: '100%' }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, title: { fontFamily: fontFamilies.bold, fontSize: 28, letterSpacing: -0.6 }, subtitle: { fontFamily: fontFamilies.regular, fontSize: 13, paddingTop: 2 }, state: { alignItems: 'center', gap: 9, justifyContent: 'center', minHeight: 430, paddingHorizontal: 24 }, stateIcon: { alignItems: 'center', borderRadius: 22, height: 76, justifyContent: 'center', width: 76 }, emptyTitle: { fontFamily: fontFamilies.semibold, fontSize: 18, paddingTop: 7 }, message: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 20, maxWidth: 300, textAlign: 'center' }, list: { gap: 8, paddingTop: 25 }, row: { alignItems: 'center', borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 82, overflow: 'hidden' }, rowMain: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12, minHeight: 80, paddingLeft: 11, paddingRight: 10 }, itemIcon: { alignItems: 'center', borderRadius: 13, height: 48, justifyContent: 'center', width: 48 }, copy: { flex: 1, gap: 2 }, name: { fontFamily: fontFamilies.semibold, fontSize: 14 }, meta: { fontFamily: fontFamilies.regular, fontSize: 11 }, context: { fontFamily: fontFamilies.regular, fontSize: 10, textTransform: 'capitalize' }, download: { alignItems: 'center', height: 54, justifyContent: 'center', width: 48 },
});
