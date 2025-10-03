import { useQuery } from '@tanstack/react-query';
import { DriveData, FolderData, Item, StorageInfo, ApiResponse } from './types';
import { 
  mockDriveData, 
  getFolderData, 
  getRecentItems, 
  getStarredItems, 
  getSharedItems, 
  getTrashItems, 
  searchItems,
  mockStorage 
} from './mock-data';
import { driveApi } from './api-client';

// API base URL - can be configured via environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_DRIVE_API_BASE_URL || 'http://localhost:5001';

// Generic API fetch function
async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  const data: ApiResponse<T> = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'API request failed');
  }
  return data.data;
}

// React Query hooks for data fetching
export function useDriveData() {
  return useQuery({
    queryKey: ['drive', 'root'],
    queryFn: () => Promise.resolve(mockDriveData),
  });
}

export function useFolderData(folderId: string) {
  return useQuery({
    queryKey: ['drive', 'folder', folderId],
    queryFn: () => Promise.resolve(getFolderData(folderId)),
    enabled: !!folderId,
  });
}

export function useRecentItems() {
  return useQuery({
    queryKey: ['drive', 'recent'],
    queryFn: () => Promise.resolve(getRecentItems()),
  });
}

export function useStarredItems() {
  return useQuery({
    queryKey: ['drive', 'starred'],
    queryFn: () => Promise.resolve(getStarredItems()),
  });
}

export function useSharedItems() {
  return useQuery({
    queryKey: ['drive', 'shared'],
    queryFn: () => Promise.resolve(getSharedItems()),
  });
}

export function useTrashItems() {
  return useQuery({
    queryKey: ['drive', 'trash'],
    queryFn: () => Promise.resolve(getTrashItems()),
  });
}

export function useSearchItems(query: string) {
  return useQuery({
    queryKey: ['drive', 'search', query],
    queryFn: async () => {
      // Get all files and folders from the real API
      const [filesResponse, foldersResponse] = await Promise.all([
        driveApi.getFiles('ROOT'),
        driveApi.getFolders('ROOT'),
      ]);
      
      if (!filesResponse.success || !foldersResponse.success) {
        throw new Error('Failed to fetch data for search');
      }
      
      const allItems = [
        ...(foldersResponse.data || []),
        ...(filesResponse.data || [])
      ];
      
      // Perform client-side search
      if (!query.trim()) return [];
      
      const searchTerm = query.toLowerCase();
      return allItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        (item.ownerId && item.ownerId.toLowerCase().includes(searchTerm))
      );
    },
    enabled: !!query.trim(),
  });
}

export function useStorageInfo() {
  return useQuery({
    queryKey: ['drive', 'storage'],
    queryFn: () => Promise.resolve(mockStorage),
  });
}
