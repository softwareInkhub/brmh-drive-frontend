'use client';

import { useState } from 'react';
import { Upload, FolderPlus, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadDropzone } from './upload-dropzone';
import { useUploadFile, useCreateFolder } from '@/lib/use-drive';
import { getCurrentUserId } from '@/lib/config';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFolderId?: string;
}

export function UploadModal({ open, onOpenChange, currentFolderId }: UploadModalProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [newFolderName, setNewFolderName] = useState('');

  const uploadFileMutation = useUploadFile();
  const createFolderMutation = useCreateFolder();

  const handleFileUpload = async (files: File[]) => {
    try {
      // Use current folder as parent; default to ROOT
      const parentId = (currentFolderId && currentFolderId !== '') ? currentFolderId : 'ROOT';

      for (const file of files) {
        await uploadFileMutation.mutateAsync({
          file,
          parentId,
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
      // Error toast is handled by the mutation
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      try {
        // Use current folder as parent; default to ROOT
        const parentId = (currentFolderId && currentFolderId !== '') ? currentFolderId : 'ROOT';

        await createFolderMutation.mutateAsync({
          name: newFolderName.trim(),
          description: '',
          parentId,
        });

        setNewFolderName('');
        onOpenChange(false);
      } catch (error) {
        console.error('Folder creation error:', error);
        // Error toast is handled by the mutation
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Drive</DialogTitle>
          <DialogDescription>
            Upload files or create a new folder in your drive.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <FileUp className="w-4 h-4" />
              <span>Upload Files</span>
            </TabsTrigger>
            <TabsTrigger value="folder" className="flex items-center space-x-2">
              <FolderPlus className="w-4 h-4" />
              <span>New Folder</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <UploadDropzone
              onUpload={handleFileUpload}
              maxFiles={20}
              maxSize={500 * 1024 * 1024} // 500MB
              acceptedFileTypes={[
                'image/*',
                'video/*',
                'audio/*',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/*',
                'application/json',
                'application/xml',
                'text/xml',
                'application/x-xml',
                'text/csv',
                'text/css',                    // CSS files
                'text/html',                   // HTML file             
                'application/javascript',      // JavaScript files
                'application/zip',
                'application/x-rar-compressed'
              ]}
            />
          </TabsContent>

          <TabsContent value="folder" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder name</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="w-full"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
