"use client";

import { useTournaments } from "@/services/hooks/useTournaments";
import { useCurrency } from "@/services/hooks/useCurrency";
import { useEffect, useMemo, useState } from "react";
import { ITEMS_PER_PAGE } from "./tournaments.types";
import type { TournamentsViewProps } from "./tournaments.types";
import type {
  Tournament,
  TournamentSpeed,
  TournamentType,
} from "@/services/hooks/types";
import {
  buildTournamentPatch,
  type TournamentEditDraft,
} from "@/utils/tournamentPatch";
import { getEurToUsdRate } from "@/utils/currencyConvert";
import { getTournamentLucroUsd } from "@/utils/tournamentLucro";


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
  const [nameInput, setNameInput] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<TournamentType | "">("");
  const [speed, setSpeed] = useState<TournamentSpeed | "">("");
  const [minBuyInInput, setMinBuyInInput] = useState("");
  const [maxBuyInInput, setMaxBuyInInput] = useState("");
  const [minBuyIn, setMinBuyIn] = useState<number | undefined>(undefined);
  const [maxBuyIn, setMaxBuyIn] = useState<number | undefined>(undefined);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(
    null,
  );
  const [savingTournamentId, setSavingTournamentId] = useState<string | null>(
    null,
  );
  const [editDraftById, setEditDraftById] = useState<
    Record<string, TournamentEditDraft | undefined>
  >({});
  const [isImportScheduleModalOpen, setIsImportScheduleModalOpen] =
    useState(false);
  const [isImportingSchedule, setIsImportingSchedule] = useState(false);
  const [tournamentToFinalize, setTournamentToFinalize] =
    useState<Tournament | null>(null);
  const [isFinalizingDay2, setIsFinalizingDay2] = useState(false);

  const {
    getAllTournaments,
    getDay2Tournaments,
    deleteTournament,
    updateTournament,
    applySchedule,
  } = useTournaments({
    platform,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    name,
    type,
    speed,
    minBuyIn,
    maxBuyIn,
  });
  const { currencies } = useCurrency();
  const eurToUsdRate = getEurToUsdRate(currencies?.data?.rates);
  const { data: tournaments, isLoading } = getAllTournaments;

  useEffect(() => {
    setCurrentPage(1);
  }, [platform, type, speed]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setName(nameInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [nameInput]);

  const applyBuyInFilter = () => {
    const parsedMin = minBuyInInput.trim() === "" ? undefined : Number(minBuyInInput);
    setMinBuyIn(
      parsedMin !== undefined && !Number.isNaN(parsedMin) ? parsedMin : undefined,
    );
    const parsedMax = maxBuyInInput.trim() === "" ? undefined : Number(maxBuyInInput);
    setMaxBuyIn(
      parsedMax !== undefined && !Number.isNaN(parsedMax) ? parsedMax : undefined,
    );
    setCurrentPage(1);
  };

  const responseData = tournaments?.data;
  const totalPages = responseData?.totalPages ?? 1;
  const total = responseData?.total ?? 0;
  const currentPageData = (responseData?.data ?? []) as Tournament[];

  const hasActiveFilter =
    platform !== "" ||
    name !== "" ||
    type !== "" ||
    speed !== "" ||
    minBuyIn !== undefined ||
    maxBuyIn !== undefined;
  const filteredProfit = hasActiveFilter
    ? (responseData?.totalProfit ??
        currentPageData.reduce(
          (sum: number, t: Tournament) => sum + getTournamentLucroUsd(t, eurToUsdRate),
          0,
        ))
    : null;

  const day2Response = getDay2Tournaments.data?.data;
  const day2Tournaments: Tournament[] = (day2Response?.data ?? []).filter(
    (t: Tournament) => t.hasSecondDay,
  );
  const isLoadingDay2 = getDay2Tournaments.isLoading;

  const paginationPages = useMemo(
    () => getPaginationPages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const clearFilter = () => {
    setPlatform("");
    setNameInput("");
    setName("");
    setType("");
    setSpeed("");
    setMinBuyInInput("");
    setMaxBuyInInput("");
    setMinBuyIn(undefined);
    setMaxBuyIn(undefined);
    setCurrentPage(1);
    setTimeout(() => {
      getAllTournaments.refetch();
    }, 0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onNameChange = (newName: string) => {
    setNameInput(newName);
  };

  const onPlatformChange = (newPlatform: string) => {
    setPlatform(newPlatform);
    setCurrentPage(1);
  };

  const onTypeChange = (newType: TournamentType | "") => {
    setType(newType);
  };

  const onSpeedChange = (newSpeed: TournamentSpeed | "") => {
    setSpeed(newSpeed);
  };

  const onMinBuyInChange = (value: string) => {
    setMinBuyInInput(value);
  };

  const onMaxBuyInChange = (value: string) => {
    setMaxBuyInInput(value);
  };

  const onConfirmDelete = () => {
    if (selectedTournamentId) {
      deleteTournament.mutate(selectedTournamentId);
    }
  };

  const onStartEditTournament = (tournament: Tournament) => {
    if (!tournament.id) return;
    setEditingTournamentId(tournament.id);
    setEditDraftById((prev) => ({
      ...prev,
      [tournament.id as string]: {
        date: String(tournament.date ?? ""),
        platform: String(tournament.platform ?? ""),
        name: String(tournament.name ?? ""),
        currency: String(tournament.currency ?? ""),
        buyIn: tournament.buyIn ?? 0,
        result: tournament.result ?? 0,
        itm: tournament.itm ?? false,
        hasFt: tournament.hasFt ?? false,
        hasSecondDay: tournament.hasSecondDay ?? false,
        position: tournament.position != null ? String(tournament.position) : "",
        type: tournament.type ?? "",
        speed: tournament.speed ?? "",
      },
    }));
  };

  const onChangeEditDraft = (
    id: string,
    patch: Partial<TournamentEditDraft>,
  ) => {
    setEditDraftById((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {
          date: "",
          platform: "",
          name: "",
          currency: "USD",
          buyIn: 0,
          result: 0,
          itm: false,
          hasFt: false,
          hasSecondDay: false,
          position: "",
          type: "",
          speed: "",
        }),
        ...patch,
      },
    }));
  };

  const onCancelEditTournament = (id: string) => {
    setEditingTournamentId((cur) => (cur === id ? null : cur));
    setSavingTournamentId((cur) => (cur === id ? null : cur));
    setEditDraftById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const onSaveEditTournament = (tournament: Tournament) => {
    const id = tournament.id;
    if (!id) return;
    const draft = editDraftById[id];
    if (!draft) return;

    const patch = buildTournamentPatch(tournament, draft);
    if (Object.keys(patch).length === 0) {
      onCancelEditTournament(id);
      return;
    }

    setSavingTournamentId(id);
    updateTournament.mutate(
      { id, data: patch },
      {
        onSettled: () =>
          setSavingTournamentId((cur) => (cur === id ? null : cur)),
        onSuccess: () => onCancelEditTournament(id),
      },
    );
  };

  const onConfirmFinalizeDay2 = (
    tournament: Tournament,
    finalizationDate: string,
    finalizationData: { result: number | "ticket"; itm: boolean; hasFt: boolean; position: number | null },
  ) => {
    const id = tournament.id;
    if (!id) return;

    setIsFinalizingDay2(true);
    updateTournament.mutate(
      {
        id,
        data: {
          hasSecondDay: false,
          date: finalizationDate,
          result: finalizationData.result,
          itm: finalizationData.itm,
          hasFt: finalizationData.hasFt,
          position: finalizationData.position,
        },
      },
      {
        onSettled: () => setIsFinalizingDay2(false),
        onSuccess: () => setTournamentToFinalize(null),
      },
    );
  };

  const onConfirmImportSchedule = (scheduleId: string) => {
    setIsImportingSchedule(true);
    applySchedule.mutate(scheduleId, {
      onSettled: () => setIsImportingSchedule(false),
      onSuccess: () => {
        setIsImportScheduleModalOpen(false);
        setCurrentPage(1);
      },
    });
  };

  return {
    isLoading,
    total,
    totalPages,
    currentPage,
    currentPageData,
    paginationPages,
    platform,
    nameInput,
    type,
    speed,
    minBuyInInput,
    maxBuyInInput,
    hasActiveFilter,
    filteredProfit,
    isOpenFilter,
    selectedTournamentId,
    editingTournamentId,
    editDraftById,
    savingTournamentId,
    eurToUsdRate,
    isImportScheduleModalOpen,
    isImportingSchedule,
    day2Tournaments,
    isLoadingDay2,
    tournamentToFinalize,
    isFinalizingDay2,
    onOpenFinalizeDay2Modal: setTournamentToFinalize,
    onCloseFinalizeDay2Modal: () => setTournamentToFinalize(null),
    onConfirmFinalizeDay2,
    onFilterToggle: () => setIsOpenFilter((prev) => !prev),
    onNameChange,
    onPlatformChange,
    onTypeChange,
    onSpeedChange,
    onMinBuyInChange,
    onMaxBuyInChange,
    onApplyBuyInFilter: applyBuyInFilter,
    onClearFilter: clearFilter,
    onPageChange: handlePageChange,
    onSelectTournamentToDelete: setSelectedTournamentId,
    onConfirmDelete,
    onCloseDeleteModal: () => setSelectedTournamentId(null),
    onOpenImportScheduleModal: () => setIsImportScheduleModalOpen(true),
    onCloseImportScheduleModal: () => setIsImportScheduleModalOpen(false),
    onConfirmImportSchedule,
    onStartEditTournament,
    onChangeEditDraft,
    onCancelEditTournament,
    onSaveEditTournament,
  };
}
