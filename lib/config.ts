/**
 * Configuration for BRMH Drive API integration
 */

// Determine if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development';

// Use different base URLs for development vs production
export const API_BASE = isDevelopment 
  ? (process.env.NEXT_PUBLIC_DRIVE_API_BASE_URL ?? 'http://localhost:5001')
  : (process.env.NEXT_PUBLIC_DRIVE_API_BASE_URL ?? 'https://brmh.in');

/**
 * Get the current user ID
 * TODO: Replace with actual authentication system
 */
export function getCurrentUserId(): string {
  return 'user123'; // stub for now
}

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // File operations
  // Use consistent backend endpoints for all upload methods
  UPLOAD_JSON: '/drive/upload',  // Changed from '/api/drive/upload' to '/drive/upload'
  UPLOAD: '/drive/upload',
  FILES: (userId: string) => `/drive/files/${userId}`,
  FILE: (userId: string, fileId: string) => `/drive/file/${userId}/${fileId}`,
  RENAME_FILE: (userId: string, fileId: string) => `/drive/rename/${userId}/${fileId}`,
  MOVE_FILE: (userId: string, fileId: string) => `/drive/move/file/${userId}/${fileId}`,
  DELETE_FILE: (userId: string, fileId: string) => `/drive/file/${userId}/${fileId}`,
  DOWNLOAD: (userId: string, fileId: string) => `/drive/download/${userId}/${fileId}`,
  PREVIEW: (userId: string, fileId: string) => `/drive/preview/${userId}/${fileId}`,
  
  // Folder operations
  CREATE_FOLDER: '/drive/folder',
  FOLDERS: (userId: string) => `/drive/folders/${userId}`,
  FOLDER: (userId: string, folderId: string) => `/drive/folder/${userId}/${folderId}`,
  FOLDER_CONTENTS: (userId: string, folderId: string) => `/drive/contents/${userId}/${folderId}`,
  RENAME_FOLDER: (userId: string, folderId: string) => `/drive/rename/folder/${userId}/${folderId}`,
  MOVE_FOLDER: (userId: string, folderId: string) => `/drive/move/folder/${userId}/${folderId}`,
  DELETE_FOLDER: (userId: string, folderId: string) => `/drive/folder/${userId}/${folderId}`,
  
  // Sharing operations
  SHARE_FILE: (userId: string, fileId: string) => `/drive/share/file/${userId}/${fileId}`,
  SHARE_FOLDER: (userId: string, folderId: string) => `/drive/share/folder/${userId}/${folderId}`,
  SHARED_WITH_ME: (userId: string) => `/drive/shared/with-me/${userId}`,
  SHARED_BY_ME: (userId: string) => `/drive/shared/by-me/${userId}`,
  UPDATE_SHARE_PERMISSIONS: (userId: string, shareId: string) => `/drive/share/${userId}/${shareId}/permissions`,
  REVOKE_SHARE: (userId: string, shareId: string) => `/drive/share/${userId}/${shareId}/revoke`,
  DOWNLOAD_SHARED: (userId: string, shareId: string) => `/drive/shared/${userId}/${shareId}/download`,
  
} as const;
