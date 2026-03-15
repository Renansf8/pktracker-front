import type { Tournament } from "@/services/hooks/types";

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
  onFilterToggle: () => void;
  onPlatformChange: (platform: string) => void;
  onClearFilter: () => void;
  onPageChange: (page: number) => void;
  onSelectTournamentToDelete: (id: string | null) => void;
  onConfirmDelete: () => void;
  onCloseDeleteModal: () => void;
}
