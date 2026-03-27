import { useEffect, useMemo, useState } from "react";
import type { ScheduleViewProps } from "./schedule.types";
import { SCHEDULE_ITEMS_PER_PAGE } from "./schedule.types";
import { useSchedule } from "@/services/hooks/useSchedule";
import type { ScheduleTournament } from "@/services/hooks/schedule.types";
import {
  buildSchedulePatch,
  type ScheduleEditDraft,
} from "@/utils/schedulePatch";

function getPaginationPages(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 1) return [];
  const pages: (number | "ellipsis")[] = [];
  pages.push(1);
  if (currentPage > 3) pages.push("ellipsis");
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);
  for (let i = startPage; i <= endPage; i++) {
    if (i !== 1 && i !== totalPages) pages.push(i);
  }
  if (currentPage < totalPages - 2) pages.push("ellipsis");
  if (totalPages > 1) pages.push(totalPages);
  return pages.filter(
    (page, index, self) => index === self.findIndex((p) => p === page),
  );
}

export function useScheduleViewModel(): ScheduleViewProps {
  const [currentPage, setCurrentPage] = useState(1);
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

  const list: ScheduleTournament[] = (data?.data?.data ??
    data?.data ??
    []) as ScheduleTournament[];

  useEffect(() => {
    setCurrentPage(1);
  }, [list.length]);

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / SCHEDULE_ITEMS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, totalPages);

  const currentPageData = useMemo(() => {
    const start = (currentPageSafe - 1) * SCHEDULE_ITEMS_PER_PAGE;
    return list.slice(start, start + SCHEDULE_ITEMS_PER_PAGE);
  }, [currentPageSafe, list]);

  const paginationPages = useMemo(
    () => getPaginationPages(currentPageSafe, totalPages),
    [currentPageSafe, totalPages],
  );

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

    updateSchedule.mutate(
      { id, data: patch },
      {
        onMutate: () => setSavingScheduleId(id),
        onSettled: () =>
          setSavingScheduleId((cur) => (cur === id ? null : cur)),
        onSuccess: () => onCancelEditSchedule(id),
      },
    );
  };

  return {
    isLoading,
    total,
    totalPages,
    currentPage: currentPageSafe,
    currentPageData,
    paginationPages,

    selectedScheduleId,
    editingScheduleId,
    savingScheduleId,
    editDraftById,

    onPageChange,
    onSelectScheduleToDelete: setSelectedScheduleId,
    onConfirmDelete,
    onCloseDeleteModal: () => setSelectedScheduleId(null),

    onStartEditSchedule,
    onChangeEditDraft,
    onCancelEditSchedule,
    onSaveEditSchedule,
  };
}

