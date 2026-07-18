import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { interpolate, type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { useResponsiveLayout } from '../../../core/responsive';
import { useAppTheme } from '../../../core/theme';
import { fontFamilies } from '../../../core/theme/typography';
import type { HomeTabParamList } from '../../../navigation/HomeTabs';
import type { DriveFile, DriveFolder, DriveProject } from '../models/drive-models';
import { useDriveBrowserViewModel } from '../viewmodels/use-drive-browser-view-model';
import type { SelectedResource } from './resource-action-modal';
import { ResourceActionModal } from './resource-action-modal';

type Props = BottomTabScreenProps<HomeTabParamList, 'Files'>;
type ViewMode = 'grid' | 'list';

export function DriveScreen({ route }: Props) {
  const responsive = useResponsiveLayout();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const serviceId = route.params?.serviceId;
  const accessMode = route.params?.permission ?? 'owner';
  const isReadOnly = accessMode === 'viewer';
  const vm = useDriveBrowserViewModel({ initialFolderId: route.params?.folderId, initialFolderName: route.params?.folderName, initialProjectId: route.params?.projectId, serviceId });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [actionResources, setActionResources] = useState<SelectedResource[]>();
  const [initialMode, setInitialMode] = useState<'actions' | 'copy' | 'move' | 'share'>('actions');
  const openSwipeable = useRef<SwipeableMethods | null>(null);
  const permissionNoticeContext = useRef<string | null>(null);
  const folderId = route.params?.folderId;
  const projectId = route.params?.projectId;
  const resources = useMemo<SelectedResource[]>(() => vm.listing ? [
    ...vm.listing.folders.map((item) => ({ item, type: 'folder' as const })),
    ...vm.listing.files.map((item) => ({ item, type: 'file' as const })),
  ] : [], [vm.listing]);
  const visibleResources = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return query ? resources.filter(({ item }) => item.name.toLocaleLowerCase().includes(query)) : resources;
  }, [resources, searchQuery]);
  const selectedResources = resources.filter(({ item }) => selectedIds.has(item.id));

  useEffect(() => {
    openSwipeable.current?.close();
    openSwipeable.current = null;
    setSelectedIds(new Set());
    setActionResources(undefined);
    setSearchQuery('');
    setViewMode('list');
  }, [folderId, projectId, serviceId]);

  useEffect(() => {
    if (!isReadOnly || !serviceId || !projectId) return;
    const context = `${serviceId}:${projectId}:${folderId ?? 'root'}`;
    if (permissionNoticeContext.current === context) return;
    permissionNoticeContext.current = context;
    Alert.alert(
      'View-only access',
      'This item was shared with view-only permission. You can browse folders and download files, but Copy, Move, Share, and access-management actions are unavailable.',
      [{ text: 'Got it' }],
    );
  }, [folderId, isReadOnly, projectId, serviceId]);

  const toggleSelection = (resource: SelectedResource) => setSelectedIds((current) => {
    const next = new Set(current);
    if (next.has(resource.item.id)) next.delete(resource.item.id); else next.add(resource.item.id);
    return next;
  });
  const clearSelection = () => setSelectedIds(new Set());
  const openTransfer = (mode: 'copy' | 'move') => { setInitialMode(mode); setActionResources(selectedResources); };
  const allVisibleSelected = visibleResources.length > 0 && visibleResources.every(({ item }) => selectedIds.has(item.id));
  const toggleSelectAll = () => setSelectedIds((current) => {
    const next = new Set(current);
    if (allVisibleSelected) visibleResources.forEach(({ item }) => next.delete(item.id));
    else visibleResources.forEach(({ item }) => next.add(item.id));
    return next;
  });

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { paddingHorizontal: responsive.horizontalPadding, paddingTop: responsive.isCompact ? 8 : 16 }]}
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={[styles.content, { maxWidth: responsive.maxContentWidth }]}>
        <View style={styles.header}><View style={styles.headerCopy}><Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Files</Text><Text numberOfLines={1} selectable style={[styles.subtitle, { color: colors.textMuted }]}>{vm.selectedProject?.shortName ?? route.params?.serviceName ?? 'Choose a service from Home'}</Text></View>{serviceId ? <Pressable accessibilityLabel="Refresh" hitSlop={10} onPress={vm.refresh}><Icon color={colors.primary} size={24} source="refresh" /></Pressable> : null}</View>

        {vm.selectedProject ? <View style={styles.pathBar}><Pressable accessibilityLabel="Back" onPress={() => { clearSelection(); void vm.goBack(); }} style={[styles.backButton, { backgroundColor: colors.surface }]}><Icon color={colors.text} size={22} source="chevron-left" /></Pressable><View style={styles.pathCopy}><Text numberOfLines={1} style={[styles.pathTitle, { color: colors.text }]}>{vm.breadcrumbs.at(-1)?.name ?? vm.selectedProject.shortName}</Text><Text style={[styles.pathMeta, { color: colors.textMuted }]}>{vm.breadcrumbs.length ? `${vm.breadcrumbs.length} folders deep` : 'Project files'}</Text></View></View> : null}
        {vm.selectedProject ? <View style={styles.explorerTools}><View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><Icon color={colors.textMuted} size={20} source="magnify" /><TextInput accessibilityLabel="Search in folder" autoCapitalize="none" autoCorrect={false} onChangeText={setSearchQuery} placeholder="Search in folder…" placeholderTextColor={colors.textMuted} style={[styles.searchInput, { color: colors.text }]} value={searchQuery} />{searchQuery ? <Pressable accessibilityLabel="Clear search" hitSlop={8} onPress={() => setSearchQuery('')}><Icon color={colors.textMuted} size={19} source="close-circle" /></Pressable> : null}</View></View> : null}
        {vm.selectedProject && resources.length ? <View style={[styles.displayBar, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.displayLeft}>{isReadOnly ? <View accessibilityLabel="View-only shared access" style={[styles.permissionBadge, { backgroundColor: colors.surfaceMuted }]}><Icon color={colors.primary} size={18} source="shield-lock-outline" /><Text style={[styles.permissionBadgeText, { color: colors.primary }]}>View only</Text></View> : <Pressable accessibilityLabel={allVisibleSelected ? 'Clear visible selection' : 'Select all visible items'} accessibilityRole="checkbox" accessibilityState={{ checked: allVisibleSelected }} onPress={toggleSelectAll} style={styles.selectAll}><Icon color={allVisibleSelected ? colors.primary : colors.textMuted} size={21} source={allVisibleSelected ? 'checkbox-marked' : 'checkbox-blank-outline'} /><Text style={[styles.selectAllText, { color: colors.text }]}>{allVisibleSelected ? 'Clear' : 'Select all'}</Text></Pressable>}<Text numberOfLines={1} style={[styles.itemCount, { color: colors.textMuted }]}>{visibleResources.length} {visibleResources.length === 1 ? 'item' : 'items'}</Text></View><View accessibilityRole="tablist" style={[styles.viewSwitch, { backgroundColor: colors.background }]}>{(['list', 'grid'] as const).map((mode) => <Pressable accessibilityLabel={`${mode} view`} accessibilityRole="tab" accessibilityState={{ selected: viewMode === mode }} key={mode} onPress={() => setViewMode(mode)} style={[styles.viewButton, { backgroundColor: viewMode === mode ? colors.surfaceMuted : 'transparent' }]}><Icon color={viewMode === mode ? colors.primary : colors.textMuted} size={20} source={mode === 'list' ? 'view-list-outline' : 'view-grid-outline'} /></Pressable>)}</View></View> : null}
        {selectedResources.length ? <View style={[styles.selectionBar, { backgroundColor: colors.surface, borderColor: colors.border }]}><Pressable accessibilityLabel="Clear selection" onPress={clearSelection} style={styles.selectionCount}><Icon color={colors.primary} size={19} source="close" /><Text style={[styles.selectionText, { color: colors.text }]}>{selectedResources.length} selected</Text></Pressable><View style={styles.selectionActions}>{!isReadOnly ? <><ToolbarAction icon="content-copy" label="Copy" onPress={() => openTransfer('copy')} /><ToolbarAction icon="folder-move-outline" label="Move" onPress={() => openTransfer('move')} /></> : null}{selectedResources.length === 1 ? <ToolbarAction icon="dots-horizontal" label="More" onPress={() => { setInitialMode('actions'); setActionResources(selectedResources); }} /> : null}</View></View> : null}

        {vm.isLoading ? <State loading message="Loading files…" /> : vm.error ? <State icon="cloud-alert-outline" message={vm.error} title="Couldn’t load files" /> : !serviceId ? <State icon="apps" message="Open Home and select a service to browse its projects and folders." title="Select a service" /> : !vm.selectedProject ? <ProjectList onSelect={vm.selectProject} projects={vm.projects} /> : vm.listing && visibleResources.length > 0 ? <View style={[styles.items, viewMode === 'grid' && styles.gridItems]}>{visibleResources.map((resource) => <ResourceRow isReadOnly={isReadOnly} key={`${accessMode}-${viewMode}-${resource.type}-${resource.item.id}`} onCopy={() => { setInitialMode('copy'); setActionResources([resource]); }} onLongPress={() => toggleSelection(resource)} onMore={() => { setInitialMode('actions'); setActionResources([resource]); }} onMove={() => { setInitialMode('move'); setActionResources([resource]); }} onPress={() => { if (selectedIds.size) { toggleSelection(resource); return; } if (resource.type === 'folder') { void vm.openFolder(resource.item as DriveFolder); return; } if (isReadOnly) { setInitialMode('actions'); setActionResources([resource]); return; } toggleSelection(resource); }} onSelect={() => toggleSelection(resource)} onSwipeOpen={(methods) => { if (openSwipeable.current !== methods) openSwipeable.current?.close(); openSwipeable.current = methods; }} resource={resource} selected={selectedIds.has(resource.item.id)} viewMode={viewMode} />)}</View> : <State icon={searchQuery ? 'file-search-outline' : 'folder-open-outline'} message={searchQuery ? `No items in this folder match “${searchQuery.trim()}”.` : 'This folder doesn’t contain any folders or files yet.'} title={searchQuery ? 'No results' : 'Folder is empty'} />}
      </View>

      {actionResources?.length && vm.selectedProject ? <ResourceActionModal accessMode={accessMode} initialMode={initialMode} onClose={() => setActionResources(undefined)} onCompleted={() => { clearSelection(); void vm.refresh(); }} projectId={vm.selectedProject.projectId} resources={actionResources} serviceId={vm.selectedProject.serviceId} /> : null}
    </ScrollView>
  );
}

function ProjectList({ onSelect, projects }: { onSelect: (project: DriveProject) => void; projects: DriveProject[] }) { const { theme } = useAppTheme(); return <View style={styles.projectArea}><Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>PROJECTS</Text>{projects.length ? projects.map((project) => <Pressable key={project.id} onPress={() => onSelect(project)} style={({ pressed }) => [styles.projectCard, { backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface, borderColor: theme.colors.border }]}><View style={[styles.itemIcon, { backgroundColor: `${theme.colors.primary}14` }]}><Icon color={theme.colors.primary} size={25} source="folder-star-outline" /></View><View style={styles.itemCopy}><Text numberOfLines={2} style={[styles.itemName, { color: theme.colors.text }]}>{project.shortName}</Text><Text numberOfLines={2} style={[styles.itemMeta, { color: theme.colors.textMuted }]}>{project.title}</Text></View><Icon color={theme.colors.textMuted} size={21} source="chevron-right" /></Pressable>) : <State icon="folder-search-outline" message="No projects are available for this service." title="No projects" />}</View>; }

function ResourceRow({ isReadOnly, onCopy, onLongPress, onMore, onMove, onPress, onSelect, onSwipeOpen, resource, selected, viewMode }: { isReadOnly: boolean; onCopy: () => void; onLongPress: () => void; onMore: () => void; onMove: () => void; onPress: () => void; onSelect: () => void; onSwipeOpen: (methods: SwipeableMethods) => void; resource: SelectedResource; selected: boolean; viewMode: ViewMode }) {
  const { theme } = useAppTheme(); const { colors } = theme; const isFolder = resource.type === 'folder'; const item = resource.item; const file = !isFolder ? item as DriveFile : undefined; const meta = isFolder ? `${(item as DriveFolder).childrenCount ?? '—'} items` : formatSize(file!.size); const visual = isFolder ? { color: (item as DriveFolder).color || '#F5B700', icon: 'folder' } : getFileVisual(file!); const isGrid = viewMode === 'grid';
  const swipeableRef = useRef<SwipeableMethods>(null);
  const row = <View style={[styles.itemRow, isGrid && styles.gridCard, { backgroundColor: selected ? `${colors.primary}12` : colors.surface, borderColor: selected ? colors.primary : colors.border }]}>{!isReadOnly ? <Pressable accessibilityLabel={selected ? `Deselect ${item.name}` : `Select ${item.name}`} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} hitSlop={8} onPress={onSelect} style={[styles.checkbox, isGrid && styles.gridCheckbox]}><Icon color={selected ? colors.primary : colors.textMuted} size={23} source={selected ? 'checkbox-marked' : 'checkbox-blank-outline'} /></Pressable> : null}<Pressable accessibilityRole="button" onLongPress={isReadOnly ? undefined : onLongPress} onPress={onPress} style={[styles.itemMain, isReadOnly && styles.readOnlyItemMain, isGrid && styles.gridMain]}><View style={[styles.itemIcon, isGrid && styles.gridIcon, { backgroundColor: `${visual.color}18` }]}><Icon color={visual.color} size={isGrid ? 38 : 25} source={visual.icon} /></View><View style={[styles.itemCopy, isGrid && styles.gridCopy]}><Text numberOfLines={2} style={[styles.itemName, isGrid && styles.gridName, { color: colors.text }]}>{item.name}</Text><Text numberOfLines={1} style={[styles.itemMeta, { color: colors.textMuted }]}>{meta}</Text></View></Pressable>{isGrid ? <Pressable accessibilityLabel={`More actions for ${item.name}`} hitSlop={8} onPress={onMore} style={[styles.more, styles.gridMore]}><Icon color={colors.textMuted} size={22} source="dots-horizontal" /></Pressable> : null}</View>;
  if (isGrid) return row;
  return <ReanimatedSwipeable containerStyle={[styles.swipeContainer, { backgroundColor: colors.surface }]} dragOffsetFromRightEdge={12} enableTrackpadTwoFingerGesture enabled={!selected} friction={1.25} onSwipeableWillOpen={() => { if (swipeableRef.current) onSwipeOpen(swipeableRef.current); }} overshootFriction={8} overshootRight={false} ref={swipeableRef} renderRightActions={(progress, _translation, methods) => <SwipeActions isReadOnly={isReadOnly} methods={methods} onCopy={onCopy} onMore={onMore} onMove={onMove} progress={progress} />} rightThreshold={54}>{row}</ReanimatedSwipeable>;
}

function SwipeActions({ isReadOnly, methods, onCopy, onMore, onMove, progress }: { isReadOnly: boolean; methods: SwipeableMethods; onCopy: () => void; onMore: () => void; onMove: () => void; progress: SharedValue<number> }) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const animatedStyle = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, 0.45, 1], [0.18, 0.82, 1], 'clamp'), transform: [{ scale: interpolate(progress.value, [0, 1], [0.96, 1], 'clamp') }] }));
  const run = (action: () => void) => { methods.close(); action(); };
  return <Animated.View style={[styles.swipeActions, { backgroundColor: colors.surface }, animatedStyle]}>{!isReadOnly ? <><SwipeAction icon="content-copy" label="Copy" onPress={() => run(onCopy)} tone={colors.primary} /><SwipeAction divider icon="folder-move-outline" label="Move" onPress={() => run(onMove)} tone={colors.accent} /></> : null}<SwipeAction divider={!isReadOnly} icon="dots-horizontal" label="More" onPress={() => run(onMore)} tone={colors.textMuted} /></Animated.View>;
}

function SwipeAction({ divider = false, icon, label, onPress, tone }: { divider?: boolean; icon: string; label: string; onPress: () => void; tone: string }) {
  const { theme } = useAppTheme();
  return <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.swipeAction, divider && styles.swipeDivider, { backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent', borderLeftColor: theme.colors.border }]}><Icon color={tone} size={21} source={icon} /><Text style={[styles.swipeLabel, { color: tone }]}>{label}</Text></Pressable>;
}

function ToolbarAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) { const { theme } = useAppTheme(); return <Pressable accessibilityLabel={label} onPress={onPress} style={styles.toolbarAction}><Icon color={theme.colors.primary} size={20} source={icon} /><Text style={[styles.toolbarLabel, { color: theme.colors.primary }]}>{label}</Text></Pressable>; }
function State({ icon, loading, message, title }: { icon?: string; loading?: boolean; message: string; title?: string }) { const { theme } = useAppTheme(); return <View style={styles.state}>{loading ? <ActivityIndicator color={theme.colors.primary} /> : icon ? <View style={[styles.stateIcon, { backgroundColor: theme.colors.surfaceMuted }]}><Icon color={theme.colors.primary} size={30} source={icon} /></View> : null}{title ? <Text style={[styles.stateTitle, { color: theme.colors.text }]}>{title}</Text> : null}<Text selectable style={[styles.stateText, { color: theme.colors.textMuted }]}>{message}</Text></View>; }
function formatSize(size: number) { return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`; }
function getFileVisual(file: DriveFile) {
  const mime = file.mimeType.toLocaleLowerCase();
  const extension = file.name.split('.').at(-1)?.toLocaleLowerCase() ?? '';
  if (mime.includes('pdf') || extension === 'pdf') return { color: '#E5484D', icon: 'file-pdf-box' };
  if (mime.startsWith('image/')) return { color: '#8E5CD9', icon: 'file-image' };
  if (mime.startsWith('video/')) return { color: '#D6409F', icon: 'file-video' };
  if (mime.startsWith('audio/')) return { color: '#7C66DC', icon: 'file-music' };
  if (mime.includes('spreadsheet') || mime.includes('excel') || ['csv', 'xls', 'xlsx'].includes(extension)) return { color: '#2E8B57', icon: 'file-excel' };
  if (mime.includes('presentation') || mime.includes('powerpoint') || ['ppt', 'pptx'].includes(extension)) return { color: '#D65A31', icon: 'file-powerpoint' };
  if (mime.includes('word') || ['doc', 'docx'].includes(extension)) return { color: '#2B6CB0', icon: 'file-word-box' };
  if (mime.includes('zip') || mime.includes('compressed') || ['7z', 'rar', 'tar', 'zip'].includes(extension)) return { color: '#B7791F', icon: 'folder-zip' };
  if (mime.includes('json') || mime.includes('javascript') || mime.includes('xml') || ['css', 'html', 'js', 'json', 'ts', 'tsx', 'xml'].includes(extension)) return { color: '#008F8C', icon: 'file-code' };
  if (mime.startsWith('text/')) return { color: '#5C7080', icon: 'file-document-edit-outline' };
  return { color: '#4C7BD9', icon: 'file-document-outline' };
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scrollContent: { alignItems: 'center', paddingBottom: 32 }, content: { width: '100%' }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, headerCopy: { flex: 1, gap: 2 }, title: { fontFamily: fontFamilies.bold, fontSize: 28, letterSpacing: -0.6 }, subtitle: { fontFamily: fontFamilies.regular, fontSize: 13 },
  pathBar: { alignItems: 'center', flexDirection: 'row', gap: 11, paddingTop: 20 }, backButton: { alignItems: 'center', borderRadius: 14, height: 44, justifyContent: 'center', width: 44 }, pathCopy: { flex: 1 }, pathTitle: { fontFamily: fontFamilies.semibold, fontSize: 15 }, pathMeta: { fontFamily: fontFamilies.regular, fontSize: 11, paddingTop: 2 },
  explorerTools: { paddingTop: 14 }, search: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 50, paddingHorizontal: 13, width: '100%' }, searchInput: { flex: 1, fontFamily: fontFamilies.regular, fontSize: 14 }, selectAll: { alignItems: 'center', flexDirection: 'row', gap: 6, minHeight: 40, paddingHorizontal: 4 }, selectAllText: { fontFamily: fontFamilies.semibold, fontSize: 12 }, permissionBadge: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 11, flexDirection: 'row', gap: 5, minHeight: 36, paddingHorizontal: 9 }, permissionBadgeText: { fontFamily: fontFamilies.semibold, fontSize: 11.5 },
  displayBar: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 8, justifyContent: 'space-between', marginTop: 10, minHeight: 50, paddingHorizontal: 7, paddingVertical: 5 }, displayLeft: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 8, minWidth: 0 }, itemCount: { flexShrink: 1, fontFamily: fontFamilies.regular, fontSize: 11, fontVariant: ['tabular-nums'] }, viewSwitch: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 11, flexDirection: 'row', gap: 2, padding: 2 }, viewButton: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 9, height: 34, justifyContent: 'center', width: 38 },
  selectionBar: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, minHeight: 58, paddingHorizontal: 8 }, selectionCount: { alignItems: 'center', flexDirection: 'row', gap: 5, minHeight: 44, paddingHorizontal: 5 }, selectionText: { fontFamily: fontFamilies.semibold, fontSize: 13, fontVariant: ['tabular-nums'] }, selectionActions: { alignItems: 'center', flexDirection: 'row' }, toolbarAction: { alignItems: 'center', gap: 2, justifyContent: 'center', minHeight: 48, minWidth: 54, paddingHorizontal: 5 }, toolbarLabel: { fontFamily: fontFamilies.semibold, fontSize: 9.5 },
  projectArea: { gap: 9, paddingTop: 27 }, sectionLabel: { fontFamily: fontFamilies.semibold, fontSize: 11, letterSpacing: 0.8 }, projectCard: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12, minHeight: 88, padding: 13 }, items: { gap: 8, paddingTop: 14 }, gridItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, swipeContainer: { borderCurve: 'continuous', borderRadius: 17, overflow: 'hidden' }, swipeActions: { flexDirection: 'row', height: '100%', marginLeft: -1, overflow: 'hidden', transformOrigin: 'left center' }, swipeAction: { alignItems: 'center', gap: 3, justifyContent: 'center', minWidth: 68, paddingHorizontal: 7 }, swipeDivider: { borderLeftWidth: StyleSheet.hairlineWidth }, swipeLabel: { fontFamily: fontFamilies.semibold, fontSize: 10.5 }, itemRow: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 74, paddingLeft: 7 }, gridCard: { alignItems: 'stretch', minHeight: 178, paddingLeft: 0, position: 'relative', width: '48.5%' }, checkbox: { alignItems: 'center', height: 48, justifyContent: 'center', width: 38 }, gridCheckbox: { left: 5, position: 'absolute', top: 4, zIndex: 2 }, itemMain: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12, minHeight: 72 }, readOnlyItemMain: { paddingLeft: 13 }, gridMain: { flexDirection: 'column', gap: 9, justifyContent: 'center', paddingHorizontal: 12, paddingTop: 17 }, itemIcon: { alignItems: 'center', borderRadius: 13, height: 48, justifyContent: 'center', width: 48 }, gridIcon: { borderRadius: 18, height: 76, width: 76 }, itemCopy: { flex: 1, gap: 3 }, gridCopy: { alignItems: 'center', flex: 0 }, itemName: { fontFamily: fontFamilies.semibold, fontSize: 14, lineHeight: 19 }, gridName: { fontSize: 13, lineHeight: 17, textAlign: 'center' }, itemMeta: { fontFamily: fontFamilies.regular, fontSize: 11, lineHeight: 16 }, more: { alignItems: 'center', height: 54, justifyContent: 'center', width: 48 }, gridMore: { position: 'absolute', right: 0, top: 1 },
  state: { alignItems: 'center', gap: 8, justifyContent: 'center', minHeight: 300, paddingHorizontal: 24 }, stateIcon: { alignItems: 'center', borderRadius: 20, height: 68, justifyContent: 'center', width: 68 }, stateTitle: { fontFamily: fontFamilies.semibold, fontSize: 17, paddingTop: 5 }, stateText: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 19, maxWidth: 310, textAlign: 'center' },
});
