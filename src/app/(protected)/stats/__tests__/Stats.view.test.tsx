import { render, screen } from "@testing-library/react";
import { StatsView } from "../Stats.view";
import { useStatsViewModel } from "../stats.viewmodel";
import type { StatsViewProps } from "../stats.types";

jest.mock("../stats.viewmodel");

const mockViewModel = useStatsViewModel as jest.MockedFunction<typeof useStatsViewModel>;

function emptyBuckets() {
  return [
    { range: "day" as const, label: "Dia", record: null },
    { range: "week" as const, label: "Semana", record: null },
    { range: "month" as const, label: "Mês", record: null },
    { range: "year" as const, label: "Ano", record: null },
  ];
}

function baseProps(overrides: Partial<StatsViewProps> = {}): StatsViewProps {
  return {
    isLoading: false,
    isError: false,
    hasData: true,
    biggestBuyIn: null,
    mostTournamentsInADay: null,
    highestAbiDay: null,
    profitBuckets: emptyBuckets(),
    lossBuckets: emptyBuckets(),
    platformStats: null,
    allPlatforms: [],
    totalTournaments: 0,
    itmRate: 0,
    ftRate: 0,
    podiumByPosition: { gold: [], silver: [], bronze: [] },
    ticketCount: 0,
    ...overrides,
  };
}

beforeEach(() => {
  mockViewModel.mockReturnValue(baseProps());
});

describe("StatsView — loading", () => {
  it("exibe texto de carregamento quando isLoading é true", () => {
    mockViewModel.mockReturnValue(baseProps({ isLoading: true }));

    render(<StatsView />);

    expect(screen.getByText(/carregando estatísticas/i)).toBeInTheDocument();
  });

  it("não exibe conteúdo principal quando isLoading é true", () => {
    mockViewModel.mockReturnValue(baseProps({ isLoading: true }));

    render(<StatsView />);

    expect(screen.queryByRole("heading", { name: /seus recordes/i })).not.toBeInTheDocument();
  });
});

describe("StatsView — erro", () => {
  it("exibe mensagem de erro quando isError é true", () => {
    mockViewModel.mockReturnValue(baseProps({ isError: true }));

    render(<StatsView />);

    expect(screen.getByText(/erro ao carregar estatísticas/i)).toBeInTheDocument();
  });

  it("não exibe conteúdo principal quando isError é true", () => {
    mockViewModel.mockReturnValue(baseProps({ isError: true }));

    render(<StatsView />);

    expect(screen.queryByRole("heading", { name: /seus recordes/i })).not.toBeInTheDocument();
  });
});

describe("StatsView — sem dados", () => {
  it("exibe mensagem de sem dados quando hasData é false", () => {
    mockViewModel.mockReturnValue(baseProps({ hasData: false }));

    render(<StatsView />);

    expect(screen.getByText(/sem dados suficientes para exibir estatísticas/i)).toBeInTheDocument();
  });

  it("não exibe conteúdo principal quando hasData é false", () => {
    mockViewModel.mockReturnValue(baseProps({ hasData: false }));

    render(<StatsView />);

    expect(screen.queryByRole("heading", { name: /seus recordes/i })).not.toBeInTheDocument();
  });
});

describe("StatsView — header", () => {
  it("exibe heading 'Seus recordes'", () => {
    render(<StatsView />);

    expect(screen.getByRole("heading", { name: /seus recordes/i })).toBeInTheDocument();
  });

  it("exibe 'Hall of fame'", () => {
    render(<StatsView />);

    expect(screen.getByText(/hall of fame/i)).toBeInTheDocument();
  });

  it("não exibe StatStrip quando totalTournaments é 0", () => {
    render(<StatsView />);

    expect(screen.queryByText(/torneios/i, { selector: "[class*='font-data']" })).not.toBeInTheDocument();
  });

  it("exibe StatStrip quando totalTournaments > 0", () => {
    mockViewModel.mockReturnValue(baseProps({ totalTournaments: 42, itmRate: 30, ftRate: 10, allPlatforms: [{ platform: "PokerStars", profit: 100, count: 42 }] }));

    render(<StatsView />);

    expect(screen.getByText("42")).toBeInTheDocument();
  });
});

describe("StatsView — StatStrip", () => {
  it("exibe contagem de torneios correta", () => {
    mockViewModel.mockReturnValue(baseProps({ totalTournaments: 15, allPlatforms: [{ platform: "PS", profit: 0, count: 15 }] }));

    render(<StatsView />);

    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("exibe itmRate formatado com uma casa decimal", () => {
    mockViewModel.mockReturnValue(baseProps({ totalTournaments: 10, itmRate: 33.3, allPlatforms: [{ platform: "PS", profit: 0, count: 10 }] }));

    render(<StatsView />);

    expect(screen.getByText("33.3%")).toBeInTheDocument();
  });

  it("exibe ftRate formatado com uma casa decimal", () => {
    mockViewModel.mockReturnValue(baseProps({ totalTournaments: 10, ftRate: 20.0, allPlatforms: [{ platform: "PS", profit: 0, count: 10 }] }));

    render(<StatsView />);

    expect(screen.getByText("20.0%")).toBeInTheDocument();
  });

  it("exibe contagem de plataformas", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        totalTournaments: 4,
        allPlatforms: [
          { platform: "PokerStars", profit: 50, count: 2 },
          { platform: "GGPoker", profit: 30, count: 2 },
        ],
      }),
    );

    render(<StatsView />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });
});

describe("StatsView — seção 01 (Recordes pessoais)", () => {
  it("exibe título da seção 'Recordes pessoais'", () => {
    render(<StatsView />);

    expect(screen.getByText(/recordes pessoais/i)).toBeInTheDocument();
  });

  it("exibe 'Maior buy-in registrado'", () => {
    render(<StatsView />);

    expect(screen.getByText(/maior buy-in registrado/i)).toBeInTheDocument();
  });

  it("BiggestBuyInHero mostra '—' quando biggestBuyIn é null", () => {
    render(<StatsView />);

    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThan(0);
  });

  it("BiggestBuyInHero mostra o valor e nome do torneio quando data existe", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        biggestBuyIn: {
          value: 100,
          tournament: {
            id: "t1",
            name: "High Roller Championship",
            platform: "PokerStars",
            date: "2026-05-01T15:00:00.000Z",
          },
        },
      }),
    );

    render(<StatsView />);

    expect(screen.getByText(/100\.00/)).toBeInTheDocument();
    expect(screen.getByText("High Roller Championship")).toBeInTheDocument();
  });

  it("exibe 'Mais torneios em um dia'", () => {
    render(<StatsView />);

    expect(screen.getByText(/mais torneios em um dia/i)).toBeInTheDocument();
  });

  it("MostTournamentsCompact mostra count quando data existe", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        mostTournamentsInADay: { date: "2026-05-01", count: 7 },
      }),
    );

    render(<StatsView />);

    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("exibe 'Maior ABI em um dia'", () => {
    render(<StatsView />);

    expect(screen.getByText(/maior abi em um dia/i)).toBeInTheDocument();
  });

  it("HighestAbiCompact mostra ABI quando data existe", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        highestAbiDay: { date: "2026-05-01", abi: 55.5, tournaments: 3 },
      }),
    );

    render(<StatsView />);

    expect(screen.getByText(/55\.50/)).toBeInTheDocument();
  });

  it("exibe 'Tickets ganhos'", () => {
    render(<StatsView />);

    expect(screen.getByText(/tickets ganhos/i)).toBeInTheDocument();
  });

  it("TicketCountCompact mostra '0 tickets' quando count é 0", () => {
    render(<StatsView />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText(/^tickets$/i)).toBeInTheDocument();
  });

  it("TicketCountCompact usa singular 'ticket' quando count é 1", () => {
    mockViewModel.mockReturnValue(baseProps({ ticketCount: 1 }));

    render(<StatsView />);

    const ticketLabel = screen.getByText(/^ticket$/i);
    expect(ticketLabel).toBeInTheDocument();
  });
});

describe("StatsView — seção 02+03 (Matriz de períodos)", () => {
  it("exibe cabeçalho 'Recordes por período'", () => {
    render(<StatsView />);

    expect(screen.getByText(/recordes por período/i)).toBeInTheDocument();
  });

  it("exibe colunas DIA, SEMANA, MÊS e ANO", () => {
    render(<StatsView />);

    expect(screen.getByText("DIA")).toBeInTheDocument();
    expect(screen.getByText("SEMANA")).toBeInTheDocument();
    expect(screen.getByText("MÊS")).toBeInTheDocument();
    expect(screen.getByText("ANO")).toBeInTheDocument();
  });

  it("exibe valor formatado quando profit bucket tem record", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        profitBuckets: [
          { range: "day", label: "Dia", record: { bucketStart: "2026-05-01", amount: 150 } },
          { range: "week", label: "Semana", record: null },
          { range: "month", label: "Mês", record: null },
          { range: "year", label: "Ano", record: null },
        ],
      }),
    );

    render(<StatsView />);

    expect(screen.getByText(/\$\s*150\.00/)).toBeInTheDocument();
  });

  it("exibe valor formatado quando loss bucket tem record", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        lossBuckets: [
          { range: "day", label: "Dia", record: { bucketStart: "2026-05-02", amount: -75 } },
          { range: "week", label: "Semana", record: null },
          { range: "month", label: "Mês", record: null },
          { range: "year", label: "Ano", record: null },
        ],
      }),
    );

    render(<StatsView />);

    expect(screen.getByText(/-\$\s*75\.00/)).toBeInTheDocument();
  });
});

describe("StatsView — seção 04 (Plataformas)", () => {
  it("seção de plataformas não é renderizada quando allPlatforms está vazio", () => {
    render(<StatsView />);

    expect(screen.queryByText(/^plataformas$/i)).not.toBeInTheDocument();
  });

  it("exibe nome das plataformas quando allPlatforms tem entradas", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        allPlatforms: [
          { platform: "PokerStars", profit: 200, count: 10 },
          { platform: "GGPoker", profit: -30, count: 5 },
        ],
      }),
    );

    render(<StatsView />);

    expect(screen.getByText("PokerStars")).toBeInTheDocument();
    expect(screen.getByText("GGPoker")).toBeInTheDocument();
  });

  it("exibe contagem de torneios por plataforma", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        allPlatforms: [{ platform: "PokerStars", profit: 100, count: 8 }],
      }),
    );

    render(<StatsView />);

    expect(screen.getByText("8t")).toBeInTheDocument();
  });
});

describe("StatsView — seção 05 (Pódios)", () => {
  it("exibe título da seção 'Pódios'", () => {
    render(<StatsView />);

    expect(screen.getByText(/^pódios$/i)).toBeInTheDocument();
  });

  it("exibe 'Nenhum pódio registrado ainda' quando não há pódios", () => {
    render(<StatsView />);

    expect(screen.getByText(/nenhum pódio registrado ainda/i)).toBeInTheDocument();
  });

  it("exibe rótulos 1º, 2º e 3º lugar quando há pódios", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        podiumByPosition: {
          gold: [
            {
              id: "t1",
              name: "Gold Event",
              date: "2026-05-01",
              platform: "PokerStars",
              currency: "USD",
              buyIn: 10,
              result: 100,
              position: 1,
            },
          ],
          silver: [],
          bronze: [],
        },
      }),
    );

    render(<StatsView />);

    expect(screen.getByText(/1º lugar/i)).toBeInTheDocument();
    expect(screen.getByText(/2º lugar/i)).toBeInTheDocument();
    expect(screen.getByText(/3º lugar/i)).toBeInTheDocument();
  });

  it("exibe nome do torneio no pódio correto", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        podiumByPosition: {
          gold: [
            {
              id: "t1",
              name: "Sunday Million Winner",
              date: "2026-05-01",
              platform: "PokerStars",
              currency: "USD",
              buyIn: 215,
              result: 50000,
              position: 1,
            },
          ],
          silver: [],
          bronze: [],
        },
      }),
    );

    render(<StatsView />);

    expect(screen.getByText("Sunday Million Winner")).toBeInTheDocument();
  });

  it("exibe 'Sem registros' nas colunas de pódio sem torneios", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        podiumByPosition: {
          gold: [
            {
              id: "t1",
              name: "Gold Event",
              date: "2026-05-01",
              platform: "PokerStars",
              currency: "USD",
              buyIn: 10,
              result: 100,
              position: 1,
            },
          ],
          silver: [],
          bronze: [],
        },
      }),
    );

    render(<StatsView />);

    const semRegistros = screen.getAllByText(/sem registros/i);
    expect(semRegistros.length).toBeGreaterThanOrEqual(2);
  });
});
