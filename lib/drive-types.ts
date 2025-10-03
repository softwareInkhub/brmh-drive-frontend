/**
 * TypeScript types aligned with BRMH Drive backend schema
 */

export type ID = string;

// Base item interface
export interface DriveItemBase {
  id: ID;
  name: string;
  type: 'file' | 'folder';
  parentId: ID | 'ROOT';
  path: string;
  s3Key: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  ownerId: ID;
}

// File item
export interface DriveFile extends DriveItemBase {
  type: 'file';
  mimeType: string;
  size: number; // bytes
  tags?: string[];
}

// Folder item
export interface DriveFolder extends DriveItemBase {
  type: 'folder';
  description?: string;
  childrenCount?: number;
}

// Union type for all drive items
export type DriveItem = DriveFile | DriveFolder;

// API Request/Response types
export interface UploadPayload {
  userId: ID;
  fileData: {
    name: string;
    mimeType: string;
    size: number;
    content: string | ArrayBuffer; // base64 encoded or binary data
    tags?: string[];
  };
  parentId: ID | 'ROOT';
}

export interface CreateFolderPayload {
  userId: ID;
  folderData: {
    name: string;
    description?: string;
  };
  parentId: ID | 'ROOT';
}

export interface RenamePayload {
  newName: string;
}

export interface SharePayload {
  sharedWithUserId: ID;
  permissions: ('read' | 'write' | 'delete')[];
  expiresAt?: string; // ISO timestamp
  message?: string;
  includeSubfolders?: boolean; // for folder shares
}

export interface UpdateSharePermissionsPayload {
  permissions: ('read' | 'write' | 'delete')[];
  expiresAt?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  timestamp?: string;
}

export interface PresignedUrlResponse {
  success: boolean;
  downloadUrl: string;
  fileName: string;
  mimeType: string;
  expiresIn: number;
}

export interface DriveContentsResponse {
  folders: DriveFolder[];
  files: DriveFile[];
  path: Array<{
    id: ID;
    name: string;
  }>;
}

export interface ShareResponse {
  shareId: ID;
  message: string;
}

export interface SharedItem {
  id: ID; // share ID
  type: 'file' | 'folder';
  originalId: ID;
  originalOwnerId: ID;
  sharedWithUserId: ID;
  permissions: ('read' | 'write' | 'delete')[];
  expiresAt?: string;
  message?: string;
  includeSubfolders?: boolean;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  updatedAt: string;
  // Include the actual item data
  item: DriveItem;
}

export interface SharedWithMeResponse {
  sharedItems: SharedItem[];
}

export interface SharedByMeResponse {
  sharedItems: SharedItem[];
}

// Delete folder response types
export interface DeleteFolderResponse {
  success: boolean;
  folderId: string;
  folderName: string;
  deletedAt: string;
  deletedItems: {
    files: number;
    folders: number;
  };
}

// Error types
export interface ApiError {
  error: string;
  details?: string;
  timestamp?: string;
}

// File type categories for sorting
export type FileTypeCategory = 
  | 'folder'
  | 'image'
  | 'video'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'archive'
  | 'audio'
  | 'text'
  | 'other';

// Sorting options
export type SortOption = 
  | 'name-asc'
  | 'name-desc'
  | 'modified-asc'
  | 'modified-desc'
  | 'size-asc'
  | 'size-desc'
  | 'type-asc'
  | 'type-desc';

// View modes
export type ViewMode = 'grid' | 'list';

// Selection state
export interface SelectionState {
  selectedIds: Set<ID>;
  lastSelectedId?: ID;
}

// Modal types
export type ModalType = 
  | 'upload'
  | 'create-folder'
  | 'rename'
  | 'share'
  | 'delete'
  | 'move'
  | null;

export interface ModalState {
  type: ModalType;
  itemId?: ID;
  itemName?: string;
  itemType?: 'file' | 'folder';
}

// Breadcrumb type
export interface Breadcrumb {
  id: ID;
  name: string;
}

// Storage info
export interface StorageInfo {
  usedBytes: number;
  quotaBytes: number;
  usedPercentage: number;
}
