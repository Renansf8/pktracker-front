import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ScheduleViewProps } from "./schedule.types";
import type { ScheduleTournament } from "@/services/hooks/schedule.types";
import { Check, Edit, Trash, X } from "lucide-react";
import { ScheduleForm } from "./components/scheduleForm";
import { DeleteScheduleModal } from "./components/deleteScheduleModal";

export function ScheduleView({
  isLoading,
  total,
  totalBuyIns,
  totalPages,
  currentPage,
  currentPageData,
  paginationPages,
  selectedScheduleId,
  editingScheduleId,
  savingScheduleId,
  editDraftById,
  onPageChange,
  onSelectScheduleToDelete,
  onConfirmDelete,
  onCloseDeleteModal,
  onStartEditSchedule,
  onChangeEditDraft,
  onCancelEditSchedule,
  onSaveEditSchedule,
}: ScheduleViewProps) {
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className="flex flex-col justify-center w-[80%] mx-auto mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-text-primary text-2xl font-bold">Grade</h2>
          {total > 0 && (
            <div className="flex flex-col items-end gap-1">
              <p className="text-text-secondary text-sm">
                Total: {total} torneio{total !== 1 ? "s" : ""}
              </p>
              <p className="text-text-secondary text-sm">
                Total Buy-ins: $ {totalBuyIns.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <div className="glass-panel mb-6 rounded-3xl p-6">
          <ScheduleForm />
        </div>

        <div className="glass-panel mt-8 overflow-hidden rounded-3xl p-1">
          <div className="glass-inner rounded-2xl p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-text-primary text-center">
                    Horário
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
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPageData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-text-primary text-center"
                    >
                      Nenhum torneio na grade
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPageData.map((row: ScheduleTournament) => (
                    <TableRow key={row.id}>
                      {(() => {
                        const id = row.id ?? "";
                        const isEditing =
                          Boolean(id) && editingScheduleId === id;
                        const draft = id ? editDraftById[id] : undefined;
                        const isSaving = Boolean(id) && savingScheduleId === id;
                        const disabled = isSaving;

                        return (
                          <>
                            <TableCell className="text-text-primary text-center">
                              {isEditing && draft ? (
                                <Input
                                  type="time"
                                  value={draft.time}
                                  onChange={(e) =>
                                    onChangeEditDraft(id, {
                                      time: e.target.value,
                                    })
                                  }
                                  disabled={disabled}
                                  className="h-9 text-text-primary"
                                />
                              ) : (
                                row.time
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
                                row.platform
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
                                row.name
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
                                row.currency
                              )}
                            </TableCell>
                            <TableCell className="text-text-primary text-center">
                              {isEditing && draft ? (
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={String(draft.buyIn)}
                                  onChange={(e) =>
                                    onChangeEditDraft(id, {
                                      buyIn: e.target.value,
                                    })
                                  }
                                  disabled={disabled}
                                  className="h-9 text-text-primary"
                                />
                              ) : (
                                <>$ {Number(row.buyIn).toFixed(2)}</>
                              )}
                            </TableCell>
                            <TableCell className="text-text-primary text-center flex gap-2 justify-around">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={disabled}
                                    onClick={() => onSaveEditSchedule(row)}
                                    aria-label="Salvar edição"
                                  >
                                    <Check className="size-4" />
                                  </button>
                                  <button
                                    type="button"
                                    className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={disabled}
                                    onClick={() => onCancelEditSchedule(id)}
                                    aria-label="Cancelar edição"
                                  >
                                    <X className="size-4" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="cursor-pointer"
                                  onClick={() => onStartEditSchedule(row)}
                                  aria-label="Editar"
                                >
                                  <Edit className="size-4" />
                                </button>
                              )}
                              <div className="cursor-pointer">
                                <Trash
                                  className="size-4"
                                  color="red"
                                  onClick={() =>
                                    onSelectScheduleToDelete(row.id ?? null)
                                  }
                                />
                              </div>
                            </TableCell>
                          </>
                        );
                      })()}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 mb-6">
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <div className="flex gap-2">
                {paginationPages.map((p, idx) =>
                  p === "ellipsis" ? (
                    <span key={`e-${idx}`} className="text-text-secondary">
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === currentPage ? "secondary" : "outline"}
                      onClick={() => onPageChange(p)}
                    >
                      {p}
                    </Button>
                  ),
                )}
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  currentPage < totalPages && onPageChange(currentPage + 1)
                }
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}

        <DeleteScheduleModal
          isOpen={selectedScheduleId !== null}
          onRequestClose={onCloseDeleteModal}
          onDelete={onConfirmDelete}
        />
      </div>
    </div>
  );
}

