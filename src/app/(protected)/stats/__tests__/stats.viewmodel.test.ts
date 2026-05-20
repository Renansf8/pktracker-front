import { renderHook } from "@testing-library/react";
import { useStatsViewModel } from "../stats.viewmodel";
import { useStats } from "@/services/hooks/useStats";
import type { Tournament, StatsSummary } from "@/services/hooks/types";

jest.mock("@/services/hooks/useStats");

const mockUseStats = useStats as jest.MockedFunction<typeof useStats>;

function makeSummary(): StatsSummary {
  return {
    biggestBuyIn: null,
    profitRecords: { day: null, week: null, month: null, year: null },
    lossRecords: { day: null, week: null, month: null, year: null },
    mostTournamentsInADay: null,
    highestAbiDay: null,
  };
}

function makeStatsHook({
  summary,
  tournaments = [],
  isLoading = false,
  isError = false,
}: {
  summary?: StatsSummary;
  tournaments?: Tournament[];
  isLoading?: boolean;
  isError?: boolean;
} = {}) {
  return {
    getStatsSummary: {
      data: summary !== undefined ? { data: summary } : undefined,
      isLoading,
      isError,
    },
    getAllTournamentsForStats: {
      data: { data: { data: tournaments, totalPages: 1, total: tournaments.length } },
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
    result: 30,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseStats.mockReturnValue(makeStatsHook({ summary: makeSummary() }) as any);
});

describe("useStatsViewModel — estados de requisição", () => {
  it("isLoading é true quando getStatsSummary.isLoading é true", () => {
    mockUseStats.mockReturnValue(makeStatsHook({ isLoading: true }) as any);

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.isLoading).toBe(true);
  });

  it("isLoading é false quando dados carregaram", () => {
    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.isLoading).toBe(false);
  });

  it("isError é true quando getStatsSummary.isError é true", () => {
    mockUseStats.mockReturnValue(makeStatsHook({ isError: true }) as any);

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.isError).toBe(true);
  });

  it("hasData é false quando summary é undefined", () => {
    mockUseStats.mockReturnValue(makeStatsHook() as any);

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.hasData).toBe(false);
  });

  it("hasData é true quando summary está definido", () => {
    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.hasData).toBe(true);
  });
});

describe("useStatsViewModel — totalTournaments / itmRate / ftRate / ticketCount", () => {
  it("totalTournaments é 0 sem torneios", () => {
    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.totalTournaments).toBe(0);
  });

  it("totalTournaments reflete o número de torneios", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [makeTournament(), makeTournament({ id: "t2" })],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.totalTournaments).toBe(2);
  });

  it("itmRate é 0 sem torneios", () => {
    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.itmRate).toBe(0);
  });

  it("itmRate é calculado como percentual de torneios com itm=true", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", itm: true }),
          makeTournament({ id: "t2", itm: false }),
          makeTournament({ id: "t3", itm: true }),
          makeTournament({ id: "t4", itm: false }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.itmRate).toBe(50);
  });

  it("ftRate é calculado como percentual de torneios com hasFt=true", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", hasFt: true }),
          makeTournament({ id: "t2", hasFt: false }),
          makeTournament({ id: "t3", hasFt: false }),
          makeTournament({ id: "t4", hasFt: false }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.ftRate).toBe(25);
  });

  it("ticketCount conta torneios com result 'ticket' (case-insensitive)", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", result: "ticket" }),
          makeTournament({ id: "t2", result: "TICKET" }),
          makeTournament({ id: "t3", result: 20 }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.ticketCount).toBe(2);
  });

  it("ticketCount é 0 quando nenhum torneio tem result 'ticket'", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [makeTournament()],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.ticketCount).toBe(0);
  });
});

describe("useStatsViewModel — profitBuckets", () => {
  it("retorna sempre 4 entradas (day, week, month, year)", () => {
    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.profitBuckets).toHaveLength(4);
    const ranges = result.current.profitBuckets.map((b) => b.range);
    expect(ranges).toEqual(["day", "week", "month", "year"]);
  });

  it("record é null quando não há torneio com lucro positivo", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [makeTournament({ buyIn: 10, result: 0 })],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    result.current.profitBuckets.forEach((bucket) => {
      expect(bucket.record).toBeNull();
    });
  });

  it("profit day record é preenchido com torneio lucrativo", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [makeTournament({ date: "2026-05-01", buyIn: 10, result: 30 })],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    const dayBucket = result.current.profitBuckets.find((b) => b.range === "day");
    expect(dayBucket?.record).not.toBeNull();
    expect(dayBucket?.record?.amount).toBe(20);
  });

  it("seleciona o dia com maior lucro quando há múltiplos dias", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", date: "2026-05-01", buyIn: 10, result: 30 }),
          makeTournament({ id: "t2", date: "2026-05-02", buyIn: 10, result: 60 }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    const dayBucket = result.current.profitBuckets.find((b) => b.range === "day");
    expect(dayBucket?.record?.amount).toBe(50);
    expect(dayBucket?.record?.bucketStart).toBe("2026-05-02");
  });

  it("agrega torneios do mesmo dia no profit bucket", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", date: "2026-05-01", buyIn: 10, result: 30 }),
          makeTournament({ id: "t2", date: "2026-05-01", buyIn: 10, result: 20 }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    const dayBucket = result.current.profitBuckets.find((b) => b.range === "day");
    expect(dayBucket?.record?.amount).toBe(30);
  });

  it("torneio com data inválida é ignorado nos buckets", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [makeTournament({ date: "invalid-date", buyIn: 10, result: 30 })],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    result.current.profitBuckets.forEach((bucket) => {
      expect(bucket.record).toBeNull();
    });
  });
});

describe("useStatsViewModel — lossBuckets", () => {
  it("record é null quando não há torneio com prejuízo", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [makeTournament({ buyIn: 10, result: 30 })],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    result.current.lossBuckets.forEach((bucket) => {
      expect(bucket.record).toBeNull();
    });
  });

  it("loss day record é preenchido com torneio de prejuízo", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [makeTournament({ date: "2026-05-01", buyIn: 10, result: 0 })],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    const dayBucket = result.current.lossBuckets.find((b) => b.range === "day");
    expect(dayBucket?.record).not.toBeNull();
    expect(dayBucket?.record?.amount).toBe(-10);
  });

  it("seleciona o dia com maior prejuízo quando há múltiplos dias", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", date: "2026-05-01", buyIn: 10, result: 0 }),
          makeTournament({ id: "t2", date: "2026-05-02", buyIn: 50, result: 0 }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    const dayBucket = result.current.lossBuckets.find((b) => b.range === "day");
    expect(dayBucket?.record?.amount).toBe(-50);
    expect(dayBucket?.record?.bucketStart).toBe("2026-05-02");
  });

  it("torneio com lucro positivo não gera loss record", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", date: "2026-05-01", buyIn: 10, result: 30 }),
          makeTournament({ id: "t2", date: "2026-05-01", buyIn: 5, result: 0 }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    const dayBucket = result.current.lossBuckets.find((b) => b.range === "day");
    expect(dayBucket?.record).toBeNull();
  });
});

describe("useStatsViewModel — allPlatforms / platformStats", () => {
  it("allPlatforms é vazio sem torneios", () => {
    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.allPlatforms).toHaveLength(0);
  });

  it("platformStats é null sem torneios", () => {
    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.platformStats).toBeNull();
  });

  it("agrupa torneios por plataforma em allPlatforms", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", platform: "PokerStars", buyIn: 10, result: 30 }),
          makeTournament({ id: "t2", platform: "PokerStars", buyIn: 10, result: 20 }),
          makeTournament({ id: "t3", platform: "GGPoker", buyIn: 10, result: 40 }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.allPlatforms).toHaveLength(2);
    const ps = result.current.allPlatforms.find((p) => p.platform === "PokerStars");
    expect(ps?.count).toBe(2);
    expect(ps?.profit).toBe(30);
  });

  it("allPlatforms é ordenado por profit decrescente", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", platform: "GGPoker", buyIn: 10, result: 15 }),
          makeTournament({ id: "t2", platform: "PokerStars", buyIn: 10, result: 50 }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.allPlatforms[0].platform).toBe("PokerStars");
    expect(result.current.allPlatforms[1].platform).toBe("GGPoker");
  });

  it("platformStats.mostProfit é a plataforma com maior profit", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", platform: "PokerStars", buyIn: 10, result: 50 }),
          makeTournament({ id: "t2", platform: "GGPoker", buyIn: 10, result: 15 }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.platformStats?.mostProfit?.platform).toBe("PokerStars");
  });

  it("platformStats.mostLoss é a plataforma com menor profit", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", platform: "PokerStars", buyIn: 10, result: 50 }),
          makeTournament({ id: "t2", platform: "GGPoker", buyIn: 10, result: 0 }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.platformStats?.mostLoss?.platform).toBe("GGPoker");
  });

  it("platformStats.mostTournaments é a plataforma com mais torneios", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", platform: "GGPoker", buyIn: 10, result: 50 }),
          makeTournament({ id: "t2", platform: "PokerStars", buyIn: 10, result: 5 }),
          makeTournament({ id: "t3", platform: "PokerStars", buyIn: 10, result: 5 }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.platformStats?.mostTournaments?.platform).toBe("PokerStars");
  });
});

describe("useStatsViewModel — podiumByPosition", () => {
  it("gold contém apenas torneios com position === 1", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", position: 1, name: "First Place" }),
          makeTournament({ id: "t2", position: 2, name: "Second Place" }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.podiumByPosition.gold).toHaveLength(1);
    expect(result.current.podiumByPosition.gold[0].name).toBe("First Place");
  });

  it("silver contém apenas torneios com position === 2", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [makeTournament({ id: "t1", position: 2, name: "Runner Up" })],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.podiumByPosition.silver).toHaveLength(1);
    expect(result.current.podiumByPosition.silver[0].name).toBe("Runner Up");
  });

  it("bronze contém apenas torneios com position === 3", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [makeTournament({ id: "t1", position: 3, name: "Third Place" })],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.podiumByPosition.bronze).toHaveLength(1);
    expect(result.current.podiumByPosition.bronze[0].name).toBe("Third Place");
  });

  it("torneios sem position (null/undefined) não aparecem no pódio", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", position: null }),
          makeTournament({ id: "t2", position: undefined }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    expect(result.current.podiumByPosition.gold).toHaveLength(0);
    expect(result.current.podiumByPosition.silver).toHaveLength(0);
    expect(result.current.podiumByPosition.bronze).toHaveLength(0);
  });

  it("gold é ordenado por data decrescente", () => {
    mockUseStats.mockReturnValue(
      makeStatsHook({
        summary: makeSummary(),
        tournaments: [
          makeTournament({ id: "t1", position: 1, date: "2026-03-01" }),
          makeTournament({ id: "t2", position: 1, date: "2026-05-01" }),
          makeTournament({ id: "t3", position: 1, date: "2026-04-01" }),
        ],
      }) as any,
    );

    const { result } = renderHook(() => useStatsViewModel());

    const dates = result.current.podiumByPosition.gold.map((t) => t.date);
    expect(dates).toEqual(["2026-05-01", "2026-04-01", "2026-03-01"]);
  });
});
