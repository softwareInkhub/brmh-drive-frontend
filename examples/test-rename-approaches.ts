/**
 * Test different approaches for folder renaming
 * This helps identify the correct method and payload format
 */

import { driveApi } from '@/lib/api-client';
import { getCurrentUserId } from '@/lib/config';

async function testRenameApproaches() {
  const userId = getCurrentUserId(); // Get from authenticated session
  const folderId = "FOLDER_aa30dd00386e477ab0b99e5f2e06c356";
  const newName = "Harshek";

  console.log('Testing different rename approaches...');
  console.log('User ID:', userId);
  console.log('Folder ID:', folderId);
  console.log('New Name:', newName);
  
  // Current approach: PATCH /drive/rename/folder/{userId}/FOLDER_xxx with {"newName": "Harshek"}
  console.log('\n=== Current Approach ===');
  console.log('Method: PATCH');
  console.log(`Endpoint: /drive/rename/folder/${userId}/FOLDER_xxx`);
  console.log('Payload: {"newName": "Harshek"}');
  
  try {
    const response = await driveApi.renameFolder(folderId, newName);
    console.log('✅ Success with current approach!', response);
  } catch (error) {
    console.error('❌ Current approach failed:', error);
    
    // If current approach fails, we might need to try other methods
    console.log('\n=== Alternative Approaches to Try ===');
    console.log('1. POST method instead of PATCH');
    console.log('2. Different payload format: {"name": "Harshek"}');
    console.log(`3. Different endpoint: /drive/folder/${userId}/FOLDER_xxx`);
    console.log('4. Include type field: {"newName": "Harshek", "type": "folder"}');
  }
}

// Uncomment to run the test
// testRenameApproaches();
