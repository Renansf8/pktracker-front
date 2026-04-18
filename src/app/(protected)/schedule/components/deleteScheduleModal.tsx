/**
 * deleteScheduleModal.tsx
 * ---------------------------------------------------------------------------
 * Modal de confirmação para remover um torneio da grade.
 *
 * Migrado de `react-modal` para o Radix Dialog (`ui/dialog`).
 * Mantém a mesma API do componente antigo (`isOpen`, `onRequestClose`,
 * `onDelete`) para que a View não precise mudar.
 */
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteScheduleModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onDelete: () => void;
}

export function DeleteScheduleModal({
  isOpen,
  onRequestClose,
  onDelete,
}: DeleteScheduleModalProps) {
  const handleDelete = () => {
    onDelete();
    onRequestClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onRequestClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-primary text-center">
            Remover da grade
          </DialogTitle>
          <DialogDescription className="text-center">
            Tem certeza que deseja remover o torneio da grade?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 justify-around mt-2">
          <Button
            className="font-bold"
            variant="destructive"
            onClick={handleDelete}
          >
            Remover
          </Button>
          <Button
            className="font-bold"
            variant="secondary"
            onClick={onRequestClose}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
