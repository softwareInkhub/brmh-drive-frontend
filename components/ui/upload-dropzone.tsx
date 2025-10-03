'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface UploadDropzoneProps {
  onUpload?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  className?: string;
}

export function UploadDropzone({
  onUpload,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB default
  acceptedFileTypes = ['*/*'],
  className
}: UploadDropzoneProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: unknown[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      console.warn('Some files were rejected:', rejectedFiles);
    }

    // Create upload file objects
    const newUploadFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
    setIsUploading(true);

    // Simulate upload progress
    newUploadFiles.forEach(uploadFile => {
      simulateUpload(uploadFile);
    });

    // Call the onUpload callback
    if (onUpload) {
      onUpload(acceptedFiles);
    }
  }, [onUpload]);

  const simulateUpload = (uploadFile: UploadFile) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        setUploadFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress: 100, status: 'completed' as const }
              : f
          )
        );
        clearInterval(interval);
        
        // Remove completed files after 3 seconds
        setTimeout(() => {
          setUploadFiles(prev => prev.filter(f => f.id !== uploadFile.id));
        }, 3000);
      } else {
        setUploadFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress }
              : f
          )
        );
      }
    }, 200);
  };

  const removeUploadFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    disabled: isUploading
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    // You can expand this with more file type icons
    return <File className="w-4 h-4" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <Card
        {...getRootProps()}
        className={cn(
          "cursor-pointer transition-all duration-200 border-2 border-dashed",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          !isDragActive && "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
      >
        <CardContent className="p-8 text-center">
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isDragActive 
                ? (isDragReject ? "Some files are not supported" : "Drop files here")
                : "Upload files"
              }
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop files here, or click to select files
            </p>
            <p className="text-xs text-muted-foreground">
              Max {maxFiles} files, up to {formatFileSize(maxSize)} each
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Uploading files</h4>
            <div className="space-y-3">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadFile.file.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(uploadFile.file.size)}
                        </span>
                        {uploadFile.status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {uploadFile.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeUploadFile(uploadFile.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <Progress 
                      value={uploadFile.progress} 
                      className="mt-1 h-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
