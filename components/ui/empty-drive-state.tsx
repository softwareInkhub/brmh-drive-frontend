'use client';

import { FolderPlus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOpenModal } from '@/lib/store-client';

interface EmptyDriveStateProps {
  isSearchResult?: boolean;
  searchQuery?: string;
  currentFolderId?: string;
}

export function EmptyDriveState({ 
  isSearchResult = false, 
  searchQuery = '',
  currentFolderId 
}: EmptyDriveStateProps) {
  const openModal = useOpenModal();

  const handleNewFolderOrUpload = () => {
    // Open the combined upload/new folder modal
    openModal('new', true);
  };

  if (isSearchResult) {
    return (
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">No results found</h2>
        <p className="text-muted-foreground mt-2">
          No files or folders match your search for &quot;{searchQuery}&quot;.
        </p>
      </div>
    );
  }

  return (
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
      <h2 className="text-lg font-semibold mb-2">
        Your BRMH Drive is empty
      </h2>
      <p className="text-muted-foreground mb-6">
        Create a folder or upload files to get started.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Button 
          onClick={handleNewFolderOrUpload}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <FolderPlus className="w-4 h-4 mr-2" />
          New Folder
        </Button>
        <Button 
          onClick={handleNewFolderOrUpload}
          className="w-full sm:w-auto"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
      </div>
    </div>
  );
}

