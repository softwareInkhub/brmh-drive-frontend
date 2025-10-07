/**
 * Final test for the corrected rename folder implementation
 * This matches exactly what the backend expects
 */

import { driveApi } from '@/lib/api-client';
import { getCurrentUserId } from '@/lib/config';

async function testFinalRenameImplementation() {
  const userId = getCurrentUserId(); // Get from authenticated session
  const folderId = "FOLDER_aa30dd00386e477ab0b99e5f2e06c356";
  const newName = "Harshek";

  console.log('=== Final Rename Folder Test ===');
  console.log('User ID:', userId);
  console.log('Folder ID:', folderId);
  console.log('New Name:', newName);
  console.log('');
  console.log('Expected API Call:');
  console.log('Method: PATCH');
  console.log(`URL: /drive/rename/folder/${userId}/FOLDER_aa30dd00386e477ab0b99e5f2e06c356`);
  console.log('Headers: { "Content-Type": "application/json" }');
  console.log('Body: { "newName": "Harshek" }');
  console.log('');
  
  try {
    console.log('Attempting rename...');
    const response = await driveApi.renameFolder(folderId, newName);
    console.log('✅ SUCCESS! Folder renamed successfully');
    console.log('Response:', response);
  } catch (error) {
    console.error('❌ FAILED!', error);
    console.log('');
    console.log('If this still fails, the issue might be:');
    console.log('1. Backend server not running on localhost:5001');
    console.log('2. Backend endpoint not implemented yet');
    console.log('3. Authentication/authorization issues');
    console.log('4. Folder ID not found in database');
  }
}

// Uncomment to run the test
// testFinalRenameImplementation();
