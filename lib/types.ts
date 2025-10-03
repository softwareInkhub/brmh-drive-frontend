export type ID = string;

export type ItemBase = {
  id: ID;
  name: string;
  owner: string;
  modifiedAt: string; // ISO string
  starred?: boolean;
};

export type FolderItem = ItemBase & {
  type: 'folder';
  parentId?: ID | null;
  childrenCount?: number;
};

export type FileItem = ItemBase & {
  type: 'file';
  mime: string; // 'application/pdf', 'image/png', etc.
  size: number; // bytes
  previewUrl?: string;
  parentId?: ID | null;
};

export type Item = FolderItem | FileItem;

export type Breadcrumb = {
  id: ID;
  name: string;
};

export type StorageInfo = {
  usedBytes: number;
  quotaBytes: number;
};

export type DriveData = {
  folders: FolderItem[];
  files: FileItem[];
  quickAccess: FolderItem[];
  storage: StorageInfo;
};

export type FolderData = {
  folders: FolderItem[];
  files: FileItem[];
  path: Breadcrumb[];
};

export type ViewMode = 'grid' | 'list';

export type SortOption = {
  field: 'name' | 'type' | 'modifiedAt' | 'size';
  direction: 'asc' | 'desc';
};

export type ModalType = 'new' | 'rename' | 'move' | 'share' | 'delete';

export type ModalState = {
  [K in ModalType]?:
    | ID
    | boolean
    | { id: ID; type: 'file' | 'folder'; name?: string }
    | { file: FileItem; files?: FileItem[]; currentIndex?: number };
};

// Tab system types
export type TabType = 'folder' | 'search' | 'recent' | 'starred' | 'shared' | 'trash' | 'settings' | 'preview';

export type Tab = {
  id: string;
  type: TabType;
  title: string;
  url: string;
  folderId?: ID;
  fileId?: ID;
  searchQuery?: string;
  isActive: boolean;
  isPinned?: boolean;
};

export type TabState = {
  tabs: Tab[];
  activeTabId: string | null;
  nextTabId: number;
};

// API Response types
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

export type CreateItemRequest = {
  name: string;
  type: 'folder' | 'file';
  parentId?: ID | null;
};

export type UpdateItemRequest = {
  name?: string;
  starred?: boolean;
  parentId?: ID | null;
};

// File type helpers
export const getFileIcon = (mime: string): string => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'music';
  if (mime.includes('pdf')) return 'file-text';
  if (mime.includes('word')) return 'file-text';
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'table';
  if (mime.includes('powerpoint') || mime.includes('presentation')) return 'presentation';
  if (mime.includes('zip') || mime.includes('rar')) return 'archive';
  return 'file';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};
