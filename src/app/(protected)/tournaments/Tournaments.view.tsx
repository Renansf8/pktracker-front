"use client";

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
import {
  Check,
  ChevronDownIcon,
  Edit,
  FilterIcon,
  Trash,
  X,
} from "lucide-react";
import { DeleteTournamentModal } from "./components/deleteTournamentModal";
import { ImportScheduleModal } from "./components/importScheduleModal";
import { FilterTournaments } from "./components/filterTournaments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTournamentsViewModel } from "./tournaments.viewmodel";

/**
 * View da página Tournaments.
 *
 * Padrão MVVM: a View chama internamente o ViewModel (hook client-side).
 * O `page.tsx` (Server Component) apenas renderiza esta View — ele não
 * consegue invocar hooks, por isso a View é quem orquestra a integração
 * com o ViewModel.
 */
export function TournamentsView() {
  const {
    isLoading,
    total,
    totalPages,
    currentPage,
    currentPageData,
    paginationPages,
    platform,
    isOpenFilter,
    selectedTournamentId,
    editingTournamentId,
    editDraftById,
    savingTournamentId,
    isImportScheduleModalOpen,
    isImportingSchedule,
    onFilterToggle,
    onPlatformChange,
    onClearFilter,
    onPageChange,
    onSelectTournamentToDelete,
    onConfirmDelete,
    onCloseDeleteModal,
    onOpenImportScheduleModal,
    onCloseImportScheduleModal,
    onConfirmImportSchedule,
    onStartEditTournament,
    onChangeEditDraft,
    onCancelEditTournament,
    onSaveEditTournament,
  } = useTournamentsViewModel();

  // Estado local de UI (qual date picker está aberto na linha em edição).
  // IMPORTANTE: declarado ANTES de qualquer early-return para respeitar
  // as regras dos hooks do React.
  const [openDatePickerId, setOpenDatePickerId] = useState<string | null>(null);

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

        <div className="mb-4 flex items-center justify-between">
          <Button
            onClick={onOpenImportScheduleModal}
            className="flex items-center gap-2 text-text-primary bg-transparent border-[2px] !border-white"
          >
            Adicionar grade
          </Button>
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
                    ITM
                  </TableHead>
                  <TableHead className="text-text-primary text-center">
                    FT
                  </TableHead>
                  <TableHead className="text-text-primary text-center">
                    Posição
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
                      colSpan={11}
                      className="text-text-primary text-center"
                    >
                      Nenhum torneio encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPageData.map((tournament: Tournament) => {
                    const id = tournament.id ?? "";
                    const isEditing =
                      Boolean(id) && editingTournamentId === id;
                    const draft = id ? editDraftById[id] : undefined;
                    const isSaving =
                      Boolean(id) && savingTournamentId === id;
                    const disabled = isSaving;

                    return (
                      <TableRow key={tournament.id}>
                        <TableCell className="text-text-primary text-center">
                          {isEditing && draft ? (
                            <Popover
                              open={openDatePickerId === id}
                              onOpenChange={(open) =>
                                setOpenDatePickerId(open ? id : null)
                              }
                            >
                              <PopoverTrigger asChild disabled={disabled}>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-9 w-full justify-between font-normal"
                                >
                                  {draft.date
                                    ? new Date(draft.date).toLocaleDateString(
                                        "pt-BR",
                                      )
                                    : "Selecione uma data"}
                                  <ChevronDownIcon className="size-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={
                                    draft.date
                                      ? new Date(draft.date)
                                      : undefined
                                  }
                                  captionLayout="dropdown"
                                  onSelect={(date) => {
                                    if (date) {
                                      const now = new Date();
                                      date.setHours(now.getHours());
                                      date.setMinutes(now.getMinutes());
                                      date.setSeconds(now.getSeconds());
                                      date.setMilliseconds(
                                        now.getMilliseconds(),
                                      );
                                      onChangeEditDraft(id, {
                                        date: date.toISOString(),
                                      });
                                    } else {
                                      onChangeEditDraft(id, { date: "" });
                                    }
                                    setOpenDatePickerId(null);
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            convertIsoDateToBr(tournament.date)
                          )}
                        </TableCell>
                        <TableCell className="text-text-primary text-center">
                          {isEditing && draft ? (
                            <Input
                              value={draft.platform}
                              onChange={(e) =>
                                onChangeEditDraft(id, {
                                  platform: e.target.value,
                                })
                              }
                              disabled={disabled}
                              className="h-9 text-text-primary"
                            />
                          ) : (
                            tournament.platform
                          )}
                        </TableCell>
                        <TableCell className="text-text-primary text-center">
                          {isEditing && draft ? (
                            <Input
                              value={draft.name}
                              onChange={(e) =>
                                onChangeEditDraft(id, { name: e.target.value })
                              }
                              disabled={disabled}
                              className="h-9 text-text-primary"
                            />
                          ) : (
                            tournament.name
                          )}
                        </TableCell>
                        <TableCell className="text-text-primary text-center">
                          {isEditing && draft ? (
                            <Input
                              value={draft.currency}
                              onChange={(e) =>
                                onChangeEditDraft(id, {
                                  currency: e.target.value,
                                })
                              }
                              disabled={disabled}
                              className="h-9 text-text-primary"
                            />
                          ) : (
                            tournament.currency
                          )}
                        </TableCell>
                        <TableCell className="text-text-primary text-center">
                          {isEditing && draft ? (
                            <Input
                              type="text"
                              value={String(draft.buyIn)}
                              onChange={(e) =>
                                onChangeEditDraft(id, {
                                  buyIn: e.target.value,
                                })
                              }
                              disabled={disabled}
                              className="h-9 text-text-primary"
                            />
                          ) : String(tournament.buyIn).toLowerCase() === "ticket" ? (
                            <>ticket</>
                          ) : (
                            <>$ {Number(tournament.buyIn).toFixed(2)}</>
                          )}
                        </TableCell>
                        <TableCell className="text-text-primary text-center">
                          {isEditing && draft ? (
                            <Input
                              type="text"
                              value={String(draft.result)}
                              onChange={(e) =>
                                onChangeEditDraft(id, {
                                  result: e.target.value,
                                })
                              }
                              disabled={disabled}
                              className="h-9 text-text-primary"
                            />
                          ) : String(tournament.result).toLowerCase() === "ticket" ? (
                            <>ticket</>
                          ) : (
                            <>$ {Number(tournament.result).toFixed(2)}</>
                          )}
                        </TableCell>
                        <TableCell
                          className={`${
                            (tournament.profit ?? 0) > 0
                              ? "text-green-500"
                              : "text-red-500"
                          } text-center`}
                        >
                          $ {tournament.profit?.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-text-primary text-center">
                          {isEditing && draft ? (
                            <div className="flex justify-center">
                              <button
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                  onChangeEditDraft(id, {
                                    itm: !draft.itm,
                                    position: draft.itm ? "" : draft.position,
                                  })
                                }
                                className={`h-8 w-14 rounded-md border text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                                  draft.itm
                                    ? "border-success bg-success/20 text-success"
                                    : "border-input bg-transparent text-muted-foreground"
                                }`}
                              >
                                {draft.itm && <Check className="size-3" />}
                                {draft.itm ? "Sim" : "Não"}
                              </button>
                            </div>
                          ) : tournament.itm ? (
                            <Check className="size-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="size-4 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-text-primary text-center">
                          {isEditing && draft ? (
                            <div className="flex justify-center">
                              <button
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                  onChangeEditDraft(id, {
                                    hasFt: !draft.hasFt,
                                  })
                                }
                                className={`h-8 w-14 rounded-md border text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                                  draft.hasFt
                                    ? "border-success bg-success/20 text-success"
                                    : "border-input bg-transparent text-muted-foreground"
                                }`}
                              >
                                {draft.hasFt && <Check className="size-3" />}
                                {draft.hasFt ? "Sim" : "Não"}
                              </button>
                            </div>
                          ) : tournament.hasFt ? (
                            <Check className="size-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="size-4 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-text-primary text-center">
                          {isEditing && draft ? (
                            <Input
                              type="number"
                              min={1}
                              value={draft.position}
                              onChange={(e) =>
                                onChangeEditDraft(id, {
                                  position: e.target.value,
                                })
                              }
                              disabled={disabled || !draft.itm}
                              className="h-9 text-text-primary w-20 mx-auto"
                            />
                          ) : (
                            tournament.position ?? "-"
                          )}
                        </TableCell>
                        <TableCell className="text-text-primary text-center flex gap-2 justify-around">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={disabled}
                                onClick={() =>
                                  onSaveEditTournament(tournament)
                                }
                                aria-label="Salvar edição do torneio"
                              >
                                <Check className="size-4" />
                              </button>
                              <button
                                type="button"
                                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={disabled}
                                onClick={() => onCancelEditTournament(id)}
                                aria-label="Cancelar edição do torneio"
                              >
                                <X className="size-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="cursor-pointer"
                              onClick={() => onStartEditTournament(tournament)}
                              aria-label="Editar torneio"
                            >
                              <Edit className="size-4" />
                            </button>
                          )}
                          <div className="cursor-pointer">
                            <Trash
                              className="size-4"
                              color="red"
                              onClick={() =>
                                onSelectTournamentToDelete(
                                  tournament.id ?? null,
                                )
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
        <ImportScheduleModal
          isOpen={isImportScheduleModalOpen}
          isLoading={isImportingSchedule}
          onRequestClose={onCloseImportScheduleModal}
          onConfirm={onConfirmImportSchedule}
        />
      </div>
    </div>
  );
}
