import { useCallback, useEffect, useState } from 'react';

import { useToast } from '../../../shared/toast/toast-provider';
import type { DocumentListing, DriveFolder, DriveProject } from '../models/drive-models';
import { getDocuments, getProjects } from '../repositories/drive-repository';

export type FolderCrumb = Pick<DriveFolder, 'id' | 'name'>;

export function useDriveBrowserViewModel({
  initialFolderId,
  initialFolderName,
  initialProjectId,
  serviceId,
}: {
  initialFolderId?: string;
  initialFolderName?: string;
  initialProjectId?: string;
  serviceId?: string;
}) {
  const [projects, setProjects] = useState<DriveProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<DriveProject>();
  const [listing, setListing] = useState<DocumentListing>();
  const [breadcrumbs, setBreadcrumbs] = useState<FolderCrumb[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const { showToast } = useToast();

  const reportError = useCallback((caughtError: unknown) => {
    const message = caughtError instanceof Error ? caughtError.message : 'Unable to load drive content.';
    setError(message);
    showToast({ message, title: 'Drive unavailable', tone: 'error' });
  }, [showToast]);

  const loadProjects = useCallback(async () => {
    if (!serviceId) return;
    setLoading(true);
    setError(undefined);
    try {
      const nextProjects = await getProjects(serviceId);
      setProjects(nextProjects);
      const initialProject = initialProjectId
        ? nextProjects.find((project) => project.projectId === initialProjectId)
        : undefined;
      if (initialProject) {
        setSelectedProject(initialProject);
        setBreadcrumbs(
          initialFolderId
            ? [{ id: initialFolderId, name: initialFolderName ?? 'Shared folder' }]
            : [],
        );
        setListing(await getDocuments({
          folderId: initialFolderId,
          projectId: initialProject.projectId,
          serviceId,
        }));
      } else {
        setSelectedProject(undefined);
        setListing(undefined);
        setBreadcrumbs([]);
      }
    } catch (caughtError) {
      reportError(caughtError);
    } finally {
      setLoading(false);
    }
  }, [initialFolderId, initialFolderName, initialProjectId, reportError, serviceId]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const loadFolder = useCallback(async (project: DriveProject, folderId?: string | null) => {
    if (!serviceId) return;
    setLoading(true);
    setError(undefined);
    try {
      setListing(await getDocuments({ folderId, projectId: project.projectId, serviceId }));
    } catch (caughtError) {
      reportError(caughtError);
    } finally {
      setLoading(false);
    }
  }, [reportError, serviceId]);

  const selectProject = useCallback(async (project: DriveProject) => {
    setSelectedProject(project);
    setBreadcrumbs([]);
    await loadFolder(project);
  }, [loadFolder]);

  const openFolder = useCallback(async (folder: DriveFolder) => {
    if (!selectedProject) return;
    setBreadcrumbs((current) => [...current, { id: folder.id, name: folder.name }]);
    await loadFolder(selectedProject, folder.id);
  }, [loadFolder, selectedProject]);

  const goBack = useCallback(async () => {
    if (!selectedProject) return;
    if (breadcrumbs.length === 0) {
      setSelectedProject(undefined);
      setListing(undefined);
      return;
    }
    const nextBreadcrumbs = breadcrumbs.slice(0, -1);
    setBreadcrumbs(nextBreadcrumbs);
    await loadFolder(selectedProject, nextBreadcrumbs.at(-1)?.id);
  }, [breadcrumbs, loadFolder, selectedProject]);

  const refresh = useCallback(async () => {
    if (!selectedProject) return loadProjects();
    await loadFolder(selectedProject, breadcrumbs.at(-1)?.id);
  }, [breadcrumbs, loadFolder, loadProjects, selectedProject]);

  return {
    breadcrumbs,
    error,
    goBack,
    isLoading,
    listing,
    openFolder,
    projects,
    refresh,
    selectProject,
    selectedProject,
  };
}
