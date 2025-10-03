/**
 * React Query keys for BRMH Drive API
 */

import type { ID } from './drive-types';

// Base keys
export const driveKeys = {
  all: ['drive'] as const,
  
  // Files
  files: () => [...driveKeys.all, 'files'] as const,
  filesByParent: (parentId: ID | 'ROOT') => [...driveKeys.files(), 'parent', parentId] as const,
  file: (fileId: ID) => [...driveKeys.files(), 'detail', fileId] as const,
  
  // Folders
  folders: () => [...driveKeys.all, 'folders'] as const,
  foldersByParent: (parentId: ID | 'ROOT') => [...driveKeys.folders(), 'parent', parentId] as const,
  folder: (folderId: ID) => [...driveKeys.folders(), 'detail', folderId] as const,
  folderContents: (folderId: ID) => [...driveKeys.folders(), 'contents', folderId] as const,
  
  // Sharing
  shared: () => [...driveKeys.all, 'shared'] as const,
  sharedWithMe: () => [...driveKeys.shared(), 'with-me'] as const,
  sharedByMe: () => [...driveKeys.shared(), 'by-me'] as const,
  
  // Root drive data (files + folders)
  root: () => [...driveKeys.all, 'root'] as const,
  rootContents: () => [...driveKeys.root(), 'contents'] as const,
  
  // Folder contents (files + folders combined)
  contents: (folderId: ID | 'ROOT') => [...driveKeys.all, 'contents', folderId] as const,
} as const;

// Helper function to get all keys that should be invalidated when a folder changes
export function getFolderInvalidationKeys(folderId: ID | 'ROOT') {
  return [
    driveKeys.foldersByParent(folderId),
    driveKeys.filesByParent(folderId),
    driveKeys.contents(folderId),
    driveKeys.rootContents(),
  ];
}

// Helper function to get all keys that should be invalidated when a file changes
export function getFileInvalidationKeys(fileId: ID, parentId: ID | 'ROOT') {
  return [
    driveKeys.file(fileId),
    driveKeys.filesByParent(parentId),
    driveKeys.contents(parentId),
    driveKeys.rootContents(),
  ];
}

// Helper function to get all keys that should be invalidated when sharing changes
export function getSharingInvalidationKeys() {
  return [
    driveKeys.sharedWithMe(),
    driveKeys.sharedByMe(),
  ];
}
