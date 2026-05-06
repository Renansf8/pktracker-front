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
}

export interface ScheduleViewProps {
  // Tabs
  activeTab: ScheduleType;
  onTabChange: (tab: ScheduleType) => void;

  // Schedule list
  isLoadingSchedules: boolean;
  schedules: TournamentSchedule[];
  activeScheduleId: string | null;
  onSelectSchedule: (id: string) => void;

  // Create schedule
  newScheduleName: string;
  isCreatingScheduleForm: boolean;
  isCreatingSchedule: boolean;
  onNewScheduleNameChange: (name: string) => void;
  onStartCreateSchedule: () => void;
  onCancelCreateSchedule: () => void;
  onConfirmCreateSchedule: () => void;

  // Delete schedule
  scheduleToDelete: TournamentSchedule | null;
  onSelectScheduleToDelete: (schedule: TournamentSchedule | null) => void;
  onConfirmDeleteSchedule: () => void;

  // Items
  isLoadingItems: boolean;
  total: number;
  totalBuyIns: number;
  list: TournamentScheduleItem[];
  buyInSummary: BuyInSummaryRow[];
  platformSummary: PlatformSummaryRow[];

  // Item editing / deleting
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
