/**
 * Test different approaches for folder renaming
 * This helps identify the correct method and payload format
 */

import { driveApi } from '@/lib/api-client';

async function testRenameApproaches() {
  const folderId = "FOLDER_aa30dd00386e477ab0b99e5f2e06c356";
  const newName = "Harshek";

  console.log('Testing different rename approaches...');
  console.log('Folder ID:', folderId);
  console.log('New Name:', newName);
  
  // Current approach: PUT /drive/folder/user123/FOLDER_xxx with {"name": "Harshek"}
  console.log('\n=== Current Approach ===');
  console.log('Method: PUT');
  console.log('Endpoint: /drive/folder/user123/FOLDER_xxx');
  console.log('Payload: {"name": "Harshek"}');
  
  try {
    const response = await driveApi.renameFolder(folderId, newName);
    console.log('✅ Success with current approach!', response);
  } catch (error) {
    console.error('❌ Current approach failed:', error);
    
    // If current approach fails, we might need to try other methods
    console.log('\n=== Alternative Approaches to Try ===');
    console.log('1. POST method instead of PUT');
    console.log('2. Different payload format: {"newName": "Harshek"}');
    console.log('3. Different endpoint: /drive/rename/user123/FOLDER_xxx');
    console.log('4. Include type field: {"name": "Harshek", "type": "folder"}');
  }
}

// Uncomment to run the test
// testRenameApproaches();
