/**
 * Configuration for BRMH Drive API integration
 */

// Determine if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development';

// Use proxy API route to avoid CORS issues
// In development, you can set NEXT_PUBLIC_DRIVE_API_BASE_URL to point directly to backend
// In production, we use the proxy route to avoid CORS issues
const RAW_BASE =
  process.env.NEXT_PUBLIC_DRIVE_API_BASE_URL ??
  (isDevelopment ? 'http://localhost:5001' : '/api/drive');

// Normalize base: if absolute URL and does not include '/drive' path, append it
// This prevents 404s like https://brmh.in/files/... by ensuring https://brmh.in/drive/files...
export const API_BASE = (() => {
  try {
    // If it's a relative proxy path, use as-is
    if (RAW_BASE.startsWith('/')) return RAW_BASE;
    const url = new URL(RAW_BASE);
    if (!url.pathname.endsWith('/drive')) {
      url.pathname = `${url.pathname.replace(/\/$/, '')}/drive`;
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    // Fallback to raw if not a valid URL
    return RAW_BASE;
  }
})();

import { SSOUtils } from './sso-utils';

/**
 * Get the current user ID from SSO
 */
export function getCurrentUserId(): string {
  const user = SSOUtils.getUser();
  return user?.sub || 'anonymous';
}

/**
 * API endpoints - these will be proxied through /api/drive/[...path] to avoid CORS issues
 */
export const API_ENDPOINTS = {
  // File operations
  UPLOAD_JSON: '/upload', // Will become /api/drive/upload
  UPLOAD: '/upload',
  FILES: (userId: string) => `/files/${userId}`,
  FILE: (userId: string, fileId: string) => `/file/${userId}/${fileId}`,
  RENAME_FILE: (userId: string, fileId: string) =>
    `/rename/${userId}/${fileId}`,
  MOVE_FILE: (userId: string, fileId: string) =>
    `/move/file/${userId}/${fileId}`,
  DELETE_FILE: (userId: string, fileId: string) => `/file/${userId}/${fileId}`,
  DOWNLOAD: (userId: string, fileId: string) => `/download/${userId}/${fileId}`,
  PREVIEW: (userId: string, fileId: string) => `/preview/${userId}/${fileId}`,

  // Folder operations
  CREATE_FOLDER: '/folder',
  FOLDERS: (userId: string) => `/folders/${userId}`,
  FOLDER: (userId: string, folderId: string) => `/folder/${userId}/${folderId}`,
  FOLDER_CONTENTS: (userId: string, folderId: string) =>
    `/contents/${userId}/${folderId}`,
  RENAME_FOLDER: (userId: string, folderId: string) =>
    `/rename/folder/${userId}/${folderId}`,
  MOVE_FOLDER: (userId: string, folderId: string) =>
    `/move/folder/${userId}/${folderId}`,
  DELETE_FOLDER: (userId: string, folderId: string) =>
    `/folder/${userId}/${folderId}`,

  // Sharing operations
  SHARE_FILE: (userId: string, fileId: string) =>
    `/share/file/${userId}/${fileId}`,
  SHARE_FOLDER: (userId: string, folderId: string) =>
    `/share/folder/${userId}/${folderId}`,
  SHARED_WITH_ME: (userId: string) => `/shared/with-me/${userId}`,
  SHARED_BY_ME: (userId: string) => `/shared/by-me/${userId}`,
  UPDATE_SHARE_PERMISSIONS: (userId: string, shareId: string) =>
    `/share/${userId}/${shareId}/permissions`,
  REVOKE_SHARE: (userId: string, shareId: string) =>
    `/share/${userId}/${shareId}/revoke`,
  DOWNLOAD_SHARED: (userId: string, shareId: string) =>
    `/shared/${userId}/${shareId}/download`,
} as const;
