'use client';

import { useModals, useCloseModal, useCurrentFolderId } from '@/lib/store-client';
import { UploadModal } from './upload-modal';
import { RenameModal } from './rename-modal';
import { MoveModal } from './move-modal';

export function ModalManager() {
  const modals = useModals();
  const closeModal = useCloseModal();
  const currentFolderId = useCurrentFolderId();

  return (
    <>
      {/* Upload Modal */}
      <UploadModal
        open={!!modals.new}
        onOpenChange={(open) => {
          if (!open) {
            closeModal('new');
          }
        }}
        currentFolderId={currentFolderId || 'ROOT'}
      />

      {/* Rename Modal */}
      <RenameModal
        open={!!modals.rename}
        onOpenChange={(open) => {
          if (!open) {
            closeModal('rename');
          }
        }}
        itemId={typeof modals.rename === 'object' ? modals.rename.id : undefined}
        itemType={typeof modals.rename === 'object' ? modals.rename.type : undefined}
        itemName={typeof modals.rename === 'object' ? (modals.rename as any).name : undefined}
      />

      {/* Move Modal */}
      <MoveModal
        open={!!modals.move}
        onOpenChange={(open) => {
          if (!open) {
            closeModal('move');
          }
        }}
        itemId={typeof modals.move === 'object' ? modals.move.id : undefined}
        itemType={typeof modals.move === 'object' ? modals.move.type : undefined}
      />

    </>
  );
}
