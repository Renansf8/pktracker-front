import type { ScheduleTournament } from "@/services/hooks/schedule.types";
import type { ScheduleEditDraft } from "@/utils/schedulePatch";

export const SCHEDULE_ITEMS_PER_PAGE = 12;

export interface ScheduleViewProps {
  isLoading: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  currentPageData: ScheduleTournament[];
  paginationPages: (number | "ellipsis")[];

  selectedScheduleId: string | null;
  editingScheduleId: string | null;
  savingScheduleId: string | null;
  editDraftById: Record<string, ScheduleEditDraft | undefined>;

  onPageChange: (page: number) => void;
  onSelectScheduleToDelete: (id: string | null) => void;
  onConfirmDelete: () => void;
  onCloseDeleteModal: () => void;

  onStartEditSchedule: (row: ScheduleTournament) => void;
  onChangeEditDraft: (id: string, patch: Partial<ScheduleEditDraft>) => void;
  onCancelEditSchedule: (id: string) => void;
  onSaveEditSchedule: (row: ScheduleTournament) => void;
}

