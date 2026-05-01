"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ScheduleType, TournamentSchedule } from "@/services/hooks/schedule.types";
import { useSchedules } from "@/services/hooks/useSchedules";

const TABS: { value: ScheduleType; label: string }[] = [
  { value: "WEEKLY", label: "Semanal" },
  { value: "SUNDAY", label: "Domingo" },
];

interface ImportScheduleModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onRequestClose: () => void;
  onConfirm: (scheduleId: string) => void;
}

function ScheduleList({
  type,
  selectedId,
  onSelect,
}: {
  type: ScheduleType;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { schedules, getSchedules } = useSchedules(type);

  if (getSchedules.isLoading) {
    return (
      <p className="text-text-secondary text-sm text-center animate-pulse py-4">
        Carregando grades...
      </p>
    );
  }

  if (schedules.length === 0) {
    return (
      <p className="text-text-secondary text-sm text-center py-4">
        Nenhuma grade cadastrada.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {schedules.map((s: TournamentSchedule) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.id)}
          className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
            selectedId === s.id
              ? "border-primary/50 bg-primary/10 text-foreground"
              : "border-border bg-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {s.name}
        </button>
      ))}
    </div>
  );
}

export function ImportScheduleModal({
  isOpen,
  isLoading,
  onRequestClose,
  onConfirm,
}: ImportScheduleModalProps) {
  const [selectedType, setSelectedType] = useState<ScheduleType>("WEEKLY");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null,
  );

  const handleClose = () => {
    if (isLoading) return;
    setSelectedType("WEEKLY");
    setSelectedScheduleId(null);
    onRequestClose();
  };

  const handleTabChange = (tab: ScheduleType) => {
    setSelectedType(tab);
    setSelectedScheduleId(null);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-primary text-center">
            Importar grade
          </DialogTitle>
          <DialogDescription className="text-center">
            Escolha qual grade importar. Os torneios serão criados com a data
            atual e o horário configurado em cada item.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 p-1 rounded-xl bg-secondary w-fit mx-auto">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              disabled={isLoading}
              onClick={() => handleTabChange(tab.value)}
              className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed ${
                selectedType === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-1">
          <ScheduleList
            type={selectedType}
            selectedId={selectedScheduleId}
            onSelect={setSelectedScheduleId}
          />
        </div>

        <DialogFooter className="flex justify-around gap-2 mt-2">
          <Button
            className="font-bold"
            onClick={() => selectedScheduleId && onConfirm(selectedScheduleId)}
            disabled={isLoading || !selectedScheduleId}
          >
            {isLoading ? "Adicionando..." : "Sim, adicionar"}
          </Button>
          <Button
            className="font-bold"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
