"use client";

import { useMemo, useState } from "react";
import type { ScheduleViewProps, PlatformSummaryRow } from "./schedule.types";
import { useCurrency } from "@/services/hooks/useCurrency";
import { convertUsdToBrl } from "@/utils/currencyConvert";
import type {
  ScheduleType,
  TournamentSchedule,
  TournamentScheduleItem,
} from "@/services/hooks/schedule.types";
import { useSchedules } from "@/services/hooks/useSchedules";
import { useScheduleItems } from "@/services/hooks/useScheduleItems";
import {
  buildSchedulePatch,
  type ScheduleEditDraft,
} from "@/utils/schedulePatch";

export function useScheduleViewModel(): ScheduleViewProps {
  const [activeTab, setActiveTab] = useState<ScheduleType>("WEEKLY");
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);

  // Schedule CRUD
  const [isCreatingScheduleForm, setIsCreatingScheduleForm] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState("");
  const [scheduleToDelete, setScheduleToDelete] =
    useState<TournamentSchedule | null>(null);

  // Item editing / deleting
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [editDraftById, setEditDraftById] = useState<
    Record<string, ScheduleEditDraft | undefined>
  >({});

  const { currencies } = useCurrency();
  const brlRate: number | undefined = currencies?.data?.rates?.BRL;

  const { getSchedules, schedules, createSchedule, deleteSchedule } =
    useSchedules(activeTab);
  const { getItems, items, updateItem, deleteItem } =
    useScheduleItems(activeScheduleId);

  const onTabChange = (tab: ScheduleType) => {
    setActiveTab(tab);
    setActiveScheduleId(null);
    setIsCreatingScheduleForm(false);
    setNewScheduleName("");
    setEditingItemId(null);
    setSavingItemId(null);
    setEditDraftById({});
    setSelectedItemId(null);
  };

  const onSelectSchedule = (id: string) => {
    setActiveScheduleId(id);
    setEditingItemId(null);
    setSavingItemId(null);
    setEditDraftById({});
    setSelectedItemId(null);
  };

  // Create schedule
  const onConfirmCreateSchedule = () => {
    const name = newScheduleName.trim();
    if (!name) return;
    createSchedule.mutate(
      { name, type: activeTab },
      {
        onSuccess: () => {
          setIsCreatingScheduleForm(false);
          setNewScheduleName("");
        },
      },
    );
  };

  // Delete schedule
  const onConfirmDeleteSchedule = () => {
    if (!scheduleToDelete) return;
    deleteSchedule.mutate(scheduleToDelete.id, {
      onSuccess: () => {
        setScheduleToDelete(null);
        if (activeScheduleId === scheduleToDelete.id) {
          setActiveScheduleId(null);
        }
      },
    });
  };

  // Item editing
  const onStartEditItem = (row: TournamentScheduleItem) => {
    if (!row.id) return;
    setEditingItemId(row.id);
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

  const onChangeEditDraft = (
    id: string,
    patch: Partial<ScheduleEditDraft>,
  ) => {
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

  const onCancelEditItem = (id: string) => {
    setEditingItemId((cur) => (cur === id ? null : cur));
    setSavingItemId((cur) => (cur === id ? null : cur));
    setEditDraftById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const onSaveEditItem = (row: TournamentScheduleItem) => {
    const id = row.id;
    if (!id) return;
    const draft = editDraftById[id];
    if (!draft) return;
    const patch = buildSchedulePatch(row, draft);
    if (Object.keys(patch).length === 0) {
      onCancelEditItem(id);
      return;
    }
    setSavingItemId(id);
    updateItem.mutate(
      { id, data: patch },
      {
        onSettled: () =>
          setSavingItemId((cur) => (cur === id ? null : cur)),
        onSuccess: () => onCancelEditItem(id),
      },
    );
  };

  // Item delete
  const onConfirmDeleteItem = () => {
    if (selectedItemId) {
      deleteItem.mutate(selectedItemId);
    }
  };

  // Derived
  const total = items.length;
  const totalBuyIns = items.reduce(
    (acc, item) => acc + Number(item.buyIn ?? 0),
    0,
  );
  const totalBuyInsBrl =
    brlRate !== undefined
      ? convertUsdToBrl(brlRate * totalBuyIns)
      : undefined;

  const buyInSummary = useMemo(() => {
    const map = new Map<number, number>();
    for (const item of items) {
      const val = Number(item.buyIn ?? 0);
      map.set(val, (map.get(val) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([buyIn, count]) => ({ buyIn, count }))
      .sort((a, b) => a.buyIn - b.buyIn);
  }, [items]);

  const platformSummary = useMemo((): PlatformSummaryRow[] => {
    const map = new Map<string, { count: number; totalBuyIn: number }>();
    for (const item of items) {
      const platform = String(item.platform ?? "").trim() || "—";
      const prev = map.get(platform) ?? { count: 0, totalBuyIn: 0 };
      map.set(platform, {
        count: prev.count + 1,
        totalBuyIn: prev.totalBuyIn + Number(item.buyIn ?? 0),
      });
    }
    return Array.from(map.entries())
      .map(([platform, { count, totalBuyIn }]) => ({ platform, count, totalBuyIn }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  return {
    activeTab,
    onTabChange,

    isLoadingSchedules: getSchedules.isLoading,
    schedules,
    activeScheduleId,
    onSelectSchedule,

    newScheduleName,
    isCreatingScheduleForm,
    isCreatingSchedule: createSchedule.isPending,
    onNewScheduleNameChange: setNewScheduleName,
    onStartCreateSchedule: () => setIsCreatingScheduleForm(true),
    onCancelCreateSchedule: () => {
      setIsCreatingScheduleForm(false);
      setNewScheduleName("");
    },
    onConfirmCreateSchedule,

    scheduleToDelete,
    onSelectScheduleToDelete: setScheduleToDelete,
    onConfirmDeleteSchedule,

    isLoadingItems: getItems.isLoading,
    total,
    totalBuyIns,
    totalBuyInsBrl,
    list: items,
    buyInSummary,
    platformSummary,

    selectedItemId,
    editingItemId,
    savingItemId,
    editDraftById,

    onSelectItemToDelete: setSelectedItemId,
    onConfirmDeleteItem,
    onCloseDeleteItemModal: () => setSelectedItemId(null),

    onStartEditItem,
    onChangeEditDraft,
    onCancelEditItem,
    onSaveEditItem,
  };
}
