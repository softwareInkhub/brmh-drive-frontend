'use client';

import { useAddTab } from '@/lib/store-client';
import { useRouter } from 'next/navigation';
import { FileItem } from '@/lib/types';
import { DriveFile } from '@/lib/drive-types';

export function useOpenFilePreviewInNewTab() {
  const addTab = useAddTab();
  const router = useRouter();

  return (file: FileItem | DriveFile) => {
    const previewUrl = `/preview/${file.id}`;
    
    // Add a new tab for the preview
    addTab({
      type: 'preview',
      title: `Preview ${file.name}`,
      url: previewUrl,
      fileId: file.id,
    });

    // Navigate to the preview
    router.push(previewUrl);
  };
}

