"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { TournamentScheduleItem } from "@/services/hooks/schedule.types";
import { Check, Plus, Trash, Edit, X } from "lucide-react";
import { ScheduleForm } from "./components/scheduleForm";
import { DeleteScheduleModal } from "./components/deleteScheduleModal";
import { useScheduleViewModel } from "./schedule.viewmodel";

export function ScheduleView() {
  const {
    activeTab,
    onTabChange,

    isLoadingSchedules,
    schedules,
    activeScheduleId,
    onSelectSchedule,

    newScheduleName,
    isCreatingScheduleForm,
    isCreatingSchedule,
    onNewScheduleNameChange,
    onStartCreateSchedule,
    onCancelCreateSchedule,
    onConfirmCreateSchedule,

    scheduleToDelete,
    onSelectScheduleToDelete,
    onConfirmDeleteSchedule,

    isLoadingItems,
    total,
    totalBuyIns,
    totalBuyInsBrl,
    list,
    buyInSummary,
    platformSummary,

    selectedItemId,
    editingItemId,
    savingItemId,
    editDraftById,

    onSelectItemToDelete,
    onConfirmDeleteItem,
    onCloseDeleteItemModal,

    onStartEditItem,
    onChangeEditDraft,
    onCancelEditItem,
    onSaveEditItem,
  } = useScheduleViewModel();

  const activeSchedule = schedules.find((s) => s.id === activeScheduleId);

  return (
    <div>
      <div className="flex flex-col justify-center w-[80%] mx-auto mt-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-text-primary text-2xl font-bold">Grade</h2>
            <div className="flex gap-1 p-1 rounded-xl bg-secondary w-fit">
              {(
                [
                  { value: "WEEKLY", label: "Semanal" },
                  { value: "SUNDAY", label: "Domingo" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onTabChange(tab.value)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === tab.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {activeScheduleId && total > 0 && (
            <div className="flex flex-col items-end gap-1 mt-1">
              <p className="text-text-secondary text-sm">
                Total: {total} torneio{total !== 1 ? "s" : ""}
              </p>
              <p className="text-text-secondary text-sm">
                Total Buy-ins: $ {totalBuyIns.toFixed(2)}
                {totalBuyInsBrl && (
                  <span className="text-text-secondary/70">
                    {" "}
                    ({totalBuyInsBrl})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="glass-panel rounded-3xl p-4 mb-6">
          {isLoadingSchedules ? (
            <p className="text-text-secondary text-sm animate-pulse">
              Carregando grades...
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {schedules.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
                    s.id === activeScheduleId
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border bg-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <button
                    type="button"
                    className="text-sm font-medium cursor-pointer"
                    onClick={() => onSelectSchedule(s.id)}
                  >
                    {s.name}
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer text-text-secondary hover:text-red-400 transition-colors"
                    onClick={() => onSelectScheduleToDelete(s)}
                    aria-label={`Remover grade ${s.name}`}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              {isCreatingScheduleForm ? (
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    onConfirmCreateSchedule();
                  }}
                >
                  <Input
                    autoFocus
                    value={newScheduleName}
                    onChange={(e) => onNewScheduleNameChange(e.target.value)}
                    placeholder="Nome da grade"
                    className="h-8 w-40 text-sm text-text-primary"
                    disabled={isCreatingSchedule}
                  />
                  <button
                    type="submit"
                    disabled={isCreatingSchedule || !newScheduleName.trim()}
                    className="cursor-pointer disabled:opacity-40 text-text-primary"
                    aria-label="Confirmar criação"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onCancelCreateSchedule}
                    className="cursor-pointer text-text-secondary"
                    aria-label="Cancelar"
                  >
                    <X className="size-4" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={onStartCreateSchedule}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors text-sm cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  Nova grade
                </button>
              )}
            </div>
          )}
        </div>

        {!activeScheduleId ? (
          <div className="text-center text-text-secondary text-sm py-12">
            {schedules.length === 0
              ? "Crie uma grade para começar."
              : "Selecione uma grade acima para ver e gerenciar os torneios."}
          </div>
        ) : (
          <>
            {activeSchedule && (
              <p className="text-text-secondary text-xs uppercase tracking-widest mb-3">
                {activeSchedule.name}
              </p>
            )}

            <div className="glass-panel mb-6 rounded-3xl p-6">
              <ScheduleForm scheduleId={activeScheduleId} />
            </div>

            <div className="glass-panel mt-2 overflow-hidden rounded-3xl p-1">
              <div className="glass-inner rounded-2xl p-4 overflow-y-auto max-h-[60vh]">
                {isLoadingItems ? (
                  <p className="text-text-secondary text-sm text-center animate-pulse py-4">
                    Carregando...
                  </p>
                ) : (
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
                      {list.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-text-primary text-center"
                          >
                            Nenhum torneio na grade
                          </TableCell>
                        </TableRow>
                      ) : (
                        list.map((row: TournamentScheduleItem) => {
                          const id = row.id ?? "";
                          const isEditing = Boolean(id) && editingItemId === id;
                          const draft = id ? editDraftById[id] : undefined;
                          const isSaving = Boolean(id) && savingItemId === id;
                          const disabled = isSaving;

                          return (
                            <TableRow key={row.id}>
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
                                      onChangeEditDraft(id, {
                                        name: e.target.value,
                                      })
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
                                      onClick={() => onSaveEditItem(row)}
                                      aria-label="Salvar"
                                    >
                                      <Check className="size-4" />
                                    </button>
                                    <button
                                      type="button"
                                      className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                      disabled={disabled}
                                      onClick={() => onCancelEditItem(id)}
                                      aria-label="Cancelar"
                                    >
                                      <X className="size-4" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    className="cursor-pointer"
                                    onClick={() => onStartEditItem(row)}
                                    aria-label="Editar"
                                  >
                                    <Edit className="size-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    onSelectItemToDelete(row.id ?? null)
                                  }
                                  aria-label="Remover"
                                >
                                  <Trash className="size-4" color="red" />
                                </button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>

            {(buyInSummary.length > 0 || platformSummary.length > 0) && (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {buyInSummary.length > 0 && (
                  <div className="glass-panel rounded-3xl p-4">
                    <p className="text-text-secondary text-xs uppercase tracking-widest mb-3">
                      Resumo por Buy-in
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-text-primary text-center">
                            Buy-in
                          </TableHead>
                          <TableHead className="text-text-primary text-center">
                            Quantidade
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {buyInSummary.map(({ buyIn, count }) => (
                          <TableRow key={buyIn}>
                            <TableCell className="text-text-primary text-center">
                              $ {buyIn.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-text-primary text-center">
                              {count}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {platformSummary.length > 0 && (
                  <div className="glass-panel rounded-3xl p-4">
                    <p className="text-text-secondary text-xs uppercase tracking-widest mb-3">
                      Resumo por Plataforma
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-text-primary text-center">
                            Plataforma
                          </TableHead>
                          <TableHead className="text-text-primary text-center">
                            Quantidade
                          </TableHead>
                          <TableHead className="text-text-primary text-center">
                            Total Buy-ins
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {platformSummary.map(
                          ({ platform, count, totalBuyIn }) => (
                            <TableRow key={platform}>
                              <TableCell className="text-text-primary text-center">
                                {platform}
                              </TableCell>
                              <TableCell className="text-text-primary text-center">
                                {count}
                              </TableCell>
                              <TableCell className="text-text-primary text-center">
                                $ {totalBuyIn.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <DeleteScheduleModal
          isOpen={selectedItemId !== null}
          onRequestClose={onCloseDeleteItemModal}
          onDelete={onConfirmDeleteItem}
        />

        <DeleteScheduleModal
          isOpen={scheduleToDelete !== null}
          description={`Deletar a grade "${scheduleToDelete?.name}" também remove todos os torneios cadastrados nela.`}
          onRequestClose={() => onSelectScheduleToDelete(null)}
          onDelete={onConfirmDeleteSchedule}
        />
      </div>
    </div>
  );
}
