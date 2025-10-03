'use client';

import { useTrashItems } from '@/lib/hooks';
import { useViewMode, useSelectedIds } from '@/lib/store-client';
import { FolderItem, FileItem } from '@/lib/types';
import { FolderCard } from '@/components/ui/folder-card';
import { FileTile } from '@/components/ui/file-tile';
import { FileTable } from '@/components/ui/file-table';
import { Skeleton } from '@/components/ui/skeleton';

export default function TrashPage() {
  const { data: trashItems, isLoading, error } = useTrashItems();
  const viewMode = useViewMode();
  const selectedIds = useSelectedIds();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="brmh-grid">
          {Array.from({ length: 2 }).map((_, i) => (
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
          <h2 className="text-lg font-semibold text-destructive">Error loading trash items</h2>
          <p className="text-muted-foreground mt-2">
            {error.message || 'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  if (!trashItems || trashItems.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Trash is empty</h2>
          <p className="text-muted-foreground mt-2">
            Deleted files and folders will appear here.
          </p>
        </div>
      </div>
    );
  }

  const folders = trashItems.filter(item => item.type === 'folder') as FolderItem[];
  const files = trashItems.filter(item => item.type === 'file') as FileItem[];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Trash</h1>
        <p className="text-muted-foreground">
          Files and folders you&apos;ve deleted
        </p>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="brmh-grid">
          {trashItems.map((item) => (
            item.type === 'folder' ? (
              <FolderCard
                key={item.id}
                folder={item}
                isSelected={selectedIds.has(item.id)}
              />
            ) : (
              <FileTile
                key={item.id}
                file={item}
                isSelected={selectedIds.has(item.id)}
              />
            )
          ))}
        </div>
      ) : (
        <FileTable
          folders={folders}
          files={files}
          selectedIds={selectedIds}
        />
      )}
    </div>
  );
}
