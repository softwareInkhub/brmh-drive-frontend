'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useOpenModal } from '@/lib/store-client';

interface GlobalUploadDropzoneProps {
  children: React.ReactNode;
  className?: string;
}

export function GlobalUploadDropzone({ children, className }: GlobalUploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<Array<{
    id: string;
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
  }>>([]);
  const openModal = useOpenModal();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsDragActive(false);
    
    if (acceptedFiles.length > 0) {
      // Open the upload modal with the dropped files
      openModal('new');
    }
  }, [openModal]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    noClick: true, // Don't open file dialog on click
    noKeyboard: true, // Don't handle keyboard events
    multiple: true,
    maxFiles: 50,
    maxSize: 500 * 1024 * 1024, // 500MB
  });

  return (
    <div
      {...getRootProps()}
      className={cn("relative", className)}
    >
      <input {...getInputProps()} />
      
      {/* Drag overlay */}
      {isDragActive && (
        <div className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          "bg-background/80 backdrop-blur-sm",
          isDragReject ? "bg-destructive/10" : "bg-primary/10"
        )}>
          <Card className="w-96 mx-4">
            <CardContent className="p-8 text-center">
              <Upload className={cn(
                "w-16 h-16 mx-auto mb-4",
                isDragReject ? "text-destructive" : "text-primary"
              )} />
              <h3 className="text-xl font-semibold mb-2">
                {isDragReject ? "Some files are not supported" : "Drop files to upload"}
              </h3>
              <p className="text-muted-foreground">
                {isDragReject 
                  ? "Please check file types and sizes"
                  : "Release to upload files to your drive"
                }
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload progress overlay */}
      {uploadFiles.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 w-80">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Uploading files</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setUploadFiles([])}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {uploadFiles.map((uploadFile) => (
                  <div key={uploadFile.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1 mr-2">
                        {uploadFile.file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(uploadFile.progress)}%
                      </span>
                    </div>
                    <Progress value={uploadFile.progress} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {children}
    </div>
  );
}
