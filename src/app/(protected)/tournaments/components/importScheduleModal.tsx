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

interface ImportScheduleModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onRequestClose: () => void;
  onConfirm: () => void;
}

export function ImportScheduleModal({
  isOpen,
  isLoading,
  onRequestClose,
  onConfirm,
}: ImportScheduleModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onRequestClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-primary text-center">
            Importar grade
          </DialogTitle>
          <DialogDescription className="text-center">
            Deseja adicionar toda a grade de torneios de hoje? Isso vai criar
            todos os torneios da grade usando a data atual e o horário
            configurado em cada item.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-around gap-2 mt-2">
          <Button className="font-bold" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Adicionando..." : "Sim, adicionar"}
          </Button>
          <Button
            className="font-bold"
            variant="secondary"
            onClick={onRequestClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
