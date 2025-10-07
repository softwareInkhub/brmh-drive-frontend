/**
 * Test script to verify the rename folder fix
 * This demonstrates the corrected API call
 */

import { driveApi } from '@/lib/api-client';
import { getCurrentUserId } from '@/lib/config';

async function testRenameFolder() {
  const userId = getCurrentUserId(); // Get from authenticated session
  const folderId = "FOLDER_aa30dd00386e477ab0b99e5f2e06c356";
  const newName = "Harshek";

  console.log('Testing rename folder functionality...');
  console.log('User ID:', userId);
  console.log('Folder ID:', folderId);
  console.log('New Name:', newName);
  console.log(`Expected endpoint: PATCH /drive/rename/folder/${userId}/FOLDER_aa30dd00386e477ab0b99e5f2e06c356`);
  console.log('Expected payload: {"newName": "Harshek"}');
  
  try {
    const response = await driveApi.renameFolder(folderId, newName);
    console.log('✅ Success!', response);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Uncomment to run the test
// testRenameFolder();
