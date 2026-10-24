import { fireEvent, render, screen } from "@testing-library/react";
import { InsightsView } from "../Insights.view";
import { useInsightsViewModel } from "../insights.viewmodel";
import type { InsightsViewProps } from "../insights.types";
import type { GeneratedDashboard } from "@/services/hooks/genui.types";

jest.mock("../insights.viewmodel");
jest.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  ReferenceLine: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockViewModel = useInsightsViewModel as jest.MockedFunction<typeof useInsightsViewModel>;

const period = { from: "2026-07-15", to: "2026-10-15" };

const dashboard: GeneratedDashboard = {
  spec: {
    title: "ROI por plataforma",
    summary: "Seu ROI em cada plataforma nos últimos 3 meses.",
    widgets: [
      { type: "stat", title: "ROI geral", metric: "roi", period, platform: null },
      {
        type: "bar_chart",
        title: "ROI por site",
        metric: "roi",
        groupBy: "platform",
        order: "desc",
        limit: null,
        period,
        platform: null,
      },
      {
        type: "line_chart",
        title: "Lucro acumulado",
        metric: "cumulative_profit",
        bucket: "week",
        period,
        platform: null,
      },
      {
        type: "table",
        title: "Detalhes",
        groupBy: "platform",
        sortBy: "profit",
        order: "desc",
        limit: null,
        period,
        platform: null,
      },
    ],
  },
  data: [
    { type: "stat", unit: "percent", value: 12.345 },
    { type: "bar_chart", unit: "percent", bars: [{ label: "GG", value: 20 }] },
    { type: "line_chart", unit: "money", points: [] },
    {
      type: "table",
      rows: [
        { label: "GG", entry: null, tournaments: 10, buyIns: 100, profit: -25.5, roi: -25.5, itmRate: 20, ftRate: 10, day2Rate: 0, wins: 0, podiums: 1, abi: 10, avgProfit: -2.55, biggestCash: 30 },
      ],
    },
  ],
};

function baseProps(overrides: Partial<InsightsViewProps> = {}): InsightsViewProps {
  return {
    prompt: "",
    suggestions: ["Meu ROI por plataforma nos últimos 3 meses"],
    dashboard: null,
    isGenerating: false,
    errorMessage: null,
    canSubmit: false,
    onPromptChange: jest.fn(),
    onSubmit: jest.fn(),
    onPickSuggestion: jest.fn(),
    ...overrides,
  };
}

describe("InsightsView", () => {
  it("submits the prompt from the button and from Enter", () => {
    const props = baseProps({ prompt: "meu roi", canSubmit: true });
    mockViewModel.mockReturnValue(props);
    render(<InsightsView />);

    fireEvent.click(screen.getByRole("button", { name: /gerar dashboard/i }));
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });

    expect(props.onSubmit).toHaveBeenCalledTimes(2);
  });

  it("disables the submit button when there is nothing to send", () => {
    mockViewModel.mockReturnValue(baseProps());
    render(<InsightsView />);
    expect(screen.getByRole("button", { name: /gerar dashboard/i })).toBeDisabled();
  });

  it("sends a suggestion when it is clicked", () => {
    const props = baseProps();
    mockViewModel.mockReturnValue(props);
    render(<InsightsView />);

    fireEvent.click(screen.getByRole("button", { name: "Meu ROI por plataforma nos últimos 3 meses" }));
    expect(props.onPickSuggestion).toHaveBeenCalledWith("Meu ROI por plataforma nos últimos 3 meses");
  });

  it("shows the error message from the API", () => {
    mockViewModel.mockReturnValue(baseProps({ errorMessage: "Limite de 30 dashboards por dia atingido." }));
    render(<InsightsView />);
    expect(screen.getByRole("alert")).toHaveTextContent("Limite de 30 dashboards por dia atingido.");
  });

  it("shows a loading state instead of the old dashboard while generating", () => {
    mockViewModel.mockReturnValue(baseProps({ isGenerating: true, dashboard }));
    render(<InsightsView />);
    expect(screen.getByText(/montando seu dashboard/i)).toBeInTheDocument();
    expect(screen.queryByText("ROI por plataforma")).not.toBeInTheDocument();
  });

  it("renders every widget of a generated dashboard", () => {
    mockViewModel.mockReturnValue(baseProps({ dashboard }));
    render(<InsightsView />);

    expect(screen.getByText("ROI por plataforma")).toBeInTheDocument();
    expect(screen.getByText("Seu ROI em cada plataforma nos últimos 3 meses.")).toBeInTheDocument();
    expect(screen.getByText("12.3%")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByText("Lucro acumulado")).toBeInTheDocument();
    expect(screen.getByText("Sem torneios nesse período")).toBeInTheDocument();
    expect(screen.getByText("$ -25.50")).toBeInTheDocument();
    expect(screen.getAllByText("15/07/2026 – 15/10/2026")).toHaveLength(4);
  });

  it("adds a platform column to tournament-name tables across all platforms", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        dashboard: {
          spec: {
            title: "Maiores ganhos e perdas",
            summary: "s",
            widgets: [
              {
                type: "table",
                title: "Maior lucro",
                groupBy: "tournament_name",
                sortBy: "profit",
                order: "desc",
                limit: 1,
                period,
                platform: null,
              },
            ],
          },
          data: [
            {
              type: "table",
              rows: [
                { label: "Bounty Hunters", entry: { platform: "Party Poker", currency: "USD", buyIn: 11 }, tournaments: 3, buyIns: 30, profit: 500, roi: 1666.7, itmRate: 33.3, ftRate: 0, day2Rate: 0, wins: 0, podiums: 0, abi: 10, avgProfit: 166.67, biggestCash: 530 },
              ],
            },
          ],
        },
      }),
    );
    render(<InsightsView />);

    expect(screen.getByRole("columnheader", { name: "Plataforma" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Party Poker" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Buy-in" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "$ 11.00" })).toBeInTheDocument();
  });

  it("lists individual tournaments with prize, position and currency", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        dashboard: {
          spec: {
            title: "Maiores prêmios",
            summary: "s",
            widgets: [
              {
                type: "tournament_list",
                title: "Top prêmios",
                sortBy: "prize",
                order: "desc",
                limit: 2,
                period,
                platform: null,
              },
            ],
          },
          data: [
            {
              type: "tournament_list",
              rows: [
                {
                  date: "2026-05-08",
                  name: "Bounty Hunters",
                  platform: "Poker Stars",
                  currency: "USD",
                  buyIn: 5.5,
                  prize: 800,
                  profit: 794.5,
                  position: 32,
                  itm: true,
                  hasFt: false,
                },
                {
                  date: "2026-06-01",
                  name: "Sunday Special",
                  platform: "Winamax",
                  currency: "EUR",
                  buyIn: null,
                  prize: "ticket",
                  profit: 0,
                  position: null,
                  itm: false,
                  hasFt: false,
                },
              ],
            },
          ],
        },
      }),
    );
    render(<InsightsView />);

    expect(screen.getByRole("columnheader", { name: "Prêmio" })).toBeInTheDocument();
    expect(screen.getByText("08/05/2026")).toBeInTheDocument();
    expect(screen.getByText("$ 800.00")).toBeInTheDocument();
    expect(screen.getByText("32º")).toBeInTheDocument();
    expect(screen.getAllByText("Ticket")).toHaveLength(2);
    expect(screen.getByText("€ 0.00")).toBeInTheDocument();
  });

  it("labels tournament-name tables and shows the platform filter", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        dashboard: {
          spec: {
            title: "Lucro na GG por torneio",
            summary: "s",
            widgets: [
              {
                type: "table",
                title: "Lucro por torneio",
                groupBy: "tournament_name",
                sortBy: "profit",
                order: "desc",
                limit: null,
                period,
                platform: "GG",
              },
            ],
          },
          data: [
            {
              type: "table",
              rows: [
                { label: "Daily Big $22", entry: { platform: "GG", currency: "EUR", buyIn: null }, tournaments: 1, buyIns: 22, profit: 100, roi: 454.5, itmRate: 100, ftRate: 100, day2Rate: 0, wins: 1, podiums: 1, abi: 22, avgProfit: 100, biggestCash: 122 },
              ],
            },
          ],
        },
      }),
    );
    render(<InsightsView />);

    expect(screen.getByRole("columnheader", { name: "Torneio" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Plataforma" })).not.toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Ticket" })).toBeInTheDocument();
    expect(screen.getByText("Daily Big $22")).toBeInTheDocument();
    expect(screen.getByText("GG")).toBeInTheDocument();
  });
});
