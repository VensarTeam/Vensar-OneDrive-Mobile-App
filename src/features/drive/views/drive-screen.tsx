import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsiveLayout } from '../../../core/responsive';
import { useAppTheme } from '../../../core/theme';
import { fontFamilies } from '../../../core/theme/typography';
import type { HomeTabParamList } from '../../../navigation/HomeTabs';
import type { DriveFile, DriveFolder, DriveProject } from '../models/drive-models';
import { useDriveBrowserViewModel } from '../viewmodels/use-drive-browser-view-model';
import type { SelectedResource } from './resource-action-modal';
import { ResourceActionModal } from './resource-action-modal';

type Props = BottomTabScreenProps<HomeTabParamList, 'Files'>;

export function DriveScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveLayout();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const serviceId = route.params?.serviceId;
  const vm = useDriveBrowserViewModel({
    initialFolderId: route.params?.folderId,
    initialFolderName: route.params?.folderName,
    initialProjectId: route.params?.projectId,
    serviceId,
  });
  const [selectedResource, setSelectedResource] = useState<SelectedResource>();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingHorizontal: responsive.horizontalPadding, paddingTop: insets.top + 16 },
      ]}
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={[styles.content, { maxWidth: responsive.maxContentWidth }]}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Files</Text>
            <Text numberOfLines={1} selectable style={[styles.subtitle, { color: colors.textMuted }]}>
              {vm.selectedProject?.shortName ?? route.params?.serviceName ?? 'Choose a service from Home'}
            </Text>
          </View>
          {serviceId ? <Pressable accessibilityLabel="Refresh" hitSlop={10} onPress={vm.refresh}><Icon color={colors.primary} size={24} source="refresh" /></Pressable> : null}
        </View>

        {vm.selectedProject ? (
          <View style={styles.pathBar}>
            <Pressable accessibilityLabel="Back" onPress={vm.goBack} style={[styles.backButton, { backgroundColor: colors.surface }]}><Icon color={colors.text} size={22} source="chevron-left" /></Pressable>
            <View style={styles.pathCopy}><Text numberOfLines={1} style={[styles.pathTitle, { color: colors.text }]}>{vm.breadcrumbs.at(-1)?.name ?? vm.selectedProject.shortName}</Text><Text style={[styles.pathMeta, { color: colors.textMuted }]}>{vm.breadcrumbs.length ? `${vm.breadcrumbs.length} folders deep` : 'Project files'}</Text></View>
          </View>
        ) : null}

        {vm.isLoading ? (
          <View style={styles.state}><ActivityIndicator color={colors.primary} /><Text style={[styles.stateText, { color: colors.textMuted }]}>Loading files…</Text></View>
        ) : vm.error ? (
          <State icon="cloud-alert-outline" message={vm.error} title="Couldn’t load files" />
        ) : !serviceId ? (
          <State icon="apps" message="Open Home and select a service to browse its projects and folders." title="Select a service" />
        ) : !vm.selectedProject ? (
          <ProjectList onSelect={vm.selectProject} projects={vm.projects} />
        ) : vm.listing && vm.listing.folders.length + vm.listing.files.length > 0 ? (
          <View style={styles.items}>
            {vm.listing.folders.map((folder) => <FolderRow folder={folder} key={folder.id} onActions={() => setSelectedResource({ item: folder, type: 'folder' })} onOpen={() => vm.openFolder(folder)} />)}
            {vm.listing.files.map((file) => <FileRow file={file} key={file.id} onActions={() => setSelectedResource({ item: file, type: 'file' })} />)}
          </View>
        ) : (
          <State icon="folder-open-outline" message="This folder doesn’t contain any folders or files yet." title="Folder is empty" />
        )}
      </View>

      {selectedResource && vm.selectedProject ? (
        <ResourceActionModal onClose={() => setSelectedResource(undefined)} onCopied={vm.refresh} projectId={vm.selectedProject.projectId} resource={selectedResource} serviceId={vm.selectedProject.serviceId} />
      ) : null}
    </ScrollView>
  );
}

function ProjectList({ onSelect, projects }: { onSelect: (project: DriveProject) => void; projects: DriveProject[] }) {
  const { theme } = useAppTheme();
  return <View style={styles.projectArea}><Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>PROJECTS</Text>{projects.length ? projects.map((project) => <Pressable key={project.id} onPress={() => onSelect(project)} style={({ pressed }) => [styles.projectCard, { backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface, borderColor: theme.colors.border }]}><View style={[styles.projectIcon, { backgroundColor: `${theme.colors.primary}14` }]}><Icon color={theme.colors.primary} size={25} source="folder-star-outline" /></View><View style={styles.projectCopy}><Text numberOfLines={2} style={[styles.projectName, { color: theme.colors.text }]}>{project.shortName}</Text><Text numberOfLines={2} style={[styles.projectTitle, { color: theme.colors.textMuted }]}>{project.title}</Text></View><Icon color={theme.colors.textMuted} size={21} source="chevron-right" /></Pressable>) : <State icon="folder-search-outline" message="No projects are available for this service." title="No projects" />}</View>;
}

function FolderRow({ folder, onActions, onOpen }: { folder: DriveFolder; onActions: () => void; onOpen: () => void }) {
  const { theme } = useAppTheme();
  return <View style={[styles.itemRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Pressable accessibilityRole="button" onPress={onOpen} style={styles.itemMain}><View style={[styles.itemIcon, { backgroundColor: `${folder.color || theme.colors.primary}18` }]}><Icon color={folder.color || theme.colors.primary} size={26} source="folder" /></View><View style={styles.itemCopy}><Text numberOfLines={2} style={[styles.itemName, { color: theme.colors.text }]}>{folder.name}</Text><Text style={[styles.itemMeta, { color: theme.colors.textMuted }]}>{folder.childrenCount != null ? `${folder.childrenCount} items` : 'Folder'}</Text></View></Pressable><Pressable accessibilityLabel={`Actions for ${folder.name}`} hitSlop={8} onPress={onActions} style={styles.more}><Icon color={theme.colors.textMuted} size={22} source="dots-horizontal" /></Pressable></View>;
}

function FileRow({ file, onActions }: { file: DriveFile; onActions: () => void }) {
  const { theme } = useAppTheme();
  const size = file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`;
  const icon = file.mimeType.startsWith('image/') ? 'file-image-outline' : file.mimeType.includes('pdf') ? 'file-pdf-box' : 'file-document-outline';
  return <View style={[styles.itemRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><View style={styles.itemMain}><View style={[styles.itemIcon, { backgroundColor: theme.colors.surfaceMuted }]}><Icon color={theme.colors.primary} size={25} source={icon} /></View><View style={styles.itemCopy}><Text numberOfLines={2} style={[styles.itemName, { color: theme.colors.text }]}>{file.name}</Text><Text style={[styles.itemMeta, { color: theme.colors.textMuted }]}>{size}</Text></View></View><Pressable accessibilityLabel={`Actions for ${file.name}`} hitSlop={8} onPress={onActions} style={styles.more}><Icon color={theme.colors.textMuted} size={22} source="dots-horizontal" /></Pressable></View>;
}

function State({ icon, message, title }: { icon: string; message: string; title: string }) {
  const { theme } = useAppTheme();
  return <View style={styles.state}><View style={[styles.stateIcon, { backgroundColor: theme.colors.surfaceMuted }]}><Icon color={theme.colors.primary} size={30} source={icon} /></View><Text style={[styles.stateTitle, { color: theme.colors.text }]}>{title}</Text><Text selectable style={[styles.stateText, { color: theme.colors.textMuted }]}>{message}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scrollContent: { alignItems: 'center', paddingBottom: 32 }, content: { width: '100%' }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, headerCopy: { flex: 1, gap: 2 }, title: { fontFamily: fontFamilies.bold, fontSize: 28, letterSpacing: -0.6 }, subtitle: { fontFamily: fontFamilies.regular, fontSize: 13 },
  pathBar: { alignItems: 'center', flexDirection: 'row', gap: 11, paddingTop: 20 }, backButton: { alignItems: 'center', borderRadius: 14, height: 44, justifyContent: 'center', width: 44 }, pathCopy: { flex: 1 }, pathTitle: { fontFamily: fontFamilies.semibold, fontSize: 15 }, pathMeta: { fontFamily: fontFamilies.regular, fontSize: 11, paddingTop: 2 },
  projectArea: { gap: 9, paddingTop: 27 }, sectionLabel: { fontFamily: fontFamilies.semibold, fontSize: 11, letterSpacing: 0.8 }, projectCard: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12, minHeight: 88, padding: 13 }, projectIcon: { alignItems: 'center', borderRadius: 14, height: 50, justifyContent: 'center', width: 50 }, projectCopy: { flex: 1, gap: 3 }, projectName: { fontFamily: fontFamilies.semibold, fontSize: 15, lineHeight: 20 }, projectTitle: { fontFamily: fontFamilies.regular, fontSize: 11, lineHeight: 16 },
  items: { gap: 8, paddingTop: 22 }, itemRow: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 74, paddingLeft: 11 }, itemMain: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12, minHeight: 72 }, itemIcon: { alignItems: 'center', borderRadius: 13, height: 48, justifyContent: 'center', width: 48 }, itemCopy: { flex: 1, gap: 3 }, itemName: { fontFamily: fontFamilies.semibold, fontSize: 14, lineHeight: 19 }, itemMeta: { fontFamily: fontFamilies.regular, fontSize: 11 }, more: { alignItems: 'center', height: 54, justifyContent: 'center', width: 48 },
  state: { alignItems: 'center', gap: 8, justifyContent: 'center', minHeight: 300, paddingHorizontal: 24 }, stateIcon: { alignItems: 'center', borderRadius: 20, height: 68, justifyContent: 'center', width: 68 }, stateTitle: { fontFamily: fontFamilies.semibold, fontSize: 17, paddingTop: 5 }, stateText: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 19, maxWidth: 310, textAlign: 'center' },
});
