import { renderHook, act } from "@testing-library/react";
import { useCareerViewModel } from "../career.viewmodel";
import { useGetUser } from "@/services/hooks/useGetUser";
import { useStats } from "@/services/hooks/useStats";
import { useCurrency } from "@/services/hooks/useCurrency";
import type { Tournament } from "@/services/hooks/types";

jest.mock("@/services/hooks/useGetUser");
jest.mock("@/services/hooks/useStats");
jest.mock("@/services/hooks/useCurrency");

const mockUseGetUser = useGetUser as jest.MockedFunction<typeof useGetUser>;
const mockUseStats = useStats as jest.MockedFunction<typeof useStats>;
const mockUseCurrency = useCurrency as jest.MockedFunction<typeof useCurrency>;

function makeUser(bankOverrides: Partial<{ bank: number; profit: number }> = {}) {
  return {
    name: "Test",
    email: "test@example.com",
    bank: {
      id: "b1",
      userId: "u1",
      bank: 0,
      totalDeposit: 0,
      totalWithdrawal: 0,
      totalRake: 0,
      profit: 0,
      deposits: [],
      withdrawals: [],
      rakes: [],
      ...bankOverrides,
    },
  };
}

function makeStatsResult(tournaments: Tournament[] = [], isPending = false) {
  return {
    getAllTournamentsForStats: {
      data: { data: { data: tournaments, totalPages: 1, total: tournaments.length } },
      isPending,
    },
  };
}

function makeTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: "t1",
    date: "2026-05-01",
    platform: "PokerStars",
    name: "Test Tournament",
    currency: "USD",
    buyIn: 10,
    result: 20,
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();

  mockUseGetUser.mockReturnValue({ data: makeUser() as any, isLoading: false } as any);
  mockUseStats.mockReturnValue(makeStatsResult() as any);
  mockUseCurrency.mockReturnValue({ currencies: { data: { rates: {} } } } as any);
});

describe("useCareerViewModel — isLoading", () => {
  it("isLoading é true quando userLoading é true", () => {
    mockUseGetUser.mockReturnValue({ data: undefined, isLoading: true } as any);

    const { result } = renderHook(() => useCareerViewModel());

    expect(result.current.isLoading).toBe(true);
  });

  it("isLoading é true quando tournamentsLoading é true", () => {
    mockUseStats.mockReturnValue(makeStatsResult([], true) as any);

    const { result } = renderHook(() => useCareerViewModel());

    expect(result.current.isLoading).toBe(true);
  });

  it("isLoading é false quando ambos carregaram", () => {
    const { result } = renderHook(() => useCareerViewModel());

    expect(result.current.isLoading).toBe(false);
  });
});

describe("useCareerViewModel — totalTournaments", () => {
  it("totalTournaments é zero sem torneios", () => {
    const { result } = renderHook(() => useCareerViewModel());

    expect(result.current.totalTournaments).toBe(0);
  });

  it("totalTournaments reflete o número de torneios carregados", () => {
    mockUseStats.mockReturnValue(
      makeStatsResult([makeTournament(), makeTournament({ id: "t2" })]) as any,
    );

    const { result } = renderHook(() => useCareerViewModel());

    expect(result.current.totalTournaments).toBe(2);
  });
});

describe("useCareerViewModel — stakesProgression", () => {
  it("stakesProgression é null quando banca é zero", () => {
    const { result } = renderHook(() => useCareerViewModel());

    expect(result.current.stakesProgression).toBeNull();
  });

  it("stakesProgression não é null quando banca é positiva", () => {
    mockUseGetUser.mockReturnValue({
      data: makeUser({ bank: 1100, profit: 0 }) as any,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useCareerViewModel());

    expect(result.current.stakesProgression).not.toBeNull();
  });

  it("stakesProgression.bankUsd reflete bank - profit + lucro dos torneios", () => {
    mockUseGetUser.mockReturnValue({
      data: makeUser({ bank: 1100, profit: 100 }) as any,
      isLoading: false,
    } as any);
    mockUseStats.mockReturnValue(
      makeStatsResult([makeTournament({ buyIn: 10, result: 20 })]) as any,
    );

    const { result } = renderHook(() => useCareerViewModel());

    expect(result.current.stakesProgression?.bankUsd).toBe(1100 - 100 + 10);
  });

  it("stakesProgression.progressToNextLow está entre 0 e 100", () => {
    mockUseGetUser.mockReturnValue({
      data: makeUser({ bank: 1100, profit: 0 }) as any,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useCareerViewModel());

    const progress = result.current.stakesProgression?.progressToNextLow ?? -1;
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });
});

describe("useCareerViewModel — milestones", () => {
  it("milestones é vazio sem torneios", () => {
    const { result } = renderHook(() => useCareerViewModel());

    expect(result.current.milestones).toHaveLength(0);
  });

  it("adiciona marco 'Primeiro torneio' com qualquer torneio", () => {
    mockUseStats.mockReturnValue(
      makeStatsResult([makeTournament({ name: "Sunday Millions" })]) as any,
    );

    const { result } = renderHook(() => useCareerViewModel());

    const first = result.current.milestones.find((m) => m.id === "first");
    expect(first).toBeDefined();
    expect(first?.label).toBe("Primeiro torneio");
    expect(first?.sublabel).toBe("Sunday Millions");
  });

  it("adiciona marco 'Primeiro ITM' quando há torneio com itm=true", () => {
    mockUseStats.mockReturnValue(
      makeStatsResult([
        makeTournament({ name: "Torneio A", itm: false }),
        makeTournament({ id: "t2", name: "Torneio B", itm: true }),
      ]) as any,
    );

    const { result } = renderHook(() => useCareerViewModel());

    const itmMilestone = result.current.milestones.find((m) => m.id === "first_itm");
    expect(itmMilestone).toBeDefined();
    expect(itmMilestone?.sublabel).toBe("Torneio B");
  });

  it("não adiciona marco ITM quando nenhum torneio tem itm=true", () => {
    mockUseStats.mockReturnValue(
      makeStatsResult([makeTournament({ itm: false })]) as any,
    );

    const { result } = renderHook(() => useCareerViewModel());

    expect(result.current.milestones.find((m) => m.id === "first_itm")).toBeUndefined();
  });

  it("adiciona marco 'Maior vitória' com o lucro correto", () => {
    mockUseStats.mockReturnValue(
      makeStatsResult([
        makeTournament({ buyIn: 10, result: 50 }),
        makeTournament({ id: "t2", buyIn: 10, result: 20 }),
      ]) as any,
    );

    const { result } = renderHook(() => useCareerViewModel());

    const bigWin = result.current.milestones.find((m) => m.id === "biggest_win");
    expect(bigWin).toBeDefined();
    expect(bigWin?.value).toBe(40);
  });

  it("adiciona marco 'Primeira final table' quando hasFt=true", () => {
    mockUseStats.mockReturnValue(
      makeStatsResult([makeTournament({ hasFt: true, name: "FT Event" })]) as any,
    );

    const { result } = renderHook(() => useCareerViewModel());

    const ftMilestone = result.current.milestones.find((m) => m.id === "first_ft");
    expect(ftMilestone).toBeDefined();
    expect(ftMilestone?.sublabel).toBe("FT Event");
  });

  it("milestones são ordenados por data crescente", () => {
    mockUseStats.mockReturnValue(
      makeStatsResult([
        makeTournament({ id: "t1", date: "2026-05-10", itm: true }),
        makeTournament({ id: "t2", date: "2026-05-01" }),
      ]) as any,
    );

    const { result } = renderHook(() => useCareerViewModel());

    const dates = result.current.milestones.map((m) => m.date);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  it("adiciona marco de 10º torneio quando há 10 ou mais torneios", () => {
    const tournaments = Array.from({ length: 10 }, (_, i) =>
      makeTournament({ id: `t${i}`, date: `2026-05-${String(i + 1).padStart(2, "0")}`, name: `T${i}` }),
    );
    mockUseStats.mockReturnValue(makeStatsResult(tournaments) as any);

    const { result } = renderHook(() => useCareerViewModel());

    expect(result.current.milestones.find((m) => m.id === "t10")).toBeDefined();
  });
});

describe("useCareerViewModel — staking deals", () => {
  it("stakingDeals começa vazio", () => {
    const { result } = renderHook(() => useCareerViewModel());

    expect(result.current.stakingDeals).toHaveLength(0);
  });

  it("onNewDealChange atualiza campos do newDealState", () => {
    const { result } = renderHook(() => useCareerViewModel());

    act(() => result.current.onNewDealChange("backerName", "João"));
    act(() => result.current.onNewDealChange("myPct", "50"));

    expect(result.current.newDealState.backerName).toBe("João");
    expect(result.current.newDealState.myPct).toBe("50");
  });

  it("onAddStakingDeal adiciona um deal válido e limpa o formulário", () => {
    const { result } = renderHook(() => useCareerViewModel());

    act(() => result.current.onNewDealChange("backerName", "Backer X"));
    act(() => result.current.onNewDealChange("myPct", "60"));
    act(() => result.current.onAddStakingDeal());

    expect(result.current.stakingDeals).toHaveLength(1);
    expect(result.current.stakingDeals[0].backerName).toBe("Backer X");
    expect(result.current.stakingDeals[0].myPct).toBe(60);
    expect(result.current.newDealState.backerName).toBe("");
    expect(result.current.newDealState.myPct).toBe("");
  });

  it("onAddStakingDeal não adiciona quando backerName está vazio", () => {
    const { result } = renderHook(() => useCareerViewModel());

    act(() => result.current.onNewDealChange("backerName", ""));
    act(() => result.current.onNewDealChange("myPct", "50"));
    act(() => result.current.onAddStakingDeal());

    expect(result.current.stakingDeals).toHaveLength(0);
  });

  it("onAddStakingDeal não adiciona quando myPct é inválido (> 100)", () => {
    const { result } = renderHook(() => useCareerViewModel());

    act(() => result.current.onNewDealChange("backerName", "Backer"));
    act(() => result.current.onNewDealChange("myPct", "150"));
    act(() => result.current.onAddStakingDeal());

    expect(result.current.stakingDeals).toHaveLength(0);
  });

  it("onAddStakingDeal não adiciona quando myPct é zero", () => {
    const { result } = renderHook(() => useCareerViewModel());

    act(() => result.current.onNewDealChange("backerName", "Backer"));
    act(() => result.current.onNewDealChange("myPct", "0"));
    act(() => result.current.onAddStakingDeal());

    expect(result.current.stakingDeals).toHaveLength(0);
  });

  it("onRemoveStakingDeal remove o deal pelo id", () => {
    const { result } = renderHook(() => useCareerViewModel());

    act(() => result.current.onNewDealChange("backerName", "Backer X"));
    act(() => result.current.onNewDealChange("myPct", "50"));
    act(() => result.current.onAddStakingDeal());

    const id = result.current.stakingDeals[0].id;

    act(() => result.current.onRemoveStakingDeal(id));

    expect(result.current.stakingDeals).toHaveLength(0);
  });

  it("markup padrão é 1 quando não informado", () => {
    const { result } = renderHook(() => useCareerViewModel());

    act(() => result.current.onNewDealChange("backerName", "Backer"));
    act(() => result.current.onNewDealChange("myPct", "50"));
    act(() => result.current.onAddStakingDeal());

    expect(result.current.stakingDeals[0].markup).toBe(1);
  });

  it("persiste deals no localStorage ao adicionar", () => {
    const { result } = renderHook(() => useCareerViewModel());

    act(() => result.current.onNewDealChange("backerName", "Backer"));
    act(() => result.current.onNewDealChange("myPct", "50"));
    act(() => result.current.onAddStakingDeal());

    const stored = JSON.parse(localStorage.getItem("pktracker:staking-deals") ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].backerName).toBe("Backer");
  });
});
