'use client';

import { 
  File, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  MoreVertical 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileItem, getFileIcon, formatFileSize } from '@/lib/types';
import { DriveFile } from '@/lib/drive-types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToggleSelection, useOpenModal } from '@/lib/store-client';
import { formatDate } from '@/lib/types';
import { useRenameItem, useDeleteItem, useShareFile, useDownloadFile } from '@/lib/use-drive';
import { useOpenFilePreviewInNewTab } from '@/lib/file-preview-utils';

interface FileTileProps {
  file: FileItem | DriveFile;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const fileIcons = {
  file: File,
  'file-text': FileText,
  image: Image,
  video: Video,
  music: Music,
  archive: Archive,
};

export function FileTile({ file, isSelected, onSelect }: FileTileProps) {
  const toggleSelection = useToggleSelection();
  const openModal = useOpenModal();
  const renameMutation = useRenameItem();
  const deleteMutation = useDeleteItem();
  const shareMutation = useShareFile();
  const downloadMutation = useDownloadFile();
  const openFilePreviewInNewTab = useOpenFilePreviewInNewTab();

  const iconType = getFileIcon('mime' in file ? file.mime : file.mimeType);
  const IconComponent = fileIcons[iconType as keyof typeof fileIcons] || File;

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      toggleSelection(file.id);
    } else {
      // Open file preview in new tab
      openFilePreviewInNewTab(file as DriveFile);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Show context menu
  };

  return (
    <Card
      className={cn(
        "brmh-card cursor-pointer",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-xs sm:text-sm truncate">{file.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <span>{formatDate('modifiedAt' in file ? file.modifiedAt : file.updatedAt)}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-70 hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); downloadMutation.mutate(file.id); }}
                disabled={downloadMutation.isPending}
              >
                Download file
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openModal('rename', { id: file.id, type: 'file', name: file.name }); }}>
                Rename file
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openModal('share', file.id); }}>
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openModal('move', { id: file.id, type: 'file' }); }}>
                Move file
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({
                  itemId: file.id,
                  isFile: true,
                  parentId: file.parentId || 'ROOT'
                }); }}
                className="text-destructive"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete file'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
