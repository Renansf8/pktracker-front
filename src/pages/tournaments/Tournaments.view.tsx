import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tournament } from "@/services/hooks/types";
import { TournamentForm } from "./components/tournamentForm";
import { convertIsoDateToBr } from "@/utils/dateConvert";
import { Edit, Trash, FilterIcon, X } from "lucide-react";
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
import type { TournamentsViewProps } from "./tournaments.types";

/**
 * View da página Tournaments: apenas apresentação. Recebe estado e handlers do ViewModel.
 */
export function TournamentsView({
  isLoading,
  total,
  totalPages,
  currentPage,
  currentPageData,
  paginationPages,
  platform,
  isOpenFilter,
  selectedTournamentId,
  onFilterToggle,
  onPlatformChange,
  onClearFilter,
  onPageChange,
  onSelectTournamentToDelete,
  onConfirmDelete,
  onCloseDeleteModal,
}: TournamentsViewProps) {
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

        <div className="glass-panel mb-6 rounded-3xl p-6">
          <TournamentForm platform={platform} />
        </div>

        <div className="flex justify-end mb-4">
          <Button
            onClick={onFilterToggle}
            className="flex w-[104px] items-center gap-2 text-text-primary bg-transparent border-[2px] !border-white "
          >
            Filtros
            <FilterIcon className="size-4" color="white" />
            {isOpenFilter && <X className="size-4" color="white" />}
          </Button>
        </div>

        {isOpenFilter && (
          <div className="glass-panel mb-6 rounded-3xl p-5">
            <FilterTournaments
              setPlatform={onPlatformChange}
              clearFilter={onClearFilter}
              selectedPlatform={platform}
            />
          </div>
        )}

        <div className="glass-panel mt-8 overflow-hidden rounded-3xl p-1">
          <div className="glass-inner rounded-2xl p-4">
            <Table>
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
                      <TableCell className="text-text-primary text-center">
                        $ {Number(tournament.result).toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={`${
                          tournament.profit! > 0
                            ? "text-green-500"
                            : "text-red-500"
                        } text-center`}
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
                              onSelectTournamentToDelete(tournament.id ?? null)
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 mb-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) onPageChange(currentPage - 1);
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {paginationPages.map((page, index) => {
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
                          onPageChange(page);
                        }}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        onPageChange(currentPage + 1);
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
          onRequestClose={onCloseDeleteModal}
          onDelete={onConfirmDelete}
        />
      </div>
    </div>
  );
}
