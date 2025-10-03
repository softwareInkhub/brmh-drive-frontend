'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Folder } from 'lucide-react';
import { useCurrentFolderId, useOpenModal, useCloseModal } from '@/lib/store-client';
import { useFolders, useFolderContents, useMoveItem } from '@/lib/use-drive';

interface MoveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId?: string;
  itemType?: 'file' | 'folder';
}

export function MoveModal({ open, onOpenChange, itemId, itemType }: MoveModalProps) {
  const currentFolderId = useCurrentFolderId() || 'ROOT';
  const [destinationId, setDestinationId] = useState<string>('ROOT');
  const [browseFolderId, setBrowseFolderId] = useState<string>('ROOT');
  const moveMutation = useMoveItem();
  const foldersQuery = useFolders(browseFolderId);

  useEffect(() => {
    if (open) {
      setDestinationId(currentFolderId);
      setBrowseFolderId('ROOT');
    }
  }, [open, currentFolderId]);

  const handleMove = async () => {
    if (!itemId || !itemType) return;
    await moveMutation.mutateAsync({
      itemId,
      newParentId: destinationId,
      isFile: itemType === 'file',
      currentParentId: currentFolderId,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Move {itemType === 'folder' ? 'folder' : 'file'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">Choose destination</div>

          <div className="border rounded-md p-2 max-h-64 overflow-auto">
            <button 
              className={`w-full text-left px-2 py-2 rounded hover:bg-accent flex items-center gap-2 ${
                destinationId === 'ROOT' ? 'bg-primary/10 border border-primary/20' : ''
              }`} 
              onClick={() => { setBrowseFolderId('ROOT'); setDestinationId('ROOT'); }}
            >
              <Folder className="w-4 h-4" />
              <span className="flex-1">My Drive (ROOT)</span>
              {destinationId === 'ROOT' && <Check className="w-4 h-4 text-primary" />}
            </button>
            {foldersQuery.data?.map((f) => (
              <div key={f.id} className={`flex items-center justify-between px-2 py-2 rounded hover:bg-accent ${
                destinationId === f.id ? 'bg-primary/10 border border-primary/20' : ''
              }`}>
                <button 
                  className="text-left flex-1 flex items-center gap-2" 
                  onClick={() => setDestinationId(f.id)}
                >
                  <Folder className="w-4 h-4" />
                  <span>{f.name}</span>
                  {destinationId === f.id && <Check className="w-4 h-4 text-primary" />}
                </button>
                <button 
                  className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent" 
                  onClick={() => setBrowseFolderId(f.id)}
                >
                  Open
                </button>
              </div>
            ))}
          </div>

          {/* Selected destination display */}
          <div className="bg-muted/50 rounded-md p-3">
            <div className="text-xs text-muted-foreground mb-1">Selected destination:</div>
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              <span className="font-medium">
                {destinationId === 'ROOT' ? 'My Drive (ROOT)' : foldersQuery.data?.find(f => f.id === destinationId)?.name || 'Unknown folder'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleMove} disabled={moveMutation.isPending || !destinationId}>
              {moveMutation.isPending ? 'Moving...' : 'Move here'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


