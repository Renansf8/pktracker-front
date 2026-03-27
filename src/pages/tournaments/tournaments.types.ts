import type { Tournament } from "@/services/hooks/types";
import type { TournamentEditDraft } from "@/utils/tournamentPatch";

export const ITEMS_PER_PAGE = 12;

export interface TournamentsViewProps {
  isLoading: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  currentPageData: Tournament[];
  paginationPages: (number | "ellipsis")[];
  platform: string;
  isOpenFilter: boolean;
  selectedTournamentId: string | null;
  editingTournamentId: string | null;
  editDraftById: Record<string, TournamentEditDraft | undefined>;
  savingTournamentId: string | null;
  isImportScheduleModalOpen: boolean;
  isImportingSchedule: boolean;
  onFilterToggle: () => void;
  onPlatformChange: (platform: string) => void;
  onClearFilter: () => void;
  onPageChange: (page: number) => void;
  onSelectTournamentToDelete: (id: string | null) => void;
  onConfirmDelete: () => void;
  onCloseDeleteModal: () => void;
  onOpenImportScheduleModal: () => void;
  onCloseImportScheduleModal: () => void;
  onConfirmImportSchedule: () => void;
  onStartEditTournament: (tournament: Tournament) => void;
  onChangeEditDraft: (id: string, patch: Partial<TournamentEditDraft>) => void;
  onCancelEditTournament: (id: string) => void;
  onSaveEditTournament: (tournament: Tournament) => void;
}
