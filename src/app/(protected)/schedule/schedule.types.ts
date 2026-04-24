import type { ScheduleTournament } from "@/services/hooks/schedule.types";
import type { ScheduleEditDraft } from "@/utils/schedulePatch";

export interface ScheduleViewProps {
  isLoading: boolean;
  total: number;
  totalBuyIns: number;
  list: ScheduleTournament[];

  selectedScheduleId: string | null;
  editingScheduleId: string | null;
  savingScheduleId: string | null;
  editDraftById: Record<string, ScheduleEditDraft | undefined>;

  onSelectScheduleToDelete: (id: string | null) => void;
  onConfirmDelete: () => void;
  onCloseDeleteModal: () => void;

  onStartEditSchedule: (row: ScheduleTournament) => void;
  onChangeEditDraft: (id: string, patch: Partial<ScheduleEditDraft>) => void;
  onCancelEditSchedule: (id: string) => void;
  onSaveEditSchedule: (row: ScheduleTournament) => void;
}
