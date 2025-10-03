'use client';

import { useFolderContents } from '@/lib/use-drive';
import { useViewMode, useSelectedIds, useSortOption, useSearchQuery, useSetSearchQuery, useTabs, useUpdateTab } from '@/lib/store-client';
import { sortItems } from '@/lib/sorting';
import { FolderCard } from '@/components/ui/folder-card';
import { FileTile } from '@/components/ui/file-tile';
import { FileTable } from '@/components/ui/file-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: folderContents, isLoading, error } = useFolderContents('ROOT');
  const viewMode = useViewMode();
  const selectedIds = useSelectedIds();
  const sortOption = useSortOption();
  const searchQuery = useSearchQuery();
  const setSearchQuery = useSetSearchQuery();
  const searchParams = useSearchParams();
  const tabs = useTabs();
  const updateTab = useUpdateTab();

  // Sync search query from URL parameters
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery !== null && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams, searchQuery, setSearchQuery]);

  // Ensure the home tab has the correct title
  useEffect(() => {
    const homeTab = tabs.find(tab => tab.url === '/' || tab.folderId === 'root');
    if (homeTab && homeTab.title !== 'My BRMH Drive') {
      updateTab(homeTab.id, { title: 'My BRMH Drive' });
    }
  }, [tabs, updateTab]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="brmh-grid">
          {Array.from({ length: 8 }).map((_, i) => (
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
          <h2 className="text-lg font-semibold text-destructive">Error loading drive data</h2>
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
          <h2 className="text-lg font-semibold">No data available</h2>
          <p className="text-muted-foreground mt-2">
            Your drive appears to be empty.
          </p>
        </div>
      </div>
    );
  }

  const { folders, files } = folderContents;

  // Filter folders and files based on search query
  const filteredFolders = searchQuery.trim() 
    ? folders.filter(folder => 
        folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (folder.ownerId && folder.ownerId.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : folders;

  const filteredFiles = searchQuery.trim()
    ? files.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (file.ownerId && file.ownerId.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : files;

  // Sort folders and files based on current sort option
  const sortedFolders = sortItems(filteredFolders, sortOption);
  const sortedFiles = sortItems(filteredFiles, sortOption);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Search Results Header */}
      {searchQuery.trim() && (
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Search Results</h1>
          <p className="text-muted-foreground">
            {sortedFolders.length + sortedFiles.length} results for &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Folders Section */}
      {sortedFolders.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg font-medium">Folders</h2>
          {viewMode === 'grid' ? (
            <div className="brmh-grid">
              {sortedFolders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  isSelected={selectedIds.has(folder.id)}
                />
              ))}
            </div>
          ) : (
            <FileTable
              folders={sortedFolders}
              files={[]}
              selectedIds={selectedIds}
            />
          )}
        </div>
      )}

      {/* Files Section */}
      {sortedFiles.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg font-medium">Files</h2>
          {viewMode === 'grid' ? (
            <div className="brmh-grid">
              {sortedFiles.map((file) => (
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
              files={sortedFiles}
              selectedIds={selectedIds}
            />
          )}
        </div>
      )}

      {/* Empty State */}
      {sortedFolders.length === 0 && sortedFiles.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            {searchQuery.trim() ? (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            ) : (
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
                />
              </svg>
            )}
          </div>
          {searchQuery.trim() ? (
            <>
              <h2 className="text-lg font-semibold">No results found</h2>
              <p className="text-muted-foreground mt-2">
                No files or folders match your search for &quot;{searchQuery}&quot;.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">Your drive is empty</h2>
              <p className="text-muted-foreground mt-2">
                Upload files or create folders to get started.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}