'use client';

import { useStarredItems } from '@/lib/hooks';
import { useViewMode, useSelectedIds } from '@/lib/store-client';
import { FolderItem, FileItem } from '@/lib/types';
import { FolderCard } from '@/components/ui/folder-card';
import { FileTile } from '@/components/ui/file-tile';
import { FileTable } from '@/components/ui/file-table';
import { Skeleton } from '@/components/ui/skeleton';

export default function StarredPage() {
  const { data: starredItems, isLoading, error } = useStarredItems();
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
          {Array.from({ length: 4 }).map((_, i) => (
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
          <h2 className="text-lg font-semibold text-destructive">Error loading starred items</h2>
          <p className="text-muted-foreground mt-2">
            {error.message || 'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  if (!starredItems || starredItems.length === 0) {
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
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">No starred items</h2>
          <p className="text-muted-foreground mt-2">
            Star files and folders to access them quickly from here.
          </p>
        </div>
      </div>
    );
  }

  const folders = starredItems.filter(item => item.type === 'folder') as FolderItem[];
  const files = starredItems.filter(item => item.type === 'file') as FileItem[];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Starred</h1>
        <p className="text-muted-foreground">
          Files and folders you&apos;ve starred for quick access
        </p>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="brmh-grid">
          {starredItems.map((item) => (
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
