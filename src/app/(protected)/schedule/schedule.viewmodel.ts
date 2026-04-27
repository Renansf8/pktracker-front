"use client";

import { useMemo, useState } from "react";
import type { ScheduleViewProps } from "./schedule.types";
import { useSchedule } from "@/services/hooks/useSchedule";
import type { ScheduleTournament } from "@/services/hooks/schedule.types";
import {
  buildSchedulePatch,
  type ScheduleEditDraft,
} from "@/utils/schedulePatch";

export function useScheduleViewModel(): ScheduleViewProps {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null,
  );
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(
    null,
  );
  const [savingScheduleId, setSavingScheduleId] = useState<string | null>(null);
  const [editDraftById, setEditDraftById] = useState<
    Record<string, ScheduleEditDraft | undefined>
  >({});

  const { getAllSchedule, deleteSchedule, updateSchedule } = useSchedule();
  const { data, isLoading } = getAllSchedule;

  const list: ScheduleTournament[] = useMemo(
    () =>
      (data?.data?.data ?? data?.data ?? []) as ScheduleTournament[],
    [data],
  );

  const total = list.length;
  const totalBuyIns = list.reduce(
    (acc, item) => acc + Number(item.buyIn ?? 0),
    0,
  );

  const buyInSummary = useMemo(() => {
    const map = new Map<number, number>();
    for (const item of list) {
      const val = Number(item.buyIn ?? 0);
      map.set(val, (map.get(val) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([buyIn, count]) => ({ buyIn, count }))
      .sort((a, b) => a.buyIn - b.buyIn);
  }, [list]);

  const onConfirmDelete = () => {
    if (selectedScheduleId) {
      deleteSchedule.mutate(selectedScheduleId);
    }
  };

  const onStartEditSchedule = (row: ScheduleTournament) => {
    if (!row.id) return;
    setEditingScheduleId(row.id);
    setEditDraftById((prev) => ({
      ...prev,
      [row.id as string]: {
        time: String(row.time ?? ""),
        platform: String(row.platform ?? ""),
        name: String(row.name ?? ""),
        currency: String(row.currency ?? "USD"),
        buyIn: row.buyIn ?? 0,
      },
    }));
  };

  const onChangeEditDraft = (id: string, patch: Partial<ScheduleEditDraft>) => {
    setEditDraftById((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {
          time: "",
          platform: "",
          name: "",
          currency: "USD",
          buyIn: 0,
        }),
        ...patch,
      },
    }));
  };

  const onCancelEditSchedule = (id: string) => {
    setEditingScheduleId((cur) => (cur === id ? null : cur));
    setSavingScheduleId((cur) => (cur === id ? null : cur));
    setEditDraftById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const onSaveEditSchedule = (row: ScheduleTournament) => {
    const id = row.id;
    if (!id) return;
    const draft = editDraftById[id];
    if (!draft) return;
    const patch = buildSchedulePatch(row, draft);
    if (Object.keys(patch).length === 0) {
      onCancelEditSchedule(id);
      return;
    }

    setSavingScheduleId(id);
    updateSchedule.mutate(
      { id, data: patch },
      {
        onSettled: () =>
          setSavingScheduleId((cur) => (cur === id ? null : cur)),
        onSuccess: () => onCancelEditSchedule(id),
      },
    );
  };

  return {
    isLoading,
    total,
    totalBuyIns,
    list,
    buyInSummary,

    selectedScheduleId,
    editingScheduleId,
    savingScheduleId,
    editDraftById,

    onSelectScheduleToDelete: setSelectedScheduleId,
    onConfirmDelete,
    onCloseDeleteModal: () => setSelectedScheduleId(null),

    onStartEditSchedule,
    onChangeEditDraft,
    onCancelEditSchedule,
    onSaveEditSchedule,
  };
}
