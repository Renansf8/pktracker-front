import { renderHook } from "@testing-library/react";
import { useAnalyticsViewModel } from "../analytics.viewmodel";
import { useGetUser } from "@/services/hooks/useGetUser";
import { useStats } from "@/services/hooks/useStats";
import { useCurrency } from "@/services/hooks/useCurrency";
import type { Tournament } from "@/services/hooks/types";
import type { Deposit } from "@/services/api/types";

jest.mock("@/services/hooks/useGetUser");
jest.mock("@/services/hooks/useStats");
jest.mock("@/services/hooks/useCurrency");

const mockUseGetUser = useGetUser as jest.MockedFunction<typeof useGetUser>;
const mockUseStats = useStats as jest.MockedFunction<typeof useStats>;
const mockUseCurrency = useCurrency as jest.MockedFunction<typeof useCurrency>;

const MONTH_NAMES_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function currentMonthDateStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-10`;
}

function makeTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: "t1",
    date: currentMonthDateStr(),
    platform: "PokerStars",
    name: "Test",
    currency: "USD",
    buyIn: 10,
    result: 20,
    itm: true,
    ...overrides,
  };
}

function makeUser(bankOverrides: Partial<{ bank: number; profit: number; deposits: Deposit[] }> = {}) {
  return {
    name: "João",
    email: "joao@example.com",
    bank: {
      id: "b1",
      userId: "u1",
      bank: 500,
      totalDeposit: 500,
      totalWithdrawal: 0,
      totalRake: 0,
      profit: 100,
      deposits: [] as Deposit[],
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

function makeCurrencies() {
  return { currencies: { data: { rates: {} } } };
}

beforeEach(() => {
  mockUseGetUser.mockReturnValue({ data: makeUser() as any, isLoading: false } as any);
  mockUseStats.mockReturnValue(makeStatsResult() as any);
  mockUseCurrency.mockReturnValue(makeCurrencies() as any);
});

describe("useAnalyticsViewModel — loading", () => {
  it("isLoading é true quando userLoading é true", () => {
    mockUseGetUser.mockReturnValue({ data: undefined, isLoading: true } as any);

    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.isLoading).toBe(true);
  });

  it("isLoading é true quando tournaments está carregando", () => {
    mockUseStats.mockReturnValue(makeStatsResult([], true) as any);

    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.isLoading).toBe(true);
  });

  it("isLoading é false quando ambos carregaram", () => {
    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.isLoading).toBe(false);
  });
});

describe("useAnalyticsViewModel — hasCurveData", () => {
  it("hasCurveData é false sem depósitos nem torneios", () => {
    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.hasCurveData).toBe(false);
  });

  it("hasCurveData é true quando há depósito", () => {
    mockUseGetUser.mockReturnValue({
      data: makeUser({ deposits: [{ id: "d1", date: "2026-01-15", amount: 200 }] }) as any,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.hasCurveData).toBe(true);
  });

  it("hasCurveData é true quando há torneios", () => {
    mockUseStats.mockReturnValue(makeStatsResult([makeTournament()]) as any);

    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.hasCurveData).toBe(true);
  });
});

describe("useAnalyticsViewModel — nomes de mês", () => {
  it("thisMonthName tem formato 'Mmm YYYY'", () => {
    const now = new Date();
    const expected = `${MONTH_NAMES_PT[now.getMonth()]} ${now.getFullYear()}`;

    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.thisMonthName).toBe(expected);
  });

  it("lastMonthName corresponde ao mês anterior", () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const expected = `${MONTH_NAMES_PT[lastMonth.getMonth()]} ${lastMonth.getFullYear()}`;

    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.lastMonthName).toBe(expected);
  });
});

describe("useAnalyticsViewModel — currentBalance", () => {
  it("currentBalance = bank - profit + lucro dos torneios", () => {
    mockUseGetUser.mockReturnValue({
      data: makeUser({ bank: 500, profit: 100 }) as any,
      isLoading: false,
    } as any);
    mockUseStats.mockReturnValue(
      makeStatsResult([makeTournament({ buyIn: 10, result: 30 })]) as any,
    );

    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.currentBalance).toBe(500 - 100 + 20);
  });

  it("currentBalance com banco e profit zerados resulta só no lucro dos torneios", () => {
    mockUseGetUser.mockReturnValue({
      data: makeUser({ bank: 0, profit: 0 }) as any,
      isLoading: false,
    } as any);
    mockUseStats.mockReturnValue(
      makeStatsResult([makeTournament({ buyIn: 5, result: 15 })]) as any,
    );

    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.currentBalance).toBe(10);
  });
});

describe("useAnalyticsViewModel — thisMonth stats", () => {
  it("count reflete número de torneios no mês atual", () => {
    mockUseStats.mockReturnValue(
      makeStatsResult([makeTournament(), makeTournament({ id: "t2" })]) as any,
    );

    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.thisMonth.count).toBe(2);
  });

  it("profit soma o lucro líquido em USD dos torneios do mês", () => {
    mockUseStats.mockReturnValue(
      makeStatsResult([
        makeTournament({ buyIn: 10, result: 25 }),
        makeTournament({ id: "t2", buyIn: 10, result: 15 }),
      ]) as any,
    );

    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.thisMonth.profit).toBe(20);
  });

  it("roi é 0 quando não há torneios no mês", () => {
    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.thisMonth.roi).toBe(0);
    expect(result.current.thisMonth.count).toBe(0);
  });

  it("itmPct reflete percentual de torneios com itm=true", () => {
    mockUseStats.mockReturnValue(
      makeStatsResult([
        makeTournament({ itm: true }),
        makeTournament({ id: "t2", itm: false }),
      ]) as any,
    );

    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.thisMonth.itmPct).toBe(50);
  });
});

describe("useAnalyticsViewModel — heatmap", () => {
  it("heatmap sempre tem 7 entradas (uma por dia da semana)", () => {
    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.heatmap).toHaveLength(7);
  });

  it("labels do heatmap são os dias da semana em PT", () => {
    const { result } = renderHook(() => useAnalyticsViewModel());

    const labels = result.current.heatmap.map((e) => e.day);
    expect(labels).toEqual(["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]);
  });

  it("avg e count são 0 para dias sem torneios", () => {
    const { result } = renderHook(() => useAnalyticsViewModel());

    result.current.heatmap.forEach((e) => {
      expect(e.avg).toBe(0);
      expect(e.count).toBe(0);
    });
  });
});

describe("useAnalyticsViewModel — streaks", () => {
  it("streaks neutros com dados vazios", () => {
    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.streaks).toEqual({
      maxWinStreak: 0,
      maxLossStreak: 0,
      currentStreak: 0,
      currentStreakType: "neutral",
    });
  });

  it("sequência de vitória com dias lucrativos consecutivos", () => {
    mockUseStats.mockReturnValue(
      makeStatsResult([
        makeTournament({ date: "2026-05-01", buyIn: 10, result: 20 }),
        makeTournament({ id: "t2", date: "2026-05-02", buyIn: 10, result: 20 }),
        makeTournament({ id: "t3", date: "2026-05-03", buyIn: 10, result: 20 }),
      ]) as any,
    );

    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.streaks.maxWinStreak).toBe(3);
    expect(result.current.streaks.currentStreakType).toBe("win");
    expect(result.current.streaks.currentStreak).toBe(3);
  });

  it("sequência de derrota detectada corretamente", () => {
    mockUseStats.mockReturnValue(
      makeStatsResult([
        makeTournament({ date: "2026-05-01", buyIn: 20, result: 5 }),
        makeTournament({ id: "t2", date: "2026-05-02", buyIn: 20, result: 5 }),
      ]) as any,
    );

    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.streaks.maxLossStreak).toBe(2);
    expect(result.current.streaks.currentStreakType).toBe("loss");
  });

  it("currentStreak reseta ao encontrar dia de sinal oposto", () => {
    mockUseStats.mockReturnValue(
      makeStatsResult([
        makeTournament({ date: "2026-05-01", buyIn: 10, result: 20 }),
        makeTournament({ id: "t2", date: "2026-05-02", buyIn: 20, result: 5 }),
        makeTournament({ id: "t3", date: "2026-05-03", buyIn: 10, result: 20 }),
      ]) as any,
    );

    const { result } = renderHook(() => useAnalyticsViewModel());

    expect(result.current.streaks.maxWinStreak).toBe(1);
    expect(result.current.streaks.currentStreak).toBe(1);
    expect(result.current.streaks.currentStreakType).toBe("win");
  });
});
