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
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import type { Tournament } from "@/services/hooks/types";

export interface Day2FinalizationData {
  result: number | "ticket";
  itm: boolean;
  hasFt: boolean;
  position: number | null;
}

interface FinalizeTournamentDay2ModalProps {
  tournament: Tournament | null;
  isLoading: boolean;
  onRequestClose: () => void;
  onConfirm: (
    tournament: Tournament,
    finalizationDate: string,
    data: Day2FinalizationData,
  ) => void;
}

export function FinalizeTournamentDay2Modal({
  tournament,
  isLoading,
  onRequestClose,
  onConfirm,
}: FinalizeTournamentDay2ModalProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString(),
  );
  const [result, setResult] = useState("");
  const [itm, setItm] = useState(false);
  const [hasFt, setHasFt] = useState(false);
  const [position, setPosition] = useState("");
  const [resultError, setResultError] = useState("");

  if (!tournament) return null;

  const normalizeResult = (v: string): number | "ticket" | null => {
    if (v.trim().toLowerCase() === "ticket") return "ticket";
    const n = Number(v);
    if (v.trim() === "" || isNaN(n)) return null;
    return n;
  };

  const handleConfirm = () => {
    const normalized = normalizeResult(result);
    if (normalized === null) {
      setResultError("Informe um valor numérico ou 'ticket'");
      return;
    }
    setResultError("");
    onConfirm(tournament, selectedDate, {
      result: normalized,
      itm,
      hasFt,
      position: itm && position !== "" ? Number(position) : null,
    });
  };

  const handleITMToggle = () => {
    setItm((prev) => {
      if (prev) setPosition("");
      return !prev;
    });
  };

  return (
    <Dialog
      open={tournament !== null}
      onOpenChange={(open) => {
        if (!open) onRequestClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Finalizar Dia 2</DialogTitle>
          <DialogDescription>
            Registre o resultado de{" "}
            <strong>{tournament.name}</strong> e a data de finalização.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Data de finalização */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-text-primary font-medium">
              Data de finalização
            </span>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString("pt-BR")
                    : "DD/MM/AAAA"}
                  <ChevronDownIcon className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={selectedDate ? new Date(selectedDate) : undefined}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    if (date) {
                      const now = new Date();
                      date.setHours(now.getHours());
                      date.setMinutes(now.getMinutes());
                      date.setSeconds(now.getSeconds());
                      date.setMilliseconds(now.getMilliseconds());
                      setSelectedDate(date.toISOString());
                    }
                    setCalendarOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Resultado */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-text-primary font-medium">
              Resultado
            </span>
            <Input
              placeholder="0.00 ou ticket"
              value={result}
              onChange={(e) => {
                setResult(e.target.value);
                setResultError("");
              }}
              className="border-input-border"
            />
            {resultError && (
              <span className="text-[11px] text-red-500">{resultError}</span>
            )}
          </div>

          {/* ITM · FT · Posição */}
          <div className="flex gap-3 items-start">
            {/* ITM */}
            <div className="flex flex-col gap-1">
              <span className="text-sm text-text-primary font-medium">ITM</span>
              <button
                type="button"
                onClick={handleITMToggle}
                className={`h-9 w-20 rounded-md border text-sm font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  itm
                    ? "border-success bg-success/20 text-success"
                    : "border-input bg-transparent text-muted-foreground"
                }`}
              >
                {itm && <Check className="size-3" />}
                {itm ? "Sim" : "Não"}
              </button>
            </div>

            {/* FT */}
            <div className="flex flex-col gap-1">
              <span className="text-sm text-text-primary font-medium">FT</span>
              <button
                type="button"
                onClick={() => setHasFt((prev) => !prev)}
                className={`h-9 w-20 rounded-md border text-sm font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  hasFt
                    ? "border-success bg-success/20 text-success"
                    : "border-input bg-transparent text-muted-foreground"
                }`}
              >
                {hasFt && <Check className="size-3" />}
                {hasFt ? "Sim" : "Não"}
              </button>
            </div>

            {/* Posição */}
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-sm text-text-primary font-medium">
                Posição
              </span>
              <Input
                type="number"
                min={1}
                placeholder="1"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                disabled={!itm}
                className="border-input-border"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="secondary"
            onClick={onRequestClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !selectedDate}
            className="bg-success/90 hover:bg-success/80"
          >
            {isLoading ? "Finalizando..." : "Finalizar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
