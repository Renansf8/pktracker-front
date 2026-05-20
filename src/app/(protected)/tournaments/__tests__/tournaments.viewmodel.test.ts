import { renderHook, act } from "@testing-library/react";
import { useTournamentsViewModel } from "../tournaments.viewmodel";
import { useTournaments } from "@/services/hooks/useTournaments";
import { useCurrency } from "@/services/hooks/useCurrency";
import type { Tournament } from "@/services/hooks/types";

jest.mock("@/services/hooks/useTournaments");
jest.mock("@/services/hooks/useCurrency");

const mockUseTournaments = useTournaments as jest.MockedFunction<typeof useTournaments>;
const mockUseCurrency = useCurrency as jest.MockedFunction<typeof useCurrency>;

const mockRefetch = jest.fn();
const mockDeleteMutate = jest.fn();
const mockUpdateMutate = jest.fn();
const mockApplyScheduleMutate = jest.fn();

function makePaginated(
  tournaments: Tournament[] = [],
  opts: { total?: number; totalPages?: number; totalProfit?: number } = {},
) {
  return {
    data: tournaments,
    total: opts.total ?? tournaments.length,
    totalPages: opts.totalPages ?? 1,
    ...(opts.totalProfit !== undefined && { totalProfit: opts.totalProfit }),
  };
}

function makeTournamentsHook({
  data,
  isLoading = false,
  day2Data = [] as Tournament[],
  isLoadingDay2 = false,
} = {}) {
  return {
    getAllTournaments: {
      data: data !== undefined ? { data } : undefined,
      isLoading,
      refetch: mockRefetch,
    },
    getDay2Tournaments: {
      data: { data: { data: day2Data, total: day2Data.length, totalPages: 1 } },
      isLoading: isLoadingDay2,
    },
    deleteTournament: { mutate: mockDeleteMutate },
    updateTournament: { mutate: mockUpdateMutate },
    applySchedule: { mutate: mockApplyScheduleMutate },
  };
}

function makeTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: "t1",
    date: "2026-05-01T12:00:00.000Z",
    platform: "PokerStars",
    name: "Sunday Million",
    currency: "USD",
    buyIn: 10,
    result: 25,
    itm: false,
    hasFt: false,
    hasSecondDay: false,
    position: null,
    ...overrides,
  };
}

beforeAll(() => {
  window.scrollTo = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseTournaments.mockReturnValue(makeTournamentsHook({ data: makePaginated() }) as any);
  mockUseCurrency.mockReturnValue({ currencies: { data: { rates: {} } } } as any);
});

describe("useTournamentsViewModel — estado inicial", () => {
  it("isLoading é false quando dados carregaram", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.isLoading).toBe(false);
  });

  it("isLoading é true quando getAllTournaments.isLoading é true", () => {
    mockUseTournaments.mockReturnValue(makeTournamentsHook({ isLoading: true }) as any);

    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.isLoading).toBe(true);
  });

  it("total e currentPageData padrão são 0 e [] sem dados", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.total).toBe(0);
    expect(result.current.currentPageData).toEqual([]);
  });

  it("total e currentPageData refletem os dados da resposta", () => {
    const tournaments = [makeTournament(), makeTournament({ id: "t2" })];
    mockUseTournaments.mockReturnValue(
      makeTournamentsHook({ data: makePaginated(tournaments, { total: 2, totalPages: 1 }) }) as any,
    );

    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.total).toBe(2);
    expect(result.current.currentPageData).toHaveLength(2);
  });

  it("totalPages padrão é 1 quando não há dados", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.totalPages).toBe(1);
  });

  it("platform começa como string vazia", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.platform).toBe("");
  });

  it("nameInput começa como string vazia", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.nameInput).toBe("");
  });

  it("currentPage começa em 1", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.currentPage).toBe(1);
  });

  it("isOpenFilter começa como false", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.isOpenFilter).toBe(false);
  });

  it("selectedTournamentId começa como null", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.selectedTournamentId).toBeNull();
  });

  it("isImportScheduleModalOpen começa como false", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.isImportScheduleModalOpen).toBe(false);
  });

  it("editingTournamentId começa como null", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.editingTournamentId).toBeNull();
  });
});

describe("useTournamentsViewModel — hasActiveFilter / filteredProfit", () => {
  it("hasActiveFilter é false sem filtros ativos", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.hasActiveFilter).toBe(false);
  });

  it("filteredProfit é null sem filtros ativos", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.filteredProfit).toBeNull();
  });

  it("hasActiveFilter é true quando platform está definido", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onPlatformChange("PokerStars"));

    expect(result.current.hasActiveFilter).toBe(true);
  });

  it("filteredProfit usa totalProfit da resposta quando disponível", () => {
    mockUseTournaments.mockReturnValue(
      makeTournamentsHook({ data: makePaginated([], { totalProfit: 99.5 }) }) as any,
    );
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onPlatformChange("PokerStars"));

    expect(result.current.filteredProfit).toBe(99.5);
  });

  it("filteredProfit é calculado a partir dos torneios quando totalProfit não existe", () => {
    const tournaments = [
      makeTournament({ id: "t1", buyIn: 10, result: 30, currency: "USD" }),
      makeTournament({ id: "t2", buyIn: 10, result: 5, currency: "USD" }),
    ];
    mockUseTournaments.mockReturnValue(
      makeTournamentsHook({ data: makePaginated(tournaments) }) as any,
    );
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onPlatformChange("PokerStars"));

    expect(result.current.filteredProfit).toBe(15);
  });
});

describe("useTournamentsViewModel — paginationPages", () => {
  it("paginationPages é [] quando totalPages é 1", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.paginationPages).toEqual([]);
  });

  it("paginationPages inclui primeira e última página quando totalPages > 1", () => {
    mockUseTournaments.mockReturnValue(
      makeTournamentsHook({ data: makePaginated([], { totalPages: 5 }) }) as any,
    );

    const { result } = renderHook(() => useTournamentsViewModel());

    const pages = result.current.paginationPages;
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(5);
  });

  it("paginationPages inclui ellipsis quando há páginas intermediárias distantes", () => {
    mockUseTournaments.mockReturnValue(
      makeTournamentsHook({ data: makePaginated([], { totalPages: 10 }) }) as any,
    );

    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onPageChange(5));

    expect(result.current.paginationPages).toContain("ellipsis");
  });

  it("paginationPages não contém duplicatas", () => {
    mockUseTournaments.mockReturnValue(
      makeTournamentsHook({ data: makePaginated([], { totalPages: 3 }) }) as any,
    );

    const { result } = renderHook(() => useTournamentsViewModel());

    const numbers = result.current.paginationPages.filter((p) => p !== "ellipsis");
    const unique = new Set(numbers);
    expect(unique.size).toBe(numbers.length);
  });
});

describe("useTournamentsViewModel — filtros e navegação", () => {
  it("onFilterToggle alterna isOpenFilter de false para true", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onFilterToggle());

    expect(result.current.isOpenFilter).toBe(true);
  });

  it("onFilterToggle alterna isOpenFilter de true para false", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onFilterToggle());
    act(() => result.current.onFilterToggle());

    expect(result.current.isOpenFilter).toBe(false);
  });

  it("onPlatformChange atualiza platform", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onPlatformChange("GGPoker"));

    expect(result.current.platform).toBe("GGPoker");
  });

  it("onPlatformChange reseta currentPage para 1", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onPageChange(3));
    act(() => result.current.onPlatformChange("GGPoker"));

    expect(result.current.currentPage).toBe(1);
  });

  it("onNameChange atualiza nameInput imediatamente", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onNameChange("Sunday Million"));

    expect(result.current.nameInput).toBe("Sunday Million");
  });

  it("onNameChange debounce: hasActiveFilter é true após 400ms", () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onNameChange("Sunday"));
    expect(result.current.hasActiveFilter).toBe(false);

    act(() => jest.advanceTimersByTime(400));

    expect(result.current.hasActiveFilter).toBe(true);
    jest.useRealTimers();
  });

  it("onClearFilter reseta platform e nameInput", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onPlatformChange("PokerStars"));
    act(() => result.current.onNameChange("Sunday"));
    act(() => result.current.onClearFilter());

    expect(result.current.platform).toBe("");
    expect(result.current.nameInput).toBe("");
  });

  it("onClearFilter reseta currentPage para 1", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onPageChange(4));
    act(() => result.current.onClearFilter());

    expect(result.current.currentPage).toBe(1);
  });

  it("onPageChange atualiza currentPage", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onPageChange(3));

    expect(result.current.currentPage).toBe(3);
  });
});

describe("useTournamentsViewModel — modais e seleção", () => {
  it("onSelectTournamentToDelete define selectedTournamentId", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onSelectTournamentToDelete("t99"));

    expect(result.current.selectedTournamentId).toBe("t99");
  });

  it("onCloseDeleteModal reseta selectedTournamentId para null", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onSelectTournamentToDelete("t99"));
    act(() => result.current.onCloseDeleteModal());

    expect(result.current.selectedTournamentId).toBeNull();
  });

  it("onOpenImportScheduleModal define isImportScheduleModalOpen como true", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onOpenImportScheduleModal());

    expect(result.current.isImportScheduleModalOpen).toBe(true);
  });

  it("onCloseImportScheduleModal define isImportScheduleModalOpen como false", () => {
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onOpenImportScheduleModal());
    act(() => result.current.onCloseImportScheduleModal());

    expect(result.current.isImportScheduleModalOpen).toBe(false);
  });

  it("onOpenFinalizeDay2Modal define tournamentToFinalize", () => {
    const tournament = makeTournament({ id: "t1", hasSecondDay: true });
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onOpenFinalizeDay2Modal(tournament));

    expect(result.current.tournamentToFinalize).toEqual(tournament);
  });

  it("onCloseFinalizeDay2Modal reseta tournamentToFinalize para null", () => {
    const tournament = makeTournament({ hasSecondDay: true });
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onOpenFinalizeDay2Modal(tournament));
    act(() => result.current.onCloseFinalizeDay2Modal());

    expect(result.current.tournamentToFinalize).toBeNull();
  });
});

describe("useTournamentsViewModel — edição de torneio", () => {
  it("onStartEditTournament define editingTournamentId com o id do torneio", () => {
    const tournament = makeTournament({ id: "t42" });
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onStartEditTournament(tournament));

    expect(result.current.editingTournamentId).toBe("t42");
  });

  it("onStartEditTournament inicializa draft com os valores do torneio", () => {
    const tournament = makeTournament({ id: "t1", platform: "GGPoker", name: "Main Event", itm: true });
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onStartEditTournament(tournament));

    const draft = result.current.editDraftById["t1"];
    expect(draft?.platform).toBe("GGPoker");
    expect(draft?.name).toBe("Main Event");
    expect(draft?.itm).toBe(true);
  });

  it("onStartEditTournament não faz nada quando torneio não tem id", () => {
    const tournament = makeTournament({ id: undefined });
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onStartEditTournament(tournament));

    expect(result.current.editingTournamentId).toBeNull();
  });

  it("onChangeEditDraft atualiza campo específico do draft", () => {
    const tournament = makeTournament({ id: "t1" });
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onStartEditTournament(tournament));
    act(() => result.current.onChangeEditDraft("t1", { platform: "888poker" }));

    expect(result.current.editDraftById["t1"]?.platform).toBe("888poker");
  });

  it("onChangeEditDraft não afeta outros campos do draft", () => {
    const tournament = makeTournament({ id: "t1", name: "Sunday Million" });
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onStartEditTournament(tournament));
    act(() => result.current.onChangeEditDraft("t1", { platform: "888poker" }));

    expect(result.current.editDraftById["t1"]?.name).toBe("Sunday Million");
  });

  it("onCancelEditTournament limpa editingTournamentId", () => {
    const tournament = makeTournament({ id: "t1" });
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onStartEditTournament(tournament));
    act(() => result.current.onCancelEditTournament("t1"));

    expect(result.current.editingTournamentId).toBeNull();
  });

  it("onCancelEditTournament remove o draft do torneio", () => {
    const tournament = makeTournament({ id: "t1" });
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onStartEditTournament(tournament));
    act(() => result.current.onCancelEditTournament("t1"));

    expect(result.current.editDraftById["t1"]).toBeUndefined();
  });

  it("onSaveEditTournament chama updateTournament.mutate quando há mudanças no draft", () => {
    const tournament = makeTournament({ id: "t1", platform: "PokerStars" });
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onStartEditTournament(tournament));
    act(() => result.current.onChangeEditDraft("t1", { platform: "GGPoker" }));
    act(() => result.current.onSaveEditTournament(tournament));

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "t1", data: expect.objectContaining({ platform: "GGPoker" }) }),
      expect.any(Object),
    );
  });

  it("onSaveEditTournament cancela edição quando não há mudanças no draft", () => {
    const tournament = makeTournament({ id: "t1" });
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onStartEditTournament(tournament));
    act(() => result.current.onSaveEditTournament(tournament));

    expect(mockUpdateMutate).not.toHaveBeenCalled();
    expect(result.current.editingTournamentId).toBeNull();
  });

  it("onSaveEditTournament não faz nada quando não há draft para o torneio", () => {
    const tournament = makeTournament({ id: "t1" });
    const { result } = renderHook(() => useTournamentsViewModel());

    act(() => result.current.onSaveEditTournament(tournament));

    expect(mockUpdateMutate).not.toHaveBeenCalled();
  });
});

describe("useTournamentsViewModel — day2Tournaments", () => {
  it("day2Tournaments inclui apenas torneios com hasSecondDay=true", () => {
    const day2Data = [
      makeTournament({ id: "t1", hasSecondDay: true }),
      makeTournament({ id: "t2", hasSecondDay: false }),
      makeTournament({ id: "t3", hasSecondDay: true }),
    ];
    mockUseTournaments.mockReturnValue(
      makeTournamentsHook({ data: makePaginated(), day2Data }) as any,
    );

    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.day2Tournaments).toHaveLength(2);
    expect(result.current.day2Tournaments.every((t) => t.hasSecondDay)).toBe(true);
  });

  it("day2Tournaments é vazio quando não há torneios com hasSecondDay=true", () => {
    const day2Data = [makeTournament({ id: "t1", hasSecondDay: false })];
    mockUseTournaments.mockReturnValue(
      makeTournamentsHook({ data: makePaginated(), day2Data }) as any,
    );

    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.day2Tournaments).toHaveLength(0);
  });

  it("isLoadingDay2 reflete getDay2Tournaments.isLoading", () => {
    mockUseTournaments.mockReturnValue(
      makeTournamentsHook({ data: makePaginated(), isLoadingDay2: true }) as any,
    );

    const { result } = renderHook(() => useTournamentsViewModel());

    expect(result.current.isLoadingDay2).toBe(true);
  });
});
