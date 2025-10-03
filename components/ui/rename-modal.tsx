'use client';

import { useState, useEffect } from 'react';
import { useRenameItem } from '@/lib/use-drive';
import { useFolderContents } from '@/lib/use-drive';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RenameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId?: string;
  itemType?: 'file' | 'folder';
  itemName?: string;
}

export function RenameModal({ open, onOpenChange, itemId, itemType, itemName }: RenameModalProps) {
  const [newName, setNewName] = useState('');
  const renameMutation = useRenameItem();
  const { data: folderContents } = useFolderContents('ROOT');

  // Find the item to get its current name
  const item = itemId ? 
    (folderContents?.files.find(f => f.id === itemId) || 
     folderContents?.folders.find(f => f.id === itemId)) : 
    null;

  useEffect(() => {
    if (open) {
      if (itemName && itemName.trim().length > 0) {
        setNewName(itemName);
      } else if (item) {
        setNewName(item.name);
      } else {
        setNewName('');
      }
    }
  }, [item, itemName, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || !itemType || !newName.trim()) return;

    try {
      await renameMutation.mutateAsync({
        itemId,
        newName: newName.trim(),
        itemType,
      });
      onOpenChange(false);
      setNewName('');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setNewName('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename {itemType === 'file' ? 'File' : 'Folder'}</DialogTitle>
          <DialogDescription>
            {itemType === 'folder' 
              ? `Enter a new name for the folder "${item?.name || 'this folder'}".`
              : `Enter a new name for ${item?.name || 'this item'}.`
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
                placeholder="Enter new name"
                autoFocus
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={renameMutation.isPending || !newName.trim()}
            >
              {renameMutation.isPending ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
