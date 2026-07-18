import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { File } from 'expo-file-system';
import { Image } from 'expo-image';
import * as Sharing from 'expo-sharing';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../../../core/theme';
import { fontFamilies } from '../../../core/theme/typography';
import { BottomSheetShell } from '../../../shared/components/bottom-sheet-shell';
import { useToast } from '../../../shared/toast/toast-provider';
import type {
  DriveFile,
  DriveFolder,
  DriveResourceType,
  ResourceShare,
  ShareAccessType,
  SharePermission,
  ShareUser,
} from '../models/drive-models';
import {
  copyResource,
  getFolders,
  getResourceShare,
  moveResource,
  revokeShareGrant,
  searchShareUsers,
  shareResource,
} from '../repositories/drive-repository';
import { downloadAndOpenFile, prepareFileForPreview } from '../services/file-download-service';

export type SelectedResource = { item: DriveFile | DriveFolder; type: DriveResourceType };
export type PreparedFile = { fileName: string; mimeType: string; uri: string };
type Mode = 'actions' | 'copy' | 'move' | 'share';

export function ResourceActionModal(props: {
  accessMode: 'owner' | SharePermission;
  initialMode?: Mode;
  onClose: () => void;
  onCompleted: () => void;
  projectId: string;
  resources: SelectedResource[];
  serviceId: string;
}) {
  const { accessMode, initialMode = 'actions', onClose, onCompleted, projectId, resources, serviceId } = props;
  const resource = resources[0];
  const isReadOnly = accessMode === 'viewer';
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [folderQuery, setFolderQuery] = useState('');
  const [share, setShare] = useState<ResourceShare>();
  const [users, setUsers] = useState<ShareUser[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<ShareUser[]>([]);
  const [showAllSelected, setShowAllSelected] = useState(false);
  const [permission, setPermission] = useState<SharePermission>('viewer');
  const [accessType, setAccessType] = useState<ShareAccessType>('restricted');
  const [linkPermission, setLinkPermission] = useState<SharePermission>('viewer');
  const [expiresAt, setExpiresAt] = useState('');
  const [password, setPassword] = useState('');
  const [linkSettingsExpanded, setLinkSettingsExpanded] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const [isActionSheetVisible, setActionSheetVisible] = useState(true);
  const [previewFile, setPreviewFile] = useState<PreparedFile>();

  useEffect(() => {
    if (!resource) return;
    setMode(initialMode);
    setFolderQuery('');
    setSelectedUsers([]);
    setShowAllSelected(false);
    setUserQuery('');
    setUsers([]);
    setShare(undefined);
    setActionSheetVisible(true);
    setPreviewFile(undefined);
  }, [initialMode, resource]);

  useEffect(() => {
    if (mode !== 'share' || !resource) return;
    let current = true;
    setBusy(true);
    void getResourceShare(resource.type, resource.item.id)
      .then((result) => {
        if (!current) return;
        setShare(result);
        setAccessType(result.link?.accessType ?? 'restricted');
        setLinkPermission(result.link?.permission ?? 'viewer');
        setExpiresAt(result.link?.expiresAt?.slice(0, 10) ?? '');
        setLinkSettingsExpanded(true);
      })
      .catch((error) => current && reportError(error, 'Unable to load access details.'))
      .finally(() => current && setBusy(false));
    return () => { current = false; };
  }, [mode, resource]);

  useEffect(() => {
    if (mode !== 'share' || userQuery.trim().length < 2) {
      setUsers([]);
      return;
    }
    let current = true;
    const timer = setTimeout(() => {
      void searchShareUsers(userQuery)
        .then((result) => current && setUsers(dedupeUsers(result)))
        .catch(() => current && setUsers([]));
    }, 350);
    return () => { current = false; clearTimeout(timer); };
  }, [mode, userQuery]);

  useEffect(() => {
    if (mode !== 'copy' && mode !== 'move') return;
    setBusy(true);
    void getFolders(serviceId, projectId)
      .then(setFolders)
      .catch((error) => reportError(error, 'Unable to load folders.'))
      .finally(() => setBusy(false));
  }, [mode, projectId, serviceId]);

  const availableFolders = useMemo(() => {
    if (!resource) return [];
    const query = folderQuery.trim().toLocaleLowerCase();
    return folders.filter((folder) => {
      if (resources.some((selected) => selected.type === 'folder' && (folder.id === selected.item.id || folder.path.startsWith(`${(selected.item as DriveFolder).path}/`)))) return false;
      return !query || folder.name.toLocaleLowerCase().includes(query) || folder.path.toLocaleLowerCase().includes(query);
    });
  }, [folderQuery, folders, resource, resources]);

  if (!resource) return null;

  const reportError = (error: unknown, fallback: string) => {
    showToast({ message: error instanceof Error ? error.message : fallback, tone: 'error' });
  };

  const openCopy = async () => {
    setMode('copy');
  };

  const openMove = () => setMode('move');

  const openShare = () => setMode('share');

  const transferTo = async (folder: DriveFolder) => {
    setBusy(true);
    try {
      const transfer = mode === 'move' ? moveResource : copyResource;
      await Promise.all(resources.map((selected) => transfer(selected.type, selected.item.id, folder.id)));
      const verb = mode === 'move' ? 'Moved' : 'Copied';
      showToast({ message: `${resources.length} ${resources.length === 1 ? 'item' : 'items'} ${verb.toLowerCase()} to ${folder.name}.`, title: `${verb} successfully` });
      onCompleted();
      onClose();
    } catch (error) { reportError(error, `Unable to ${mode} ${resources.length === 1 ? 'item' : 'items'}.`); }
    finally { setBusy(false); }
  };

  const ensureLink = async () => {
    const current = share ?? await getResourceShare(resource.type, resource.item.id);
    const existingUrl = getLinkUrl(current);
    if (existingUrl) return existingUrl;
    const updated = await shareResource({
      accessType, expiresAt: normalizeExpiry(expiresAt), linkPermission, password: password || (share?.link?.hasPassword ? undefined : null),
      resourceId: resource.item.id, resourceType: resource.type, userGrants: [],
    });
    setShare(updated);
    const url = getLinkUrl(updated);
    if (!url) throw new Error('The server did not return a share link.');
    return url;
  };

  const copyLink = async () => {
    setBusy(true);
    try {
      await Clipboard.setStringAsync(await ensureLink());
      showToast({ message: 'Anyone with the link can view this item.', title: 'Link copied' });
    } catch (error) { reportError(error, 'Unable to create a share link.'); }
    finally { setBusy(false); }
  };

  const download = async () => {
    if (resource.type !== 'file') return;
    const file = resource.item as DriveFile;
    setBusy(true);
    try {
      const saved = await downloadAndOpenFile(file.id, file.name, file.mimeType);
      showToast({ message: `${saved.fileName} saved to ${saved.directoryName}.`, title: 'Download complete' });
    } catch (error) { reportError(error, 'Unable to download file.'); }
    finally { setBusy(false); }
  };

  const prepareCurrentFile = async () => {
    if (resource.type !== 'file') return undefined;
    const file = resource.item as DriveFile;
    return prepareFileForPreview(file.id, file.name, file.mimeType);
  };

  const viewFile = async () => {
    setBusy(true);
    try {
      const prepared = await prepareCurrentFile();
      if (prepared) {
        setActionSheetVisible(false);
        await new Promise((resolve) => setTimeout(resolve, 220));
        setPreviewFile(prepared);
      }
    } catch (error) { reportError(error, 'Unable to open file preview.'); }
    finally { setBusy(false); }
  };

  const shareWithApps = async () => {
    setBusy(true);
    try {
      if (!await Sharing.isAvailableAsync()) throw new Error('Sharing is not available on this device.');
      const prepared = await prepareCurrentFile();
      if (prepared) await Sharing.shareAsync(prepared.uri, { dialogTitle: `Share ${prepared.fileName}`, mimeType: prepared.mimeType });
    } catch (error) { reportError(error, 'Unable to share this file.'); }
    finally { setBusy(false); }
  };

  const toggleUser = (user: ShareUser) => {
    setSelectedUsers((current) => {
      const exists = current.some((item) => sameUser(item, user));
      return exists ? current.filter((item) => !sameUser(item, user)) : [...current, user];
    });
  };

  const grantAccess = async (collapseSettings = false) => {
    setBusy(true);
    try {
      const updated = await shareResource({
        accessType, expiresAt: normalizeExpiry(expiresAt), linkPermission, password: password || (share?.link?.hasPassword ? undefined : null),
        resourceId: resource.item.id, resourceType: resource.type,
        userGrants: selectedUsers.map(({ id }) => ({ permission, userId: id })),
      });
      setShare(updated);
      setSelectedUsers([]);
      setShowAllSelected(false);
      setUserQuery('');
      setUsers([]);
      if (collapseSettings) setLinkSettingsExpanded(false);
      showToast({ message: selectedUsers.length ? `Access granted to ${selectedUsers.length} ${selectedUsers.length === 1 ? 'person' : 'people'}.` : 'Link settings saved.', title: 'Access updated' });
    } catch (error) { reportError(error, 'Unable to share item.'); }
    finally { setBusy(false); }
  };

  const revoke = async (grantId: string) => {
    setBusy(true);
    try {
      await revokeShareGrant(grantId);
      setShare((current) => current ? { ...current, grants: current.grants.filter(({ id }) => id !== grantId) } : current);
      showToast({ message: 'This person can no longer access the item.', title: 'Access removed' });
    } catch (error) { reportError(error, 'Unable to remove access.'); }
    finally { setBusy(false); }
  };

  const leading = mode === 'actions' ? <Icon color={colors.primary} size={22} source={resource.type === 'folder' ? 'folder-outline' : 'file-outline'} /> : <Pressable accessibilityLabel="Back" hitSlop={10} onPress={() => initialMode !== 'actions' ? onClose() : setMode('actions')}><Icon color={colors.text} size={24} source="chevron-left" /></Pressable>;

  return (
    <>
    <BottomSheetShell leading={leading} onClose={onClose} title={mode === 'copy' || mode === 'move' ? `${mode === 'move' ? 'Move' : 'Copy'} ${resources.length > 1 ? `${resources.length} items` : `“${resource.item.name}”`} to` : mode === 'share' ? `Share “${resource.item.name}”` : resource.item.name} visible={isActionSheetVisible && !previewFile}>
      {mode === 'actions' ? (
        <ScrollView contentContainerStyle={styles.actions}>
          {isReadOnly ? <View style={[styles.permissionNotice, { backgroundColor: `${colors.primary}0D`, borderColor: `${colors.primary}2B` }]}><View style={[styles.permissionNoticeIcon, { backgroundColor: `${colors.primary}16` }]}><Icon color={colors.primary} size={23} source="shield-lock-outline" /></View><View style={styles.permissionNoticeCopy}><Text style={[styles.permissionNoticeTitle, { color: colors.text }]}>View-only shared access</Text><Text selectable style={[styles.permissionNoticeText, { color: colors.textMuted }]}>You can browse this shared content{resource.type === 'file' ? ' and download this file' : ''}. Copy, Move, Share, and permission changes require edit access.</Text></View></View> : null}
          {!isReadOnly ? <ActionRow icon="share-variant-outline" label="Share and manage access" onPress={openShare} /> : null}
          {!isReadOnly ? <ActionRow icon="link-variant" label="Copy link" loading={isBusy} onPress={copyLink} /> : null}
          {!isReadOnly ? <ActionRow icon="content-copy" label="Copy to another folder" onPress={openCopy} /> : null}
          {!isReadOnly ? <ActionRow icon="folder-move-outline" label="Move to another folder" onPress={openMove} /> : null}
          {resource.type === 'file' ? <ActionRow icon="eye-outline" label="View in app" loading={isBusy} onPress={viewFile} /> : null}
          {resource.type === 'file' ? <ActionRow icon="export-variant" label="Share to another app" loading={isBusy} onPress={shareWithApps} /> : null}
          {resource.type === 'file' ? <ActionRow icon="download-outline" label="Download" loading={isBusy} onPress={download} /> : null}
        </ScrollView>
      ) : mode === 'copy' || mode === 'move' ? (
        <View style={styles.flexBody}>
          <View style={styles.copySearch}>
            <SearchField onChangeText={setFolderQuery} placeholder="Search destination folders" value={folderQuery} />
          </View>
          <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
            {isBusy ? <ActivityIndicator color={colors.primary} /> : availableFolders.map((folder) => (
              <Pressable key={folder.id} onPress={() => transferTo(folder)} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.icon, { backgroundColor: `${folder.color || colors.primary}18` }]}><Icon color={folder.color || colors.primary} size={23} source="folder" /></View>
                <View style={styles.rowCopy}><Text numberOfLines={1} style={[styles.rowLabel, { color: colors.text }]}>{folder.name}</Text><Text numberOfLines={1} style={[styles.rowMeta, { color: colors.textMuted }]}>{folder.path}</Text></View>
                <Icon color={colors.textMuted} size={20} source="chevron-right" />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.shareContent} keyboardShouldPersistTaps="handled">
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>THE LINK WORKS FOR</Text>
          <ScrollView contentContainerStyle={styles.accessChoices} horizontal showsHorizontalScrollIndicator={false}>
            {([['public', 'earth', 'Anyone'], ['existing', 'account-lock-outline', 'Existing access'], ['restricted', 'account-plus-outline', 'People you choose']] as const).map(([value, icon, label]) => <Pressable key={value} onPress={() => setAccessType(value)} style={[styles.accessChoice, { backgroundColor: accessType === value ? `${colors.primary}12` : colors.surface, borderColor: accessType === value ? colors.primary : colors.border }]}><Icon color={accessType === value ? colors.primary : colors.textMuted} size={20} source={icon} /><Text style={[styles.accessLabel, { color: colors.text }]}>{label}</Text><Icon color={accessType === value ? colors.primary : colors.textMuted} size={18} source={accessType === value ? 'radiobox-marked' : 'radiobox-blank'} /></Pressable>)}
          </ScrollView>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: linkSettingsExpanded }} onPress={() => setLinkSettingsExpanded((current) => !current)} style={[styles.settingsHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.settingsHeaderCopy}><Icon color={colors.primary} size={20} source="tune-variant" /><View style={styles.rowCopy}><Text style={[styles.settingsTitle, { color: colors.text }]}>Link settings</Text><Text numberOfLines={1} style={[styles.rowMeta, { color: colors.textMuted }]}>{formatLinkSettingsSummary(linkPermission, expiresAt, share?.link?.hasPassword || Boolean(password))}</Text></View></View><Icon color={colors.textMuted} size={21} source={linkSettingsExpanded ? 'chevron-up' : 'chevron-down'} /></Pressable>
          {linkSettingsExpanded ? <View style={styles.settingsBody}>
            <Pressable accessibilityLabel="Select expiry date" onPress={() => setShowDatePicker(true)} style={[styles.settingField, { backgroundColor: colors.surface, borderColor: colors.border }]}><Icon color={colors.textMuted} size={19} source="calendar-outline" /><View style={styles.rowCopy}><Text style={[styles.settingLabel, { color: colors.textMuted }]}>Expiration</Text><Text style={[styles.settingValue, { color: expiresAt ? colors.text : colors.textMuted }]}>{expiresAt ? formatDisplayDate(expiresAt) : 'No expiration'}</Text></View>{expiresAt ? <Pressable accessibilityLabel="Clear expiration" hitSlop={8} onPress={(event) => { event.stopPropagation(); setExpiresAt(''); }}><Icon color={colors.textMuted} size={19} source="close-circle" /></Pressable> : <Icon color={colors.textMuted} size={19} source="chevron-right" />}</Pressable>
            {showDatePicker ? <View style={[styles.datePickerWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}><DateTimePicker display={process.env.EXPO_OS === 'ios' ? 'inline' : 'default'} minimumDate={startOfToday()} mode="date" onChange={(_event, date) => { if (process.env.EXPO_OS !== 'ios') setShowDatePicker(false); if (date) setExpiresAt(toDateInput(date)); }} value={parseExpiryDate(expiresAt)} />{process.env.EXPO_OS === 'ios' ? <Pressable onPress={() => setShowDatePicker(false)} style={styles.dateDone}><Text style={[styles.dateDoneText, { color: colors.primary }]}>Done</Text></Pressable> : null}</View> : null}
            <View style={[styles.settingField, { backgroundColor: colors.surface, borderColor: colors.border }]}><Icon color={colors.textMuted} size={19} source="lock-outline" /><TextInput onChangeText={setPassword} placeholder={share?.link?.hasPassword ? 'Replace password' : 'Optional password'} placeholderTextColor={colors.textMuted} secureTextEntry style={[styles.settingInput, { color: colors.text }]} value={password} /></View>
            <View style={styles.permissionRow}>{(['viewer', 'editor', 'admin'] as const).map((value) => <Pressable key={value} onPress={() => setLinkPermission(value)} style={[styles.permission, { backgroundColor: linkPermission === value ? `${colors.primary}13` : colors.background, borderColor: linkPermission === value ? colors.primary : colors.border }]}><Icon color={linkPermission === value ? colors.primary : colors.textMuted} size={16} source={value === 'viewer' ? 'eye-outline' : value === 'editor' ? 'pencil-outline' : 'shield-account-outline'} /><Text style={[styles.permissionLabel, { color: linkPermission === value ? colors.primary : colors.text }]}>{value === 'viewer' ? 'View' : value === 'editor' ? 'Edit' : 'Full'}</Text></Pressable>)}</View>
            <Pressable disabled={isBusy} onPress={() => grantAccess(true)} style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: isBusy ? 0.65 : 1 }]}>{isBusy ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={[styles.primaryLabel, { color: colors.onPrimary }]}>Apply link settings</Text>}</Pressable>
          </View> : null}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>GET LINK</Text>
          <View style={[styles.linkCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.icon, { backgroundColor: `${colors.success}15` }]}><Icon color={colors.success} size={22} source="earth" /></View>
            <View style={styles.rowCopy}><Text style={[styles.rowLabel, { color: colors.text }]}>{accessType === 'public' ? 'Anyone with the link' : accessType === 'existing' ? 'People with existing access' : 'Only people you choose'}</Text><Text style={[styles.rowMeta, { color: colors.textMuted }]}>{linkPermission === 'admin' ? 'Full access' : linkPermission === 'editor' ? 'Can edit' : 'Read only'}</Text></View>
            <Pressable disabled={isBusy} onPress={copyLink} style={[styles.outlineButton, { borderColor: colors.border }]}><Icon color={colors.primary} size={18} source="content-copy" /><Text style={[styles.outlineLabel, { color: colors.primary }]}>Copy</Text></Pressable>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SHARE WITH PEOPLE</Text>
          <SearchField onChangeText={setUserQuery} placeholder="Search name or email" value={userQuery} />
          {selectedUsers.length ? (
            <SelectedPeopleCard
              expanded={showAllSelected}
              onRemove={toggleUser}
              onToggleExpanded={() => setShowAllSelected((current) => !current)}
              users={selectedUsers}
            />
          ) : null}
          {users.filter((user) => !selectedUsers.some((selected) => sameUser(selected, user))).map((user) => <UserRow key={user.id || user.email} onPress={() => toggleUser(user)} user={user} />)}

          {selectedUsers.length ? <View style={[styles.grantArea, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.permissionHeader}><Text style={[styles.permissionTitle, { color: colors.text }]}>Permission</Text><Text style={[styles.selectedCount, { color: colors.textMuted }]}>{selectedUsers.length} selected</Text></View><View style={styles.permissionRow}>{(['viewer', 'editor'] as const).map((value) => <Pressable key={value} onPress={() => setPermission(value)} style={[styles.permission, { backgroundColor: permission === value ? `${colors.primary}13` : colors.background, borderColor: permission === value ? colors.primary : colors.border }]}><Icon color={permission === value ? colors.primary : colors.textMuted} size={17} source={value === 'viewer' ? 'eye-outline' : 'pencil-outline'} /><Text style={[styles.permissionLabel, { color: permission === value ? colors.primary : colors.text }]}>{value === 'viewer' ? 'Can view' : 'Can edit'}</Text></Pressable>)}</View><Pressable disabled={isBusy} onPress={() => grantAccess(false)} style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: isBusy ? 0.65 : 1 }]}>{isBusy ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={[styles.primaryLabel, { color: colors.onPrimary }]}>Share with {selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'}</Text>}</Pressable></View> : null}

          {share?.grants.length ? <><Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PEOPLE WITH ACCESS</Text>{share.grants.map((grant) => <View key={grant.id} style={[styles.userRow, { backgroundColor: colors.surface, borderColor: colors.border }]}><Avatar name={grant.user?.name ?? grant.userName ?? 'User'} /><View style={styles.rowCopy}><Text style={[styles.rowLabel, { color: colors.text }]}>{grant.user?.name ?? grant.userName ?? grant.userId}</Text><Text style={[styles.rowMeta, { color: colors.textMuted }]}>{grant.user?.email ?? grant.userEmail ?? (grant.permission === 'editor' ? 'Can edit' : grant.permission === 'admin' ? 'Full access' : 'Can view')}</Text></View><Pressable accessibilityLabel="Remove access" disabled={isBusy} hitSlop={8} onPress={() => revoke(grant.id)}><Icon color={colors.danger} size={20} source="account-remove-outline" /></Pressable></View>)}</> : null}
        </ScrollView>
      )}
    </BottomSheetShell>
    {previewFile ? <FilePreviewModal file={previewFile} onClose={() => { setPreviewFile(undefined); onClose(); }} /> : null}
    </>
  );
}

export function FilePreviewModal({ file, onClose }: { file: PreparedFile; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const [textContent, setTextContent] = useState<string>();
  const isImage = file.mimeType.startsWith('image/');
  const extension = file.fileName.split('.').at(-1)?.toLocaleLowerCase();
  const isText = file.mimeType.startsWith('text/') || ['css', 'csv', 'html', 'js', 'json', 'log', 'md', 'ts', 'tsx', 'txt', 'xml'].includes(extension ?? '');
  const typeIcon = getPreviewFileIcon(file.mimeType, extension);

  useEffect(() => {
    if (!isText) return;
    let current = true;
    void new File(file.uri).text().then((value) => current && setTextContent(value)).catch(() => current && setTextContent('Unable to read this file.'));
    return () => { current = false; };
  }, [file.uri, isText]);

  const share = async () => {
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { dialogTitle: `Share ${file.fileName}`, mimeType: file.mimeType });
  };

  return <Modal animationType="fade" onRequestClose={onClose} presentationStyle="fullScreen" visible><View style={[styles.previewScreen, { backgroundColor: colors.background, paddingBottom: insets.bottom, paddingTop: insets.top }]}><View style={[styles.previewHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}><Pressable accessibilityLabel="Close preview" hitSlop={10} onPress={onClose} style={styles.previewHeaderButton}><Icon color={colors.text} size={24} source="close" /></Pressable><View style={styles.previewTitleArea}><Icon color={colors.primary} size={20} source={typeIcon} /><Text numberOfLines={1} style={[styles.previewTitle, { color: colors.text }]}>{file.fileName}</Text></View><Pressable accessibilityLabel="Share to another app" hitSlop={10} onPress={share} style={styles.previewHeaderButton}><Icon color={colors.primary} size={23} source="export-variant" /></Pressable></View>{isImage ? <Image accessibilityLabel={file.fileName} contentFit="contain" source={file.uri} style={styles.previewImage} /> : isText ? <ScrollView contentContainerStyle={styles.textPreviewContent} style={styles.textPreview}><Text selectable style={[styles.previewText, { color: colors.text }]}>{textContent ?? 'Loading preview…'}</Text></ScrollView> : <View style={styles.unsupportedPreview}><View style={[styles.previewFileIcon, { backgroundColor: colors.surfaceMuted }]}><Icon color={colors.primary} size={42} source={typeIcon} /></View><Text style={[styles.unsupportedTitle, { color: colors.text }]}>Preview not available for this format</Text><Text style={[styles.unsupportedText, { color: colors.textMuted }]}>Use the share button to open this file in a compatible app installed on your device.</Text><Pressable onPress={share} style={[styles.openExternallyButton, { backgroundColor: colors.primary }]}><Icon color={colors.onPrimary} size={19} source="open-in-new" /><Text style={[styles.openExternallyLabel, { color: colors.onPrimary }]}>Open in another app</Text></Pressable></View>}</View></Modal>;
}

function getPreviewFileIcon(mimeType: string, extension?: string) {
  if (mimeType.includes('pdf') || extension === 'pdf') return 'file-pdf-box';
  if (mimeType.startsWith('image/')) return 'file-image-outline';
  if (mimeType.startsWith('video/')) return 'file-video-outline';
  if (mimeType.startsWith('audio/')) return 'file-music-outline';
  if (mimeType.includes('spreadsheet') || ['csv', 'xls', 'xlsx'].includes(extension ?? '')) return 'file-excel-outline';
  if (mimeType.includes('presentation') || ['ppt', 'pptx'].includes(extension ?? '')) return 'file-powerpoint-outline';
  if (mimeType.includes('word') || ['doc', 'docx'].includes(extension ?? '')) return 'file-word-outline';
  if (mimeType.includes('zip') || ['7z', 'rar', 'tar', 'zip'].includes(extension ?? '')) return 'folder-zip-outline';
  if (mimeType.startsWith('text/') || ['json', 'md', 'txt', 'xml'].includes(extension ?? '')) return 'file-document-outline';
  return 'file-eye-outline';
}

function getLinkUrl(share: ResourceShare) {
  const link = share.link;
  if (!link) return undefined;
  if (link.url) return link.url;
  if (link.shareUrl) {
    try {
      const url = new URL(link.shareUrl);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return `https://drive.vensar.com${url.pathname}${url.search}`;
      return link.shareUrl;
    } catch { return link.shareUrl; }
  }
  const token = link.token ?? link.shareToken;
  return token ? `https://drive.vensar.com/share/${token}` : undefined;
}

function normalizeExpiry(value: string) {
  if (!value.trim()) return null;
  const date = new Date(`${value.trim()}T23:59:59.000Z`);
  return Number.isNaN(date.getTime()) ? value.trim() : date.toISOString();
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseExpiryDate(value: string) {
  if (!value) return startOfToday();
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? startOfToday() : date;
}

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    .format(parseExpiryDate(value));
}

function formatLinkSettingsSummary(permission: SharePermission, expiry: string, hasPassword: boolean) {
  const access = permission === 'admin' ? 'Full access' : permission === 'editor' ? 'Can edit' : 'Read only';
  return [access, expiry ? `Expires ${formatDisplayDate(expiry)}` : 'No expiry', hasPassword ? 'Password set' : undefined]
    .filter(Boolean)
    .join(' · ');
}

function sameUser(first: ShareUser, second: ShareUser) {
  return first.id === second.id || first.email.trim().toLocaleLowerCase() === second.email.trim().toLocaleLowerCase();
}

function dedupeUsers(users: ShareUser[]) {
  return users.filter((user, index) => users.findIndex((candidate) => sameUser(candidate, user)) === index);
}

function SearchField({ onChangeText, placeholder, value }: { onChangeText: (value: string) => void; placeholder: string; value: string }) { const { theme } = useAppTheme(); return <View style={[styles.search, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Icon color={theme.colors.textMuted} size={20} source="magnify" /><TextInput autoCapitalize="none" autoCorrect={false} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={theme.colors.textMuted} style={[styles.input, { color: theme.colors.text }]} value={value} />{value ? <Pressable onPress={() => onChangeText('')}><Icon color={theme.colors.textMuted} size={19} source="close-circle" /></Pressable> : null}</View>; }
function ActionRow({ icon, label, loading, onPress }: { icon: string; label: string; loading?: boolean; onPress: () => void }) { const { theme } = useAppTheme(); return <Pressable disabled={loading} onPress={onPress} style={({ pressed }) => [styles.actionRow, { backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface, borderColor: theme.colors.border }]}><View style={[styles.icon, { backgroundColor: theme.colors.surfaceMuted }]}>{loading ? <ActivityIndicator color={theme.colors.primary} size="small" /> : <Icon color={theme.colors.primary} size={23} source={icon} />}</View><Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text><Icon color={theme.colors.textMuted} size={20} source="chevron-right" /></Pressable>; }
function Avatar({ name }: { name: string }) { const { theme } = useAppTheme(); return <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceMuted }]}><Text style={[styles.avatarText, { color: theme.colors.primary }]}>{name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('')}</Text></View>; }
function UserRow({ onPress, user }: { onPress: () => void; user: ShareUser }) { const { theme } = useAppTheme(); return <Pressable onPress={onPress} style={[styles.userRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Avatar name={user.name} /><View style={styles.rowCopy}><Text style={[styles.rowLabel, { color: theme.colors.text }]}>{user.name}</Text><Text style={[styles.rowMeta, { color: theme.colors.textMuted }]}>{user.email}</Text></View><View style={[styles.addCircle, { borderColor: theme.colors.primary }]}><Icon color={theme.colors.primary} size={19} source="plus" /></View></Pressable>; }

function SelectedPeopleCard({ expanded, onRemove, onToggleExpanded, users }: { expanded: boolean; onRemove: (user: ShareUser) => void; onToggleExpanded: () => void; users: ShareUser[] }) {
  const { theme } = useAppTheme();
  const visibleUsers = expanded ? users : users.slice(0, 2);
  const hiddenCount = users.length - visibleUsers.length;
  return (
    <View style={[styles.selectedCard, { backgroundColor: `${theme.colors.primary}0A`, borderColor: `${theme.colors.primary}2B` }]}>
      <View style={styles.selectedHeader}>
        <Text style={[styles.selectedTitle, { color: theme.colors.text }]}>Selected people</Text>
        <View style={[styles.countBadge, { backgroundColor: `${theme.colors.primary}18` }]}><Text style={[styles.countBadgeText, { color: theme.colors.primary }]}>{users.length}</Text></View>
      </View>
      {visibleUsers.map((user) => (
        <View key={user.id || user.email} style={styles.selectedRow}>
          <Avatar name={user.name} />
          <View style={styles.rowCopy}><Text numberOfLines={1} style={[styles.rowLabel, { color: theme.colors.text }]}>{user.name}</Text><Text numberOfLines={1} style={[styles.rowMeta, { color: theme.colors.textMuted }]}>{user.email}</Text></View>
          <Pressable accessibilityLabel={`Remove ${user.name}`} hitSlop={8} onPress={() => onRemove(user)}><Icon color={theme.colors.textMuted} size={20} source="close-circle-outline" /></Pressable>
        </View>
      ))}
      {users.length > 2 ? <Pressable onPress={onToggleExpanded} style={styles.seeAll}><Text style={[styles.seeAllText, { color: theme.colors.primary }]}>{expanded ? 'Show less' : `See all · +${hiddenCount} more`}</Text><Icon color={theme.colors.primary} size={17} source={expanded ? 'chevron-up' : 'chevron-down'} /></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  previewScreen: { flex: 1 }, previewHeader: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 56, paddingHorizontal: 8 }, previewHeaderButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 }, previewTitleArea: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', minWidth: 0 }, previewTitle: { flexShrink: 1, fontFamily: fontFamilies.semibold, fontSize: 15 }, previewImage: { flex: 1, margin: 12 }, textPreview: { flex: 1 }, textPreviewContent: { padding: 18 }, previewText: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 22 }, unsupportedPreview: { alignItems: 'center', flex: 1, gap: 10, justifyContent: 'center', padding: 28 }, previewFileIcon: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 24, height: 88, justifyContent: 'center', width: 88 }, unsupportedTitle: { fontFamily: fontFamilies.semibold, fontSize: 18, paddingTop: 8, textAlign: 'center' }, unsupportedText: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 20, maxWidth: 320, textAlign: 'center' }, openExternallyButton: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', gap: 8, marginTop: 8, minHeight: 46, paddingHorizontal: 18 }, openExternallyLabel: { fontFamily: fontFamilies.semibold, fontSize: 13 },
  flexBody: { flexShrink: 1 }, actions: { gap: 9, padding: 16 }, permissionNotice: { alignItems: 'flex-start', borderCurve: 'continuous', borderRadius: 17, borderWidth: 1, flexDirection: 'row', gap: 11, padding: 13 }, permissionNoticeIcon: { alignItems: 'center', borderRadius: 13, height: 44, justifyContent: 'center', width: 44 }, permissionNoticeCopy: { flex: 1, gap: 3 }, permissionNoticeTitle: { fontFamily: fontFamilies.semibold, fontSize: 14, lineHeight: 19 }, permissionNoticeText: { fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 18 }, actionRow: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12, minHeight: 66, paddingHorizontal: 13 }, icon: { alignItems: 'center', borderRadius: 12, height: 42, justifyContent: 'center', width: 42 }, rowCopy: { flex: 1, gap: 2 }, rowLabel: { flexShrink: 1, fontFamily: fontFamilies.semibold, fontSize: 14, lineHeight: 19 }, rowMeta: { fontFamily: fontFamilies.regular, fontSize: 11 },
  copySearch: { paddingHorizontal: 16, paddingTop: 14 }, search: { alignItems: 'center', borderRadius: 15, borderWidth: 1, flexDirection: 'row', gap: 9, minHeight: 50, paddingHorizontal: 13 }, input: { flex: 1, fontFamily: fontFamilies.regular, fontSize: 14 }, list: { gap: 8, padding: 16 }, row: { alignItems: 'center', borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 11, minHeight: 64, padding: 10 },
  shareContent: { gap: 10, padding: 16 }, sectionLabel: { fontFamily: fontFamilies.bold, fontSize: 10.5, letterSpacing: 0.85, paddingTop: 5 }, accessChoices: { gap: 8 }, accessChoice: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 48, paddingHorizontal: 12 }, accessLabel: { fontFamily: fontFamilies.semibold, fontSize: 12 }, settingsHeader: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 15, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 58, paddingHorizontal: 12 }, settingsHeaderCopy: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 10 }, settingsTitle: { fontFamily: fontFamilies.semibold, fontSize: 13 }, settingsBody: { gap: 8 }, settingField: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 52, paddingHorizontal: 12 }, settingInput: { flex: 1, fontFamily: fontFamilies.regular, fontSize: 13 }, settingLabel: { fontFamily: fontFamilies.regular, fontSize: 10.5 }, settingValue: { fontFamily: fontFamilies.semibold, fontSize: 13 }, datePickerWrap: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 16, borderWidth: 1, overflow: 'hidden', padding: 8 }, dateDone: { alignItems: 'center', alignSelf: 'stretch', minHeight: 38, justifyContent: 'center' }, dateDoneText: { fontFamily: fontFamilies.bold, fontSize: 13 }, linkCard: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 11, minHeight: 70, padding: 11 }, outlineButton: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 5, minHeight: 38, paddingHorizontal: 11 }, outlineLabel: { fontFamily: fontFamilies.semibold, fontSize: 12 },
  selectedCard: { borderCurve: 'continuous', borderRadius: 17, borderWidth: 1, gap: 3, padding: 11 }, selectedHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 28 }, selectedTitle: { fontFamily: fontFamilies.semibold, fontSize: 13 }, countBadge: { alignItems: 'center', borderRadius: 12, justifyContent: 'center', minHeight: 24, minWidth: 24, paddingHorizontal: 7 }, countBadgeText: { fontFamily: fontFamilies.bold, fontSize: 11, fontVariant: ['tabular-nums'] }, selectedRow: { alignItems: 'center', flexDirection: 'row', gap: 9, minHeight: 54 }, seeAll: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 3, minHeight: 34 }, seeAllText: { fontFamily: fontFamilies.semibold, fontSize: 12 },
  userRow: { alignItems: 'center', borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 10, minHeight: 64, padding: 10 }, avatar: { alignItems: 'center', borderRadius: 21, height: 42, justifyContent: 'center', width: 42 }, avatarText: { fontFamily: fontFamilies.bold, fontSize: 12, textTransform: 'uppercase' }, addCircle: { alignItems: 'center', borderRadius: 17, borderWidth: 1, height: 34, justifyContent: 'center', width: 34 },
  grantArea: { borderCurve: 'continuous', borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, gap: 10, padding: 11 }, permissionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, permissionTitle: { fontFamily: fontFamilies.semibold, fontSize: 13 }, selectedCount: { fontFamily: fontFamilies.regular, fontSize: 11, fontVariant: ['tabular-nums'] }, permissionRow: { flexDirection: 'row', gap: 8 }, permission: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', minHeight: 40 }, permissionLabel: { fontFamily: fontFamilies.semibold, fontSize: 12 }, primaryButton: { alignItems: 'center', borderRadius: 13, justifyContent: 'center', minHeight: 46 }, primaryLabel: { fontFamily: fontFamilies.bold, fontSize: 13 },
});
