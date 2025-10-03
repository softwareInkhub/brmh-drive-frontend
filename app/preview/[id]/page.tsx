'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useTabs, useUpdateTab } from '@/lib/store-client';
import { FilePreview } from '@/components/ui/file-preview';

export default function PreviewPage() {
  const params = useParams();
  const fileId = params.id as string;
  const userId = 'user123'; // This should come from your auth system

  const tabs = useTabs();
  const updateTab = useUpdateTab();

  // Find the current preview tab (the one with the current URL)
  const currentTab = tabs.find(tab => tab.url === `/preview/${fileId}`);

  // Update tab title when file name is available
  useEffect(() => {
    if (currentTab && fileId) {
      // We'll update the title when the FilePreview component loads the file data
      // For now, set a temporary title
      updateTab(currentTab.id, { title: `Preview ${fileId}` });
    }
  }, [fileId, currentTab, updateTab]);

  if (!fileId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">No file selected for preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <FilePreview 
        fileId={fileId} 
        userId={userId}
        onFileNameLoaded={(fileName) => {
          // Update tab title when file name is loaded
          if (currentTab) {
            updateTab(currentTab.id, { title: fileName });
          }
        }}
      />
    </div>
  );
}