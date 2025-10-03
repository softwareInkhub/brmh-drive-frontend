import { DriveData, FolderData, Item, FolderItem, FileItem } from './types';

// Mock folder data
export const mockFolders: FolderItem[] = [
  {
    id: '25367ca5-e813-4a8b-9c2d-1f3e5a7b9c0d',
    name: 'Documents',
    type: 'folder',
    owner: 'John Doe',
    modifiedAt: '2024-01-15T10:30:00Z',
    parentId: null,
    childrenCount: 12,
  },
  {
    id: '36478db6-f924-5b9c-0d3e-2f4a6b8c0d1e',
    name: 'Images',
    type: 'folder',
    owner: 'John Doe',
    modifiedAt: '2024-01-14T15:45:00Z',
    parentId: null,
    childrenCount: 8,
  },
  {
    id: '47589ec7-0a35-6c0d-1e4f-3a5b7c9d0e2f',
    name: 'Videos',
    type: 'folder',
    owner: 'John Doe',
    modifiedAt: '2024-01-13T09:20:00Z',
    parentId: null,
    childrenCount: 5,
  },
  {
    id: '58690fd8-1b46-7d1e-2f5a-4b6c8d0e1f3a',
    name: 'Music',
    type: 'folder',
    owner: 'John Doe',
    modifiedAt: '2024-01-12T14:15:00Z',
    parentId: null,
    childrenCount: 23,
  },
  {
    id: '69701ge9-2c57-8e2f-3a6b-5c7d9e0f2a4b',
    name: 'Projects',
    type: 'folder',
    owner: 'John Doe',
    modifiedAt: '2024-01-11T11:30:00Z',
    parentId: null,
    childrenCount: 7,
  },
  {
    id: '7a812hf0-3d68-9f3a-4b7c-6d8e0f1a3b5c',
    name: 'Backups',
    type: 'folder',
    owner: 'John Doe',
    modifiedAt: '2024-01-10T16:45:00Z',
    parentId: null,
    childrenCount: 3,
  },
  {
    id: '8b923ig1-4e79-0a4b-5c8d-7e9f1a2b4c6d',
    name: 'Downloads',
    type: 'folder',
    owner: 'John Doe',
    modifiedAt: '2024-01-09T13:20:00Z',
    parentId: null,
    childrenCount: 15,
  },
  {
    id: '9c034jh2-5f8a-1b5c-6d9e-8f0a2b3c5d7e',
    name: 'Templates',
    type: 'folder',
    owner: 'John Doe',
    modifiedAt: '2024-01-08T08:15:00Z',
    parentId: null,
    childrenCount: 4,
  },
  {
    id: 'ad145ki3-6g9b-2c6d-7e0f-9a1b3c4d6e8f',
    name: 'Shared',
    type: 'folder',
    owner: 'John Doe',
    modifiedAt: '2024-01-07T12:30:00Z',
    parentId: null,
    childrenCount: 6,
  },
  {
    id: 'be256lj4-7h0c-3d7e-8f1a-0b2c4d5e7f9a',
    name: 'Archive',
    type: 'folder',
    owner: 'John Doe',
    modifiedAt: '2024-01-06T17:45:00Z',
    parentId: null,
    childrenCount: 2,
  },
  {
    id: 'hello-folder',
    name: 'Hello Folder',
    type: 'folder',
    owner: 'John Doe',
    modifiedAt: '2024-01-16T09:30:00Z',
    parentId: null,
    childrenCount: 3,
  },
];

// Mock file data
export const mockFiles: FileItem[] = [
  {
    id: 'cf367mk5-8i1d-4e8f-9a2b-1c3d5e6f8a0b',
    name: 'AWS_Lambda_API_Gateway_Integration_Guide.pdf',
    type: 'file',
    mime: 'application/pdf',
    size: 37824, // 37 KB
    owner: 'John Doe',
    modifiedAt: '2024-01-05T14:30:00Z',
    parentId: null,
    previewUrl: '/api/preview/cf367mk5-8i1d-4e8f-9a2b-1c3d5e6f8a0b',
  },
  {
    id: 'dg478nl6-9j2e-5f9a-0b3c-2d4e6f7a9b1c',
    name: 'Project_Proposal.docx',
    type: 'file',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 156789,
    owner: 'John Doe',
    modifiedAt: '2024-01-04T10:15:00Z',
    parentId: null,
  },
  {
    id: 'eh589om7-0k3f-6a0b-1c4d-3e5f7a8b0c2d',
    name: 'Budget_2024.xlsx',
    type: 'file',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 89234,
    owner: 'John Doe',
    modifiedAt: '2024-01-03T16:45:00Z',
    parentId: null,
  },
  {
    id: 'fi690pn8-1l4g-7b1c-2d5e-4f6a8b9c0d3e',
    name: 'Presentation.pptx',
    type: 'file',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 234567,
    owner: 'John Doe',
    modifiedAt: '2024-01-02T11:20:00Z',
    parentId: null,
  },
  {
    id: 'gj701qo9-2m5h-8c2d-3e6f-5a7b9c0d1e4f',
    name: 'Screenshot_2024.png',
    type: 'file',
    mime: 'image/png',
    size: 456789,
    owner: 'John Doe',
    modifiedAt: '2024-01-01T09:30:00Z',
    parentId: null,
    previewUrl: '/api/preview/gj701qo9-2m5h-8c2d-3e6f-5a7b9c0d1e4f',
  },
  {
    id: 'hello-world-txt',
    name: 'hello-world.txt',
    type: 'file',
    mime: 'text/plain',
    size: 1024,
    owner: 'John Doe',
    modifiedAt: '2024-01-16T10:00:00Z',
    parentId: null,
  },
  {
    id: 'hello-document',
    name: 'Hello Document.pdf',
    type: 'file',
    mime: 'application/pdf',
    size: 2048,
    owner: 'John Doe',
    modifiedAt: '2024-01-15T14:20:00Z',
    parentId: null,
  },
];

// Mock quick access folders (last 6 accessed)
export const mockQuickAccess: FolderItem[] = mockFolders.slice(0, 6);

// Mock storage info
export const mockStorage = {
  usedBytes: 4.2e9, // 4.2 GB
  quotaBytes: 1.0e10, // 10 GB
};

// Mock drive data for root
export const mockDriveData: DriveData = {
  folders: mockFolders,
  files: mockFiles,
  quickAccess: mockQuickAccess,
  storage: mockStorage,
};

// Mock folder data for specific folders
export const mockFolderData: Record<string, FolderData> = {
  '25367ca5-e813-4a8b-9c2d-1f3e5a7b9c0d': {
    folders: [
      {
        id: 'doc1',
        name: 'Work Documents',
        type: 'folder',
        owner: 'John Doe',
        modifiedAt: '2024-01-15T10:30:00Z',
        parentId: '25367ca5-e813-4a8b-9c2d-1f3e5a7b9c0d',
        childrenCount: 5,
      },
      {
        id: 'doc2',
        name: 'Personal Documents',
        type: 'folder',
        owner: 'John Doe',
        modifiedAt: '2024-01-14T15:45:00Z',
        parentId: '25367ca5-e813-4a8b-9c2d-1f3e5a7b9c0d',
        childrenCount: 3,
      },
    ],
    files: [
      {
        id: 'doc3',
        name: 'Contract.pdf',
        type: 'file',
        mime: 'application/pdf',
        size: 123456,
        owner: 'John Doe',
        modifiedAt: '2024-01-15T10:30:00Z',
        parentId: '25367ca5-e813-4a8b-9c2d-1f3e5a7b9c0d',
      },
    ],
    path: [
      { id: 'root', name: 'My BRMH Drive' },
      { id: '25367ca5-e813-4a8b-9c2d-1f3e5a7b9c0d', name: 'Documents' },
    ],
  },
};

// Helper function to get folder data
export const getFolderData = (folderId: string): FolderData => {
  return mockFolderData[folderId] || {
    folders: [],
    files: [],
    path: [{ id: 'root', name: 'My BRMH Drive' }],
  };
};

// Helper function to get all items (for search, recent, starred, etc.)
export const getAllItems = (): Item[] => {
  return [...mockFolders, ...mockFiles];
};

// Helper function to get recent items (last 7 days)
export const getRecentItems = (): Item[] => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return getAllItems().filter(item => 
    new Date(item.modifiedAt) > sevenDaysAgo
  );
};

// Helper function to get starred items
export const getStarredItems = (): Item[] => {
  return getAllItems().filter(item => item.starred);
};

// Helper function to get shared items
export const getSharedItems = (): Item[] => {
  // Mock shared items - in real app, this would come from backend
  return getAllItems().filter(item => item.owner !== 'John Doe');
};

// Helper function to get trash items
export const getTrashItems = (): Item[] => {
  // Mock trash items - in real app, this would come from backend
  return [];
};

// Helper function to search items
export const searchItems = (query: string): Item[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  return getAllItems().filter(item => 
    item.name.toLowerCase().includes(searchTerm) ||
    item.owner.toLowerCase().includes(searchTerm)
  );
};