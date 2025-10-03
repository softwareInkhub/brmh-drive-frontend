'use client';

import { useRouter } from 'next/navigation';
import { 
  File, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  MoreVertical,
  Star,
  Folder
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileItem, FolderItem, getFileIcon, formatFileSize } from '@/lib/types';
import { DriveFile, DriveFolder } from '@/lib/drive-types';
import { Button } from '@/components/ui/button';
import { useTabNavigation } from '@/lib/use-tab-navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToggleSelection, useOpenModal } from '@/lib/store-client';
import { formatDate } from '@/lib/types';
import { useRenameItem, useDeleteItem, useShareFile, useShareFolder, useDownloadFile } from '@/lib/use-drive';
import { useOpenFilePreviewInNewTab } from '@/lib/file-preview-utils';

type TableItem = FileItem | FolderItem | DriveFile | DriveFolder;

interface FileTableProps {
  folders: (FolderItem | DriveFolder)[];
  files: (FileItem | DriveFile)[];
  selectedIds: Set<string>;
  onSelect?: (id: string) => void;
}

const fileIcons = {
  file: File,
  'file-text': FileText,
  image: Image,
  video: Video,
  music: Music,
  archive: Archive,
  folder: Folder,
};

export function FileTable({ folders, files, selectedIds, onSelect }: FileTableProps) {
  const router = useRouter();
  const toggleSelection = useToggleSelection();
  const openModal = useOpenModal();
  const renameMutation = useRenameItem();
  const deleteMutation = useDeleteItem();
  const shareFileMutation = useShareFile();
  const shareFolderMutation = useShareFolder();
  const downloadMutation = useDownloadFile();
  const { navigateToRoute } = useTabNavigation();
  const openFilePreviewInNewTab = useOpenFilePreviewInNewTab();

  const allItems: TableItem[] = [...folders, ...files];

  const handleRowClick = (e: React.MouseEvent, item: TableItem) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      toggleSelection(item.id);
    } else {
      // Navigate based on item type
      if (item.type === 'folder') {
        // Open folder in same tab
        navigateToRoute('folder', item.name, `/folder/${item.id}`, item.id);
      } else {
        // Open file preview in new tab
        openFilePreviewInNewTab(item as DriveFile);
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Show context menu
  };

  const getItemIcon = (item: TableItem) => {
    if (item.type === 'folder') {
      return Folder;
    }
    const mime = 'mime' in item ? item.mime : item.mimeType;
    const iconType = getFileIcon(mime);
    return fileIcons[iconType as keyof typeof fileIcons] || File;
  };

  const getItemSize = (item: TableItem) => {
    if (item.type === 'folder') {
      return item.childrenCount ? `${item.childrenCount} items` : 'Folder';
    }
    return formatFileSize(item.size);
  };

  return (
    <div className="border border-border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Owner</TableHead>
            <TableHead className="hidden md:table-cell">Last modified</TableHead>
            <TableHead className="hidden lg:table-cell">Size</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allItems.map((item) => {
            const IconComponent = getItemIcon(item);
            const isSelected = selectedIds.has(item.id);

            return (
              <TableRow
                key={item.id}
                className={cn(
                  "cursor-pointer",
                  isSelected && "bg-primary/10"
                )}
                onClick={(e) => handleRowClick(e, item)}
                onContextMenu={handleContextMenu}
              >
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                    {'starred' in item && item.starred && (
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium truncate max-w-[200px] sm:max-w-none">{item.name}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="text-sm text-muted-foreground">
                    {'owner' in item ? item.owner : item.ownerId}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="text-sm text-muted-foreground">
                    {formatDate('modifiedAt' in item ? item.modifiedAt : item.updatedAt)}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="text-sm text-muted-foreground">
                    {getItemSize(item)}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.type === 'file' && (
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); downloadMutation.mutate(item.id); }}
                          disabled={downloadMutation.isPending}
                        >
                          Download file
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openModal('rename', { id: item.id, type: item.type as 'file' | 'folder', name: item.name }); }}>
                        {item.type === 'folder' ? 'Rename folder' : 'Rename file'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openModal('share', item.id); }}>
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openModal('move', { id: item.id, type: item.type as 'file' | 'folder' }); }}>
                        Move {item.type === 'folder' ? 'folder' : 'file'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({
                          itemId: item.id,
                          isFile: item.type === 'file',
                          parentId: item.parentId || 'ROOT'
                        }); }}
                        className="text-destructive"
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? 'Deleting...' : (item.type === 'folder' ? 'Delete folder' : 'Delete file')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
