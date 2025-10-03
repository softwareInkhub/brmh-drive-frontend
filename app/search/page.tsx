'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchItems } from '@/lib/hooks';
import { useFolderContents } from '@/lib/use-drive';
import { useViewMode, useSelectedIds, useSearchQuery, useSetSearchQuery, useSortOption } from '@/lib/store-client';
import { useSearchParams } from 'next/navigation';
import { FolderCard } from '@/components/ui/folder-card';
import { FileTile } from '@/components/ui/file-tile';
import { FileTable } from '@/components/ui/file-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { sortItems } from '@/lib/sorting';
import dynamic from 'next/dynamic';

function SearchPageContent() {
  const searchQuery = useSearchQuery();
  const setSearchQuery = useSetSearchQuery();
  const searchParams = useSearchParams();
  const { data: searchResults, isLoading, error } = useSearchItems(searchQuery);
  const { data: folderContents, isLoading: isLoadingHome, error: homeError } = useFolderContents('ROOT');
  const viewMode = useViewMode();
  const selectedIds = useSelectedIds();
  const sortOption = useSortOption();
  const isInitialLoad = useRef(true);

  // Handle URL search parameters for mobile search
  useEffect(() => {
    try {
      const urlQuery = searchParams.get('q');
      if (urlQuery && isInitialLoad.current) {
        // Only set from URL on initial load
        setSearchQuery(urlQuery);
        isInitialLoad.current = false;
      }
    } catch (error) {
      // Handle case where searchParams is not available during SSR
      console.warn('Search params not available during SSR:', error);
    }
  }, [searchParams, setSearchQuery]);

  // If no search query, show home page content
  if (!searchQuery.trim()) {
    if (isLoadingHome) {
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

    if (homeError) {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-lg font-semibold text-destructive">Error loading drive data</h2>
            <p className="text-muted-foreground mt-2">
              {homeError.message || 'Something went wrong. Please try again.'}
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

    // Sort folders and files based on current sort option
    const sortedFolders = sortItems(folders, sortOption);
    const sortedFiles = sortItems(files, sortOption);

    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
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
            </div>
            <h2 className="text-lg font-semibold">Your drive is empty</h2>
            <p className="text-muted-foreground mt-2">
              Upload files or create folders to get started.
            </p>
          </div>
        )}
      </div>
    );
  }

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
          <h2 className="text-lg font-semibold text-destructive">Error searching</h2>
          <p className="text-muted-foreground mt-2">
            {error.message || 'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  if (!searchResults || searchResults.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">No results found</h2>
          <p className="text-muted-foreground mt-2">
            No files or folders match your search for &quot;{searchQuery}&quot;.
          </p>
        </div>
      </div>
    );
  }

  const folders = searchResults.filter(item => item.type === 'folder');
  const files = searchResults.filter(item => item.type === 'file');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Search Results</h1>
        <p className="text-muted-foreground">
          {searchResults.length} results for &quot;{searchQuery}&quot;
        </p>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="brmh-grid">
          {searchResults.map((item) => (
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

const DynamicSearchPageContent = dynamic(() => Promise.resolve(SearchPageContent), {
  ssr: false,
  loading: () => (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="brmh-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  )
});

export default function SearchPage() {
  return <DynamicSearchPageContent />;
}
