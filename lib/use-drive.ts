/**
 * React Query hooks for BRMH Drive API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { driveApi, DriveApiError } from './api-client';
import { getCurrentUserId } from './config';
import { driveKeys, getFolderInvalidationKeys, getFileInvalidationKeys, getSharingInvalidationKeys } from './drive-keys';
import type {
  DriveItem,
  DriveFile,
  DriveFolder,
  DriveContentsResponse,
  UploadPayload,
  CreateFolderPayload,
  SharePayload,
  UpdateSharePermissionsPayload,
  PresignedUrlResponse,
  SharedWithMeResponse,
  SharedByMeResponse,
  ID,
} from './drive-types';

// Query hooks
export function useFolderContents(folderId: ID | 'ROOT' = 'ROOT') {
  const userId = getCurrentUserId();
  return useQuery({
    // include userId so query cache is per-user and invalidates when user changes
    queryKey: [...driveKeys.contents(folderId), 'uid', userId],
    queryFn: async (): Promise<DriveContentsResponse> => {
      // Avoid fetching with an unauthenticated/placeholder user
      if (userId === 'anonymous') {
        return { folders: [], files: [], path: [{ id: 'ROOT', name: 'My BRMH Drive' }] };
      }
      if (folderId === 'ROOT') {
        const [filesResponse, foldersResponse] = await Promise.all([
          driveApi.getFiles('ROOT'),
          driveApi.getFolders('ROOT'),
        ]);
        
        return {
          folders: foldersResponse.data || [],
          files: filesResponse.data || [],
          path: [{ id: 'ROOT', name: 'My BRMH Drive' }],
        };
      } else {
        const response = await driveApi.getFolderContents(folderId);
        if (!response.success || !response.data) {
          // Return empty contents instead of throwing to avoid hard error states
          return { folders: [], files: [], path: [{ id: 'ROOT', name: 'My BRMH Drive' }] };
        }
        return response.data!;
      }
    },
    enabled: !!folderId && userId !== 'anonymous',
    staleTime: 5 * 60 * 1000,
  });
}

export function useFolders(parentId: ID | 'ROOT' = 'ROOT') {
  return useQuery({
    queryKey: driveKeys.foldersByParent(parentId),
    queryFn: async () => {
      const response = await driveApi.getFolders(parentId);
      if (!response.success) {
        throw new Error('Failed to fetch folders');
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSharedWithMe() {
  return useQuery({
    queryKey: driveKeys.sharedWithMe(),
    queryFn: async (): Promise<SharedWithMeResponse> => {
      const response = await driveApi.getSharedWithMe();
      if (!response.success) {
        throw new Error('Failed to fetch shared items');
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSharedByMe() {
  return useQuery({
    queryKey: driveKeys.sharedByMe(),
    queryFn: async (): Promise<SharedByMeResponse> => {
      const response = await driveApi.getSharedByMe();
      if (!response.success) {
        throw new Error('Failed to fetch shared items');
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


// Mutation hooks
export function useCreateFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, description, parentId }: { name: string; description?: string; parentId?: ID | 'ROOT' }) => {
      const response = await driveApi.createFolder({ name, description }, parentId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create folder');
      }
      return response.data!;
    },
    onSuccess: (data, variables) => {
      // Invalidate only the specific parent folder contents to avoid duplicates
      const parentId = variables.parentId || 'ROOT';
      queryClient.invalidateQueries({ queryKey: driveKeys.contents(parentId) });
      
      toast.success(`Folder "${variables.name}" created successfully`);
    },
    onError: (error: DriveApiError) => {
      toast.error(`Failed to create folder: ${error.message}`);
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, parentId }: { file: File; parentId?: ID | 'ROOT' }) => {
      // Use FormData approach instead of JSON with ArrayBuffer
      const response = await driveApi.uploadFileWithForm(file, parentId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to upload file');
      }
      return response.data!;
    },
    onSuccess: (data, variables) => {
      // Invalidate only the specific parent folder contents to avoid duplicates
      const parentId = variables.parentId || 'ROOT';
      queryClient.invalidateQueries({ queryKey: driveKeys.contents(parentId) });
      
      toast.success(`File "${variables.file.name}" uploaded successfully`);
    },
    onError: (error: DriveApiError) => {
      toast.error(`Failed to upload file: ${error.message}`);
    },
  });
}

export function useRenameItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ itemId, newName, itemType }: { itemId: ID; newName: string; itemType?: 'file' | 'folder' }) => {
      // Use the provided itemType or fallback to ID prefix detection
      const isFile = itemType ? itemType === 'file' : itemId.startsWith('FILE_');
      
      if (isFile) {
        const response = await driveApi.renameFile(itemId, newName);
        return response;
      } else {
        const response = await driveApi.renameFolder(itemId, newName);
        return response;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate all contents queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: driveKeys.all });
      
      // Use provided itemType or determine from ID prefix
      const isFile = variables.itemType ? variables.itemType === 'file' : variables.itemId.startsWith('FILE_');
      const itemType = isFile ? 'File' : 'Folder';
      
      toast.success(`${itemType} renamed successfully`);
    },
    onError: (error: DriveApiError) => {
      toast.error(`Failed to rename: ${error.message}`);
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ itemId, isFile, parentId }: { itemId: ID; isFile: boolean; parentId?: ID | 'ROOT' }) => {
      console.log('Delete mutation called:', { itemId, isFile, parentId });
      if (isFile) {
        const response = await driveApi.deleteFile(itemId);
        console.log('Delete file response:', response);
        return response.data!;
      } else {
        const response = await driveApi.deleteFolder(itemId);
        console.log('Delete folder response:', response);
        return response;
      }
    },
    onSuccess: (data, variables) => {
      console.log('Delete mutation SUCCESS:', { data, variables });
      // Invalidate only the specific parent folder contents
      const parentId = variables.parentId || 'ROOT';
      queryClient.invalidateQueries({ queryKey: driveKeys.contents(parentId) });
      
      toast.success(`${variables.isFile ? 'File' : 'Folder'} deleted successfully`);
    },
    onError: (error: DriveApiError) => {
      console.log('Delete mutation ERROR:', error);
      toast.error(`Failed to delete: ${error.message}`);
    },
  });
}

export function useMoveItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ itemId, newParentId }: { itemId: ID; newParentId: ID | 'ROOT' }) => {
      const isFile = itemId.startsWith('FILE_');
      if (isFile) {
        return driveApi.moveFile(itemId, newParentId);
      } else {
        return driveApi.moveFolder(itemId, newParentId);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate all contents queries for both source and destination
      queryClient.invalidateQueries({ queryKey: driveKeys.all });
    },
    onError: (error: DriveApiError) => {
      console.error('Move error:', error);
      // Error toast can be shown by caller
    },
  });
}
export function useDownloadFile() {
  return useMutation({
    mutationFn: async (fileId: ID) => {
      const response = await driveApi.getDownloadUrl(fileId);
      console.log('Download response:', response);
      
      // Backend returns {success: true, downloadUrl: "..."} directly
      if (response.success && response.downloadUrl) {
        return response;
      } else {
        throw new Error('Failed to get download URL');
      }
    },
    onSuccess: (data) => {
      // Force download instead of opening in browser
      if (data && data.downloadUrl) {
        // Create a temporary download link
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.fileName || 'download'; // Use actual filename from response
        link.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Download started: ${data.fileName || 'file'}`);
      } else {
        toast.error('Invalid download URL received');
      }
    },
    onError: (error: DriveApiError) => {
      console.error('Download error:', error);
      toast.error(`Failed to download file: ${error.message}`);
    },
  });
}

// Hook to get download URL without triggering download (for preview purposes)
export function useGetDownloadUrl() {
  return useMutation({
    mutationFn: async (fileId: ID) => {
      const response = await driveApi.getDownloadUrl(fileId);
      console.log('Get download URL response:', response);
      
      // Backend returns {success: true, downloadUrl: "..."} directly
      if (response.success && response.downloadUrl) {
        return response;
      } else {
        throw new Error('Failed to get download URL');
      }
    },
    onError: (error: DriveApiError) => {
      console.error('Get download URL error:', error);
    },
  });
}

// Hook to get preview URL for inline viewing
export function useGetPreviewUrl() {
  return useMutation({
    mutationFn: async (fileId: ID) => {
      const response = await driveApi.getPreviewUrl(fileId);
      console.log('Get preview URL response:', response);
      if (response.success && response.previewUrl) {
        return response;
      }
      throw new Error('Failed to get preview URL');
    },
    onError: (error: DriveApiError) => {
      console.error('Get preview URL error:', error);
    },
  });
}


export function useShareFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ fileId, shareData }: { fileId: ID; shareData: SharePayload }) => {
      const response = await driveApi.shareFile(fileId, shareData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to share file');
      }
      return response.data!;
    },
    onSuccess: (data, variables) => {
      // Invalidate sharing queries
      queryClient.invalidateQueries({ queryKey: getSharingInvalidationKeys() });
      
      toast.success(`File shared successfully`);
    },
    onError: (error: DriveApiError) => {
      toast.error(`Failed to share file: ${error.message}`);
    },
  });
}

export function useShareFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ folderId, shareData }: { folderId: ID; shareData: SharePayload }) => {
      const response = await driveApi.shareFolder(folderId, shareData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to share folder');
      }
      return response.data!;
    },
    onSuccess: (data, variables) => {
      // Invalidate sharing queries
      queryClient.invalidateQueries({ queryKey: getSharingInvalidationKeys() });
      
      toast.success(`Folder shared successfully`);
    },
    onError: (error: DriveApiError) => {
      toast.error(`Failed to share folder: ${error.message}`);
    },
  });
}

export function useRevokeShare() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (shareId: ID) => {
      const response = await driveApi.revokeShare(shareId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to revoke share');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      // Invalidate sharing queries
      queryClient.invalidateQueries({ queryKey: getSharingInvalidationKeys() });
      
      toast.success('Share revoked successfully');
    },
    onError: (error: DriveApiError) => {
      toast.error(`Failed to revoke share: ${error.message}`);
    },
  });
}

