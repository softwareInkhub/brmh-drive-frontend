/**
 * Example usage of the fixed rename folder functionality
 * This demonstrates how to use the updated renameFolder method
 */

import { driveApi, DriveApiError } from '@/lib/api-client';
import { getCurrentUserId } from '@/lib/config';

async function renameFolderExample() {
  // Get the authenticated user's ID from SSO
  const userId = getCurrentUserId();
  const folderId = "FOLDER_aa30dd00386e477ab0b99e5f2e06c356";
  const newName = "My Renamed Folder";

  try {
    console.log(`Attempting to rename folder ${folderId} to "${newName}"...`);
    
    const response = await driveApi.renameFolder(folderId, newName);
    
    if (response.success && response.data) {
      console.log('✅ Folder renamed successfully!');
      console.log(`📁 New name: ${response.data.message}`);
      
      // You can now update your UI state, refresh the folder list, etc.
      return response.data;
    }
  } catch (error) {
    if (error instanceof DriveApiError) {
      console.error('❌ API Error:', error.message);
      console.error('Status:', error.status);
      console.error('Details:', error.details);
      
      // Handle specific error cases
      if (error.status === 500) {
        console.error('Server error occurred while renaming folder');
        // Show user-friendly error message
      } else if (error.status === 404) {
        console.error('Folder not found');
        // Handle folder not found case
      } else if (error.status === 403) {
        console.error('Permission denied');
        // Handle permission issues
      } else if (error.status === 400) {
        console.error('Invalid request - check folder name');
        // Handle validation errors
      }
    } else {
      console.error('❌ Unexpected error:', error);
    }
    
    throw error;
  }
}

// Example of how to use this in a React component with the useRenameItem hook
export function useRenameFolderExample() {
  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      const result = await renameFolderExample();
      
      // Update your state management (e.g., Zustand store)
      // Refresh the folder list
      // Show success notification
      
      return result;
    } catch (error) {
      // Handle error in UI
      // Show error notification
      throw error;
    }
  };

  return { handleRenameFolder };
}

// Example of the expected API request format:
/*
PATCH /drive/rename/folder/{userId}/FOLDER_aa30dd00386e477ab0b99e5f2e06c356
Content-Type: application/json

{
  "newName": "My Renamed Folder"
}

Note: {userId} is dynamically obtained from the authenticated user's SSO token

Expected Response:
{
  "success": true,
  "folderId": "FOLDER_aa30dd00386e477ab0b99e5f2e06c356",
  "oldName": "Harshek123",
  "newName": "My Renamed Folder",
  "newPath": "/My Renamed Folder",
  "updatedAt": "2025-01-27T10:35:00.000Z"
}
*/
