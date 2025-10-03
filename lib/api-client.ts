/**
 * Strongly typed API client for BRMH Drive backend
 */

import { API_BASE, API_ENDPOINTS, getCurrentUserId } from './config';
import { 
  ApiResponse,
  DriveContentsResponse,
  DriveFile,
  DriveFolder,
  ID,
  PresignedUrlResponse,
  SharedByMeResponse,
  SharedWithMeResponse,
  ShareResponse,
  DeleteFolderResponse,
  CreateFolderPayload,
  RenamePayload,
  UpdateSharePermissionsPayload,
  SharePayload,
} from './drive-types';

async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    ...init,
  });
  // Some backends may return 304 for GETs with no body; treat as empty success
  if (res.status === 304) {
    return {} as T;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${endpoint} failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Safe base64 conversion for large files to avoid stack overflow
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192; // Process in 8KB chunks to avoid stack overflow
  let result = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    result += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(result);
}

/**
 * Alternative FileReader-based base64 conversion for very large files
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/mpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const driveApi = new (class DriveApiClient {
  constructor(public userId: string = getCurrentUserId()) {}

  // File Operations
  async uploadFileJson(file: File, parentId: ID | 'ROOT' = 'ROOT', tags: string[] = []): Promise<ApiResponse<{ fileId: ID }>> {
    // Convert to base64 using FileReader for maximum compatibility with large files
    console.log(`Converting ${file.size} byte file to base64 using FileReader...`);
    const base64 = await fileToBase64(file);
    console.log(`FileReader base64 conversion successful, result length: ${base64.length} characters`);

    const payload = {
      userId: this.userId,
      parentId: parentId ?? 'ROOT',
      file: {
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        content: base64,
        tags,
      },
    };

    return request<ApiResponse<{ fileId: ID }>>(API_ENDPOINTS.UPLOAD_JSON, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async uploadFileWithForm(file: File, parentId: ID | 'ROOT' = 'ROOT'): Promise<ApiResponse<{ fileId: ID }>> {
    console.log('Uploading file:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: this.userId,
      parentId,
      endpoint: `${API_BASE}${API_ENDPOINTS.UPLOAD}`
    });

    // Enforce constraints before request
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('File too large. Max 100 MB');
    }

    // Use single, efficient multipart upload approach (no base64 overhead)
    try {
      console.log('Using multipart upload (most efficient approach)...');
      return await this.uploadFileWithMultipart(file, parentId);
    } catch (error: any) {
      console.error('Multipart upload failed:', error);
      
      // Provide helpful error messages for common issues
      if (error.message.includes('413') || error.message.includes('Request Entity Too Large')) {
        throw new Error(`File too large for server (${(file.size / 1024 / 1024).toFixed(1)}MB). Your production server has a file size limit. Please contact your server administrator to increase upload limits.`);
      } else if (error.message.includes('CORS')) {
        throw new Error(`CORS error: Your production server needs to allow requests from ${window.location.origin}. Please contact your server administrator.`);
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error(`Network error: Cannot reach server at ${API_BASE}. Check if the server is running and accessible.`);
      }
      
      throw error;
    }
  }

  async uploadFileWithMultipart(file: File, parentId: ID | 'ROOT' = 'ROOT'): Promise<ApiResponse<{ fileId: ID }>> {
    console.log('Uploading file with multipart approach...');
    
    try {
    const formData = new FormData();
    formData.append('userId', this.userId);
    formData.append('parentId', parentId);
      formData.append('file', file);
      
      // Try alternative field names that the backend might expect
      formData.append('fileName', file.name);
      formData.append('mimeType', file.type);
      formData.append('size', file.size.toString());

      // Log FormData contents for debugging
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
    
    const response = await fetch(`${API_BASE}${API_ENDPOINTS.UPLOAD}`, {
      method: 'POST',
      body: formData,
        // Don't set Content-Type header for FormData - let browser set it with boundary
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      console.log('Multipart upload response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Multipart upload error response:', errorText);
        throw new Error(`API ${API_ENDPOINTS.UPLOAD} failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Multipart upload success:', result);
      return result;
    } catch (error) {
      console.error('Multipart upload error:', error);
      throw error;
    }
  }


  async getFiles(parentId: ID | 'ROOT' = 'ROOT'): Promise<ApiResponse<DriveFile[]>> {
    const endpoint = `${API_ENDPOINTS.FILES(this.userId)}?parentId=${parentId}`;
    const response = await request<{ files: DriveFile[] } | DriveFile[] | ApiResponse<DriveFile[]>>(endpoint);
    
    // Normalize to ApiResponse shape
    if (Array.isArray(response)) {
      return { success: true, data: response } as ApiResponse<DriveFile[]>;
    }
    if ((response as any).files) {
      return { success: true, data: (response as any).files } as ApiResponse<DriveFile[]>;
    }
    if ((response as any).success !== undefined) {
      return response as ApiResponse<DriveFile[]>;
    }
    return { success: true, data: [] } as ApiResponse<DriveFile[]>;
  }

  async getFile(fileId: ID): Promise<ApiResponse<DriveFile>> {
    return request<ApiResponse<DriveFile>>(API_ENDPOINTS.FILE(this.userId, fileId));
  }

  async renameFile(fileId: ID, newName: string): Promise<ApiResponse<{ message: string }>> {
    const payload: RenamePayload = { newName };
    
    return request<ApiResponse<{ message: string }>>(API_ENDPOINTS.RENAME_FILE(this.userId, fileId), {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteFile(fileId: ID): Promise<ApiResponse<{ message: string }>> {
    return request<ApiResponse<{ message: string }>>(API_ENDPOINTS.DELETE_FILE(this.userId, fileId), {
      method: 'DELETE',
    });
  }

  async getDownloadUrl(fileId: ID): Promise<{
    success: boolean;
    downloadUrl: string;
    fileName: string;
    mimeType: string;
    expiresIn: number;
  }> {
    return request<{
      success: boolean;
      downloadUrl: string;
      fileName: string;
      mimeType: string;
      expiresIn: number;
    }>(API_ENDPOINTS.DOWNLOAD(this.userId, fileId));
  }

  async getPreviewUrl(fileId: ID): Promise<{
    success: boolean;
    previewUrl: string;
    fileName: string;
    mimeType: string;
    expiresIn: number;
  }> {
    return request<{
      success: boolean;
      previewUrl: string;
      fileName: string;
      mimeType: string;
      expiresIn: number;
    }>(API_ENDPOINTS.PREVIEW(this.userId, fileId));
  }


  // Folder Operations
  async createFolder(folderData: CreateFolderPayload['folderData'], parentId: ID | 'ROOT' = 'ROOT'): Promise<ApiResponse<{ folderId: ID }>> {
    const payload: CreateFolderPayload = {
      userId: this.userId,
      folderData,
      parentId,
    };
    
    return request<ApiResponse<{ folderId: ID }>>(API_ENDPOINTS.CREATE_FOLDER, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getFolders(parentId: ID | 'ROOT' = 'ROOT'): Promise<ApiResponse<DriveFolder[]>> {
    const endpoint = `${API_ENDPOINTS.FOLDERS(this.userId)}?parentId=${parentId}`;
    const response = await request<{ folders: DriveFolder[] } | DriveFolder[] | ApiResponse<DriveFolder[]>>(endpoint);
    if (Array.isArray(response)) {
      return { success: true, data: response } as ApiResponse<DriveFolder[]>;
    }
    if ((response as any).folders) {
      return { success: true, data: (response as any).folders } as ApiResponse<DriveFolder[]>;
    }
    if ((response as any).success !== undefined) {
      return response as ApiResponse<DriveFolder[]>;
    }
    return { success: true, data: [] } as ApiResponse<DriveFolder[]>;
  }

  async getFolder(folderId: ID): Promise<ApiResponse<DriveFolder>> {
    const response = await request<DriveFolder>(API_ENDPOINTS.FOLDER(this.userId, folderId));
    return {
      success: true,
      data: response,
    };
  }

  async getFolderContents(folderId: ID): Promise<ApiResponse<DriveContentsResponse>> {
    const response = await request<{ files: DriveFile[]; folders: DriveFolder[] }>(API_ENDPOINTS.FOLDER_CONTENTS(this.userId, folderId));
    
    // Build full breadcrumb path by walking parents
    const path: Array<{ id: ID; name: string }> = [];
    try {
      let currentId: ID | 'ROOT' = folderId;
      while (currentId && currentId !== 'ROOT') {
        const folderResponse = await this.getFolder(currentId);
        if (!folderResponse.success || !folderResponse.data) break;
        const currentFolder = folderResponse.data;
        // Unshift to build from ancestor to child
        path.unshift({ id: currentFolder.id, name: currentFolder.name });
        currentId = currentFolder.parentId;
      }
      // Prepend root
      path.unshift({ id: 'ROOT', name: 'My BRMH Drive' as any });
    } catch (error) {
      // Fallback to single-level path if anything fails
      try {
        const folderResponse = await this.getFolder(folderId);
        if (folderResponse.success && folderResponse.data) {
          path.push({ id: folderId, name: folderResponse.data.name });
        } else {
          path.push({ id: folderId, name: 'Folder' });
        }
      } catch (_) {
        path.push({ id: folderId, name: 'Folder' });
      }
    }
    
    return {
      success: true,
      data: {
        files: response.files || [],
        folders: response.folders || [],
        path,
      },
    };
  }

  async renameFolder(folderId: ID, newName: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('Attempting to rename folder:', folderId, 'to:', newName);
      
      const response = await request<{
        success: boolean;
        folderId: string;
        oldName?: string;
        newName: string;
        newPath?: string;
        updatedAt: string;
      }>(API_ENDPOINTS.RENAME_FOLDER(this.userId, folderId), {
        method: 'PATCH',
        body: JSON.stringify({ 
          newName: newName
        }),
      });
      
      console.log('API Response:', response);
      
      return {
        success: response.success,
        data: { message: response.success ? 'Folder renamed successfully' : (response as any).error || 'Failed to rename folder' },
      };
    } catch (error: any) {
      console.error('Error renaming folder:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred while renaming the folder',
      } as any;
    }
  }

  async moveFile(fileId: ID, newParentId: ID | 'ROOT'): Promise<ApiResponse<{ message: string }>> {
    return request(API_ENDPOINTS.MOVE_FILE(this.userId, fileId), {
      method: 'PATCH',
      body: JSON.stringify({ newParentId }),
    });
  }

  async moveFolder(folderId: ID, newParentId: ID | 'ROOT'): Promise<ApiResponse<{ message: string }>> {
    return request(API_ENDPOINTS.MOVE_FOLDER(this.userId, folderId), {
      method: 'PATCH',
      body: JSON.stringify({ newParentId }),
    });
  }

  async deleteFolder(folderId: ID): Promise<DeleteFolderResponse> {
    try {
      const response = await request<DeleteFolderResponse>(API_ENDPOINTS.DELETE_FOLDER(this.userId, folderId), {
        method: 'DELETE',
      });

      return response;
    } catch (error: any) {
      console.error('Error in deleteFolder:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred while deleting the folder',
        folderId: folderId,
        folderName: 'Unknown',
        deletedAt: new Date().toISOString(),
        deletedItems: { files: 0, folders: 0 },
      } as unknown as DeleteFolderResponse;
    }
  }

  // Sharing
  async shareFile(fileId: ID, shareData: SharePayload): Promise<ApiResponse<ShareResponse>> {
    return request<ApiResponse<ShareResponse>>(API_ENDPOINTS.SHARE_FILE(this.userId, fileId), {
      method: 'POST',
      body: JSON.stringify(shareData),
    });
  }

  async shareFolder(folderId: ID, shareData: SharePayload): Promise<ApiResponse<ShareResponse>> {
    return request<ApiResponse<ShareResponse>>(API_ENDPOINTS.SHARE_FOLDER(this.userId, folderId), {
      method: 'POST',
      body: JSON.stringify(shareData),
    });
  }

  async getSharedWithMe(): Promise<ApiResponse<SharedWithMeResponse>> {
    return request<ApiResponse<SharedWithMeResponse>>(API_ENDPOINTS.SHARED_WITH_ME(this.userId));
  }

  async getSharedByMe(): Promise<ApiResponse<SharedByMeResponse>> {
    return request<ApiResponse<SharedByMeResponse>>(API_ENDPOINTS.SHARED_BY_ME(this.userId));
  }

  async updateSharePermissions(shareId: ID, permissions: UpdateSharePermissionsPayload): Promise<ApiResponse<{ message: string }>> {
    return request<ApiResponse<{ message: string }>>(API_ENDPOINTS.UPDATE_SHARE_PERMISSIONS(this.userId, shareId), {
      method: 'PATCH',
      body: JSON.stringify(permissions),
    });
  }

  async revokeShare(shareId: ID): Promise<ApiResponse<{ message: string }>> {
    return request<ApiResponse<{ message: string }>>(API_ENDPOINTS.REVOKE_SHARE(this.userId, shareId), {
      method: 'POST',
    });
  }

  async downloadShared(shareId: ID): Promise<ApiResponse<PresignedUrlResponse>> {
    return request<ApiResponse<PresignedUrlResponse>>(API_ENDPOINTS.DOWNLOAD_SHARED(this.userId, shareId));
  }
})();
