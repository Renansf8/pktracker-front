import type { ScheduleEditDraft } from "@/utils/schedulePatch";
import type {
  ScheduleType,
  TournamentSchedule,
  TournamentScheduleItem,
} from "@/services/hooks/schedule.types";

export interface BuyInSummaryRow {
  buyIn: number;
  count: number;
}

export interface PlatformSummaryRow {
  platform: string;
  count: number;
  totalBuyIn: number;
}

export interface ScheduleViewProps {
  activeTab: ScheduleType;
  onTabChange: (tab: ScheduleType) => void;

  isLoadingSchedules: boolean;
  schedules: TournamentSchedule[];
  activeScheduleId: string | null;
  onSelectSchedule: (id: string) => void;

  newScheduleName: string;
  isCreatingScheduleForm: boolean;
  isCreatingSchedule: boolean;
  onNewScheduleNameChange: (name: string) => void;
  onStartCreateSchedule: () => void;
  onCancelCreateSchedule: () => void;
  onConfirmCreateSchedule: () => void;

  scheduleToDelete: TournamentSchedule | null;
  onSelectScheduleToDelete: (schedule: TournamentSchedule | null) => void;
  onConfirmDeleteSchedule: () => void;

  isLoadingItems: boolean;
  total: number;
  totalBuyIns: number;
  totalBuyInsBrl: string | undefined;
  list: TournamentScheduleItem[];
  buyInSummary: BuyInSummaryRow[];
  platformSummary: PlatformSummaryRow[];

  selectedItemId: string | null;
  editingItemId: string | null;
  savingItemId: string | null;
  editDraftById: Record<string, ScheduleEditDraft | undefined>;

  onSelectItemToDelete: (id: string | null) => void;
  onConfirmDeleteItem: () => void;
  onCloseDeleteItemModal: () => void;

  onStartEditItem: (row: TournamentScheduleItem) => void;
  onChangeEditDraft: (id: string, patch: Partial<ScheduleEditDraft>) => void;
  onCancelEditItem: (id: string) => void;
  onSaveEditItem: (row: TournamentScheduleItem) => void;
}
