import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tournament } from "@/services/hooks/types";
import { useTournaments } from "@/services/hooks/useTournaments";
import { TournamentForm } from "./components/tournamentForm";
import { convertIsoDateToBr } from "@/utils/dateConvert";
import { Edit, Trash, FilterIcon, X } from "lucide-react";
import { useState, useEffect } from "react";
import { DeleteTournamentModal } from "./components/deleteTournamentModal";
import { FilterTournaments } from "./components/filterTournaments";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 12;

export const Tournaments = () => {
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    string | null
  >(null);
  const [platform, setPlatform] = useState("");
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { getAllTournaments, deleteTournament } = useTournaments(
    platform,
    currentPage,
    ITEMS_PER_PAGE
  );

  const { data: tournaments, isLoading } = getAllTournaments;

  // Reset page when platform filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [platform]);

  const clearFilter = async () => {
    await setPlatform("");
    setCurrentPage(1);
    setTimeout(() => {
      getAllTournaments.refetch();
    }, 0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const responseData = tournaments?.data;
  const totalPages = responseData?.totalPages || 1;
  const total = responseData?.total || 0;
  const currentPageData = responseData?.data || [];

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className="flex flex-col justify-center w-[80%] mx-auto mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-text-primary text-2xl font-bold">Torneios</h2>
          {total > 0 && (
            <p className="text-text-secondary text-sm">
              Total: {total} torneio{total !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <TournamentForm platform={platform} />

        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setIsOpenFilter(!isOpenFilter)}
            className="flex w-[104px] items-center gap-2 text-text-primary bg-transparent border-[2px] !border-white "
          >
            Filtros
            <FilterIcon className="size-4" color="white" />
            {isOpenFilter && <X className="size-4" color="white" />}
          </Button>
        </div>

        {isOpenFilter && (
          <FilterTournaments
            setPlatform={(newPlatform) => {
              setPlatform(newPlatform);
              setCurrentPage(1);
            }}
            clearFilter={clearFilter}
            selectedPlatform={platform}
          />
        )}

        <Table className="mt-8">
          <TableHeader>
            <TableRow>
              <TableHead className="text-text-primary text-center">
                Data
              </TableHead>
              <TableHead className="text-text-primary text-center">
                Plataforma
              </TableHead>
              <TableHead className="text-text-primary text-center">
                Torneio
              </TableHead>
              <TableHead className="text-text-primary text-center">
                Moeda
              </TableHead>
              <TableHead className="text-text-primary text-center">
                Buy-in
              </TableHead>
              <TableHead className="text-text-primary text-center">
                Resultado
              </TableHead>
              <TableHead className="text-text-primary text-center">
                Profit
              </TableHead>
              <TableHead className="text-text-primary text-center">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-text-primary text-center"
                >
                  Nenhum torneio encontrado
                </TableCell>
              </TableRow>
            ) : (
              currentPageData.map((tournament: Tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell className="text-text-primary text-center">
                    {convertIsoDateToBr(tournament.date)}
                  </TableCell>
                  <TableCell className="text-text-primary text-center">
                    {tournament.platform}
                  </TableCell>
                  <TableCell className="text-text-primary text-center">
                    {tournament.name}
                  </TableCell>
                  <TableCell className="text-text-primary text-center">
                    {tournament.currency}
                  </TableCell>
                  <TableCell className="text-text-primary text-center">
                    $ {Number(tournament.buyIn).toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-text-primary  text-center`}>
                    $ {Number(tournament.result).toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`${
                      tournament.profit! > 0 ? "text-green-500" : "text-red-500"
                    }  text-center`}
                  >
                    $ {tournament.profit?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-text-primary text-center flex gap-2 justify-around">
                    <div className="cursor-pointer">
                      <Edit className="size-4" />
                    </div>
                    <div className="cursor-pointer">
                      <Trash
                        className="size-4"
                        color="red"
                        onClick={() =>
                          setSelectedTournamentId(tournament.id || null)
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-6 mb-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        handlePageChange(currentPage - 1);
                      }
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {(() => {
                  const pages: (number | "ellipsis")[] = [];
                  
                  // Always show first page
                  pages.push(1);
                  
                  // Add ellipsis if needed before current page range
                  if (currentPage > 3) {
                    pages.push("ellipsis");
                  }
                  
                  // Show pages around current page
                  const startPage = Math.max(2, currentPage - 1);
                  const endPage = Math.min(totalPages - 1, currentPage + 1);
                  
                  for (let i = startPage; i <= endPage; i++) {
                    if (i !== 1 && i !== totalPages) {
                      pages.push(i);
                    }
                  }
                  
                  // Add ellipsis if needed after current page range
                  if (currentPage < totalPages - 2) {
                    pages.push("ellipsis");
                  }
                  
                  // Always show last page (if more than 1 page)
                  if (totalPages > 1) {
                    pages.push(totalPages);
                  }
                  
                  // Remove duplicates
                  const uniquePages = pages.filter(
                    (page, index, self) =>
                      index === self.findIndex((p) => p === page)
                  );
                  
                  return uniquePages.map((page, index) => {
                    if (page === "ellipsis") {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  });
                })()}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) {
                        handlePageChange(currentPage + 1);
                      }
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <DeleteTournamentModal
          isOpen={selectedTournamentId !== null}
          onRequestClose={() => setSelectedTournamentId(null)}
          onDelete={() => {
            if (selectedTournamentId) {
              deleteTournament.mutate(selectedTournamentId);
            }
          }}
        />
      </div>
    </div>
  );
};
