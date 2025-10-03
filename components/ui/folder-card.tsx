'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Folder, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FolderItem } from '@/lib/types';
import { DriveFolder } from '@/lib/drive-types';
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
import { useRenameItem, useDeleteItem, useShareFolder } from '@/lib/use-drive';
import { useTabNavigation } from '@/lib/use-tab-navigation';

interface FolderCardProps {
  folder: FolderItem | DriveFolder;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function FolderCard({ folder, isSelected, onSelect }: FolderCardProps) {
  const router = useRouter();
  const toggleSelection = useToggleSelection();
  const openModal = useOpenModal();
  const renameMutation = useRenameItem();
  const deleteMutation = useDeleteItem();
  const shareMutation = useShareFolder();
  const { navigateToRoute } = useTabNavigation();

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      toggleSelection(folder.id);
    } else {
      // Open folder in new tab
      navigateToRoute('folder', folder.name, `/folder/${folder.id}`, folder.id);
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-xs sm:text-sm truncate">{folder.name}</h3>
                <p className="text-xs text-muted-foreground">Folder</p>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {folder.childrenCount && folder.childrenCount > 0 ? (
                <span>{folder.childrenCount} items</span>
              ) : (
                <span>Folder</span>
              )}
              <span className="mx-1">•</span>
              <span>{formatDate('modifiedAt' in folder ? folder.modifiedAt : folder.updatedAt)}</span>
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
              <DropdownMenuItem onClick={(e) => { 
                e.stopPropagation(); 
                const renameData = { id: folder.id, type: 'folder' as const, name: folder.name };
                openModal('rename', renameData);
              }}>
                Rename folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openModal('share', folder.id); }}>
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openModal('move', { id: folder.id, type: 'folder' }); }}>
                Move folder
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({
                  itemId: folder.id,
                  isFile: false,
                  parentId: folder.parentId || 'ROOT'
                }); }}
                className="text-destructive"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete folder'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
