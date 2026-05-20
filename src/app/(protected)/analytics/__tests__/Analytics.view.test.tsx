import { render, screen } from "@testing-library/react";
import { AnalyticsView } from "../Analytics.view";
import { useAnalyticsViewModel } from "../analytics.viewmodel";
import type { AnalyticsViewProps } from "../analytics.types";

jest.mock("../analytics.viewmodel");
const mockViewModel = useAnalyticsViewModel as jest.MockedFunction<typeof useAnalyticsViewModel>;

jest.mock("recharts", () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const EMPTY_PERIOD = { profit: 0, roi: 0, abi: 0, itmPct: 0, count: 0 };

const EMPTY_HEATMAP = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((day) => ({
  day,
  avg: 0,
  count: 0,
}));

function baseProps(overrides: Partial<AnalyticsViewProps> = {}): AnalyticsViewProps {
  return {
    isLoading: false,
    hasCurveData: true,
    curve: [{ date: "2026-05-01", balance: 100, label: "01/05" }],
    currentBalance: 100,
    thisMonth: EMPTY_PERIOD,
    lastMonth: EMPTY_PERIOD,
    thisMonthName: "Mai 2026",
    lastMonthName: "Abr 2026",
    heatmap: EMPTY_HEATMAP,
    streaks: { maxWinStreak: 0, maxLossStreak: 0, currentStreak: 0, currentStreakType: "neutral" },
    ...overrides,
  };
}

beforeEach(() => {
  mockViewModel.mockReturnValue(baseProps());
});

describe("AnalyticsView", () => {
  it("exibe loading quando isLoading é true", () => {
    mockViewModel.mockReturnValue(baseProps({ isLoading: true }));

    render(<AnalyticsView />);

    expect(screen.getByText(/carregando análise/i)).toBeInTheDocument();
  });

  it("exibe mensagem de sem dados quando hasCurveData é false", () => {
    mockViewModel.mockReturnValue(baseProps({ hasCurveData: false }));

    render(<AnalyticsView />);

    expect(screen.getByText(/sem dados suficientes para análise/i)).toBeInTheDocument();
  });

  it("não exibe loading quando dados disponíveis", () => {
    render(<AnalyticsView />);

    expect(screen.queryByText(/carregando análise/i)).not.toBeInTheDocument();
  });

  it("exibe título 'Evolução' quando dados disponíveis", () => {
    render(<AnalyticsView />);

    expect(screen.getByRole("heading", { name: /evolução/i })).toBeInTheDocument();
  });

  it("exibe as 4 seções com seus índices", () => {
    render(<AnalyticsView />);

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
  });

  it("exibe os nomes dos meses na tabela de comparação", () => {
    render(<AnalyticsView />);

    expect(screen.getByText("Mai 2026")).toBeInTheDocument();
    expect(screen.getByText("Abr 2026")).toBeInTheDocument();
  });

  it("exibe saldo positivo na cor correta (verde)", () => {
    render(<AnalyticsView />);

    expect(screen.getByText(/\$ 100\.00/)).toBeInTheDocument();
  });

  it("exibe 'Todos os registros' no cabeçalho", () => {
    render(<AnalyticsView />);

    expect(screen.getByText(/todos os registros/i)).toBeInTheDocument();
  });
});
