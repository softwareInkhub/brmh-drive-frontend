'use client';

import { useSharedWithMe } from '@/lib/use-drive';
import { useViewMode, useSelectedIds } from '@/lib/store-client';
import { FolderCard } from '@/components/ui/folder-card';
import { FileTile } from '@/components/ui/file-tile';
import { FileTable } from '@/components/ui/file-table';
import { Skeleton } from '@/components/ui/skeleton';

export default function SharedPage() {
  const { data: sharedData, isLoading, error } = useSharedWithMe();
  const sharedItems = sharedData?.sharedItems || [];
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
          {Array.from({ length: 3 }).map((_, i) => (
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
          <h2 className="text-lg font-semibold text-destructive">Error loading shared items</h2>
          <p className="text-muted-foreground mt-2">
            {error.message || 'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  if (!sharedItems || sharedItems.length === 0) {
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">No shared items</h2>
          <p className="text-muted-foreground mt-2">
            Files and folders shared with you will appear here.
          </p>
        </div>
      </div>
    );
  }

  const folders = sharedItems.filter(item => item.item.type === 'folder');
  const files = sharedItems.filter(item => item.item.type === 'file');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Shared with Me</h1>
        <p className="text-muted-foreground">
          Files and folders that have been shared with you
        </p>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="brmh-grid">
          {sharedItems.map((sharedItem) => (
            sharedItem.item.type === 'folder' ? (
              <FolderCard
                key={sharedItem.id}
                folder={sharedItem.item}
                isSelected={selectedIds.has(sharedItem.item.id)}
              />
            ) : (
              <FileTile
                key={sharedItem.id}
                file={sharedItem.item}
                isSelected={selectedIds.has(sharedItem.item.id)}
              />
            )
          ))}
        </div>
      ) : (
        <FileTable
          folders={folders.map(item => item.item)}
          files={files.map(item => item.item)}
          selectedIds={selectedIds}
        />
      )}
    </div>
  );
}
