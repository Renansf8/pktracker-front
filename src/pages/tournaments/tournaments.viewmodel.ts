import { useTournaments } from "@/services/hooks/useTournaments";
import { useEffect, useMemo, useState } from "react";
import { ITEMS_PER_PAGE } from "./tournaments.types";
import type { TournamentsViewProps } from "./tournaments.types";

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

export function useTournamentsViewModel(): TournamentsViewProps {
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    string | null
  >(null);
  const [platform, setPlatform] = useState("");
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { getAllTournaments, deleteTournament } = useTournaments(
    platform,
    currentPage,
    ITEMS_PER_PAGE,
  );
  const { data: tournaments, isLoading } = getAllTournaments;

  useEffect(() => {
    setCurrentPage(1);
  }, [platform]);

  const responseData = tournaments?.data;
  const totalPages = responseData?.totalPages ?? 1;
  const total = responseData?.total ?? 0;
  const currentPageData = responseData?.data ?? [];

  const paginationPages = useMemo(
    () => getPaginationPages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const clearFilter = () => {
    setPlatform("");
    setCurrentPage(1);
    setTimeout(() => {
      getAllTournaments.refetch();
    }, 0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onPlatformChange = (newPlatform: string) => {
    setPlatform(newPlatform);
    setCurrentPage(1);
  };

  const onConfirmDelete = () => {
    if (selectedTournamentId) {
      deleteTournament.mutate(selectedTournamentId);
    }
  };

  return {
    isLoading,
    total,
    totalPages,
    currentPage,
    currentPageData,
    paginationPages,
    platform,
    isOpenFilter,
    selectedTournamentId,
    onFilterToggle: () => setIsOpenFilter((prev) => !prev),
    onPlatformChange,
    onClearFilter: clearFilter,
    onPageChange: handlePageChange,
    onSelectTournamentToDelete: setSelectedTournamentId,
    onConfirmDelete,
    onCloseDeleteModal: () => setSelectedTournamentId(null),
  };
}
