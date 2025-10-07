'use client';

import { useFolderContents } from '@/lib/use-drive';
import { useViewMode, useSelectedIds, useSetCurrentFolderId, useSetBreadcrumbs } from '@/lib/store-client';
import { FolderCard } from '@/components/ui/folder-card';
import { FileTile } from '@/components/ui/file-tile';
import { FileTable } from '@/components/ui/file-table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyDriveState } from '@/components/ui/empty-drive-state';
import { useEffect, useState } from 'react';

interface FolderPageProps {
  params: Promise<{ id: string }>;
}

export default function FolderPage({ params }: FolderPageProps) {
  const [folderId, setFolderId] = useState<string>('');
  const { data: folderContents, isLoading, error } = useFolderContents(folderId);
  const viewMode = useViewMode();
  const selectedIds = useSelectedIds();
  const setCurrentFolderId = useSetCurrentFolderId();
  const setBreadcrumbs = useSetBreadcrumbs();

  // Handle async params
  useEffect(() => {
    params.then(({ id }) => setFolderId(id));
  }, [params]);

  // Update current folder and breadcrumbs when data changes
  useEffect(() => {
    if (folderContents && folderId) {
      setCurrentFolderId(folderId);
      setBreadcrumbs(folderContents.path);
    }
  }, [folderContents, folderId, setCurrentFolderId, setBreadcrumbs]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="brmh-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-destructive">Error loading folder</h2>
          <p className="text-muted-foreground mt-2">
            {error.message || 'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  if (!folderContents) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold">Folder not found</h2>
          <p className="text-muted-foreground mt-2">
            The folder you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
      </div>
    );
  }

  const { folders, files, path } = folderContents;
  const currentFolder = path[path.length - 1];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">{currentFolder?.name || 'Folder'}</h1>
        <p className="text-muted-foreground">
          {folders.length + files.length} items
        </p>
      </div>

      {/* Folders Section */}
      {folders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Folders</h2>
          {viewMode === 'grid' ? (
            <div className="brmh-grid">
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  isSelected={selectedIds.has(folder.id)}
                />
              ))}
            </div>
          ) : (
            <FileTable
              folders={folders}
              files={[]}
              selectedIds={selectedIds}
            />
          )}
        </div>
      )}

      {/* Files Section */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Files</h2>
          {viewMode === 'grid' ? (
            <div className="brmh-grid">
              {files.map((file) => (
                <FileTile
                  key={file.id}
                  file={file}
                  isSelected={selectedIds.has(file.id)}
                />
              ))}
            </div>
          ) : (
            <FileTable
              folders={[]}
              files={files}
              selectedIds={selectedIds}
            />
          )}
        </div>
      )}

      {/* Empty State */}
      {folders.length === 0 && files.length === 0 && (
        <EmptyDriveState 
          isSearchResult={false}
          currentFolderId={folderId}
        />
      )}
    </div>
  );
}
