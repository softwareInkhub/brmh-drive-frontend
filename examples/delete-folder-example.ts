/**
 * Example usage of the delete folder functionality
 * This demonstrates how to use the updated deleteFolder method
 */

import { driveApi, DriveApiError } from '@/lib/api-client';
import type { DeleteFolderResponse } from '@/lib/drive-types';

async function deleteFolderExample() {
  const userId = "user123";
  const folderId = "FOLDER_abc123";

  try {
    console.log(`Attempting to delete folder ${folderId} for user ${userId}...`);
    
    const response = await driveApi.deleteFolder(folderId);
    
    if (response.success) {
      const deleteData: DeleteFolderResponse = response;
      
      console.log('✅ Folder deleted successfully!');
      console.log(`📁 Folder: ${deleteData.folderName}`);
      console.log(`🆔 Folder ID: ${deleteData.folderId}`);
      console.log(`🗑️ Deleted at: ${deleteData.deletedAt}`);
      console.log(`📊 Deleted items:`);
      console.log(`   - Files: ${deleteData.deletedItems.files}`);
      console.log(`   - Folders: ${deleteData.deletedItems.folders}`);
      
      // You can now update your UI state, remove the folder from lists, etc.
      return deleteData;
    }
  } catch (error) {
    if (error instanceof DriveApiError) {
      console.error('❌ API Error:', error.message);
      console.error('Status:', error.status);
      console.error('Details:', error.details);
      
      // Handle specific error cases
      if (error.status === 500) {
        console.error('Server error occurred while deleting folder');
        // Show user-friendly error message
      } else if (error.status === 404) {
        console.error('Folder not found');
        // Handle folder not found case
      } else if (error.status === 403) {
        console.error('Permission denied');
        // Handle permission issues
      }
    } else {
      console.error('❌ Unexpected error:', error);
    }
    
    throw error;
  }
}

// Example of how to use this in a React component
export function useDeleteFolder() {
  const handleDeleteFolder = async (folderId: string) => {
    try {
      const result = await deleteFolderExample();
      
      // Update your state management (e.g., Zustand store)
      // Remove the folder from your current view
      // Show success notification
      
      return result;
    } catch (error) {
      // Handle error in UI
      // Show error notification
      throw error;
    }
  };

  return { handleDeleteFolder };
}

// Example of the expected API response format:
/*
Success Response (200):
{
  "success": true,
  "folderId": "FOLDER_abc123",
  "folderName": "My Documents",
  "deletedAt": "2025-01-27T10:35:00.000Z",
  "deletedItems": {
    "files": 5,
    "folders": 2
  }
}

Error Response (500):
{
  "error": "Failed to delete 2 files: document.pdf, image.jpg"
}
*/
