import { fireEvent, render, screen } from "@testing-library/react";
import { InsightsView } from "../Insights.view";
import { useInsightsViewModel } from "../insights.viewmodel";
import type { InsightsViewProps } from "../insights.types";
import type { CommentaryResponse, GeneratedDashboard } from "@/services/hooks/genui.types";

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
    commentary: null,
    isCommenting: false,
    commentaryError: null,
    canComment: true,
    onRequestCommentary: jest.fn(),
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

  describe("commentary", () => {
    const commentary: CommentaryResponse = {
      commentary: {
        headline: [
          { type: "text", text: "Seu maior prejuízo veio de " },
          { type: "fact", factId: "f1", widget: 3, label: "GG", value: null, unit: "money", currency: null },
          { type: "text", text: ", com " },
          { type: "fact", factId: "f2", widget: 3, label: null, value: -25.5, unit: "money", currency: null },
          { type: "text", text: "." },
        ],
        insights: [
          {
            widgets: [1],
            segments: [
              { type: "text", text: "O ROI ficou em " },
              { type: "fact", factId: "f3", widget: 1, label: "GG", value: 20, unit: "percent", currency: null },
              { type: "text", text: " e o lucro em " },
              { type: "fact", factId: "f4", widget: 0, label: null, value: 30, unit: "money", currency: "EUR" },
              { type: "text", text: " desde " },
              { type: "fact", factId: "f5", widget: 0, label: null, value: "2026-07-15", unit: "date", currency: null },
              { type: "text", text: "." },
            ],
          },
        ],
        caveat: "Poucos torneios no período.",
      },
    };

    it("offers the button with the privacy notice and link", () => {
      const props = baseProps({ dashboard });
      mockViewModel.mockReturnValue(props);
      render(<InsightsView />);

      expect(screen.getByText(/envia os números deste dashboard à anthropic/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /política de privacidade/i })).toHaveAttribute(
        "href",
        "/privacidade",
      );
      fireEvent.click(screen.getByRole("button", { name: "Comentar resultados" }));
      expect(props.onRequestCommentary).toHaveBeenCalledTimes(1);
    });

    it("does not offer the button without a dashboard or without widgets", () => {
      mockViewModel.mockReturnValue(baseProps());
      const { unmount } = render(<InsightsView />);
      expect(screen.queryByRole("button", { name: "Comentar resultados" })).not.toBeInTheDocument();
      unmount();

      mockViewModel.mockReturnValue(
        baseProps({ dashboard: { spec: { ...dashboard.spec, widgets: [] }, data: [] } }),
      );
      render(<InsightsView />);
      expect(screen.queryByRole("button", { name: "Comentar resultados" })).not.toBeInTheDocument();
    });

    it("shows a loading state without a clickable button", () => {
      mockViewModel.mockReturnValue(baseProps({ dashboard, isCommenting: true, canComment: false }));
      render(<InsightsView />);
      expect(screen.getByText("Analisando seus números…")).toBeInTheDocument();
      const button = screen.getByRole("button", { name: "Comentar resultados" });
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("renders fact segments formatted, bold and uncolored, with the AI notice", () => {
      mockViewModel.mockReturnValue(baseProps({ dashboard, commentary }));
      render(<InsightsView />);

      expect(screen.getByText("GG", { selector: "strong" })).toBeInTheDocument();
      expect(screen.getAllByText("$ -25.50", { selector: "strong" })[0]).toBeInTheDocument();
      const roi = screen.getByText("20.0%", { selector: "strong" });
      expect(roi).not.toHaveClass("text-green-500");
      expect(screen.getByText("€ 30.00", { selector: "strong" })).not.toHaveClass("text-green-500");
      expect(screen.getAllByText("$ -25.50", { selector: "strong" })[0]).not.toHaveClass("text-red-500");
      expect(screen.getByText("15/07/2026", { selector: "strong" })).toBeInTheDocument();
      expect(screen.getByText("Poucos torneios no período.")).toBeInTheDocument();
      expect(screen.getByText(/gerado por ia; os números vêm dos seus registros/i)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Comentar resultados" })).not.toBeInTheDocument();
    });

    it("formats date facts as dd/MM/yyyy without timezone shifts and counts as integers", () => {
      const fact = (factId: string, value: number | string, unit: "date" | "count") =>
        ({ type: "fact", factId, widget: 0, label: null, value, unit, currency: null }) as const;
      mockViewModel.mockReturnValue(
        baseProps({
          dashboard,
          commentary: {
            commentary: {
              headline: [fact("f1", "2026-09-14", "date"), { type: "text", text: " / " }, fact("f2", "2026-01-01", "date")],
              insights: [{ widgets: [0], segments: [fact("f3", 7, "count"), { type: "text", text: " e " }, fact("f4", 12.6, "count")] }],
              caveat: null,
            },
          },
        }),
      );
      render(<InsightsView />);
      expect(screen.getByText("14/09/2026", { selector: "strong" })).toBeInTheDocument();
      expect(screen.getByText("01/01/2026", { selector: "strong" })).toBeInTheDocument();
      expect(screen.queryByText("2026-09-14")).not.toBeInTheDocument();
      expect(screen.getByText("7", { selector: "strong" })).toBeInTheDocument();
      expect(screen.getByText("13", { selector: "strong" })).toBeInTheDocument();
    });

    it("formats an unknown currency with a single space", () => {
      mockViewModel.mockReturnValue(
        baseProps({
          dashboard,
          commentary: {
            commentary: {
              headline: [
                { type: "fact", factId: "f1", widget: 0, label: null, value: 12, unit: "money", currency: "ARS" },
              ],
              insights: [],
              caveat: null,
            },
          },
        }),
      );
      render(<InsightsView />);
      expect(screen.getByText("ARS 12.00", { selector: "strong" })).toBeInTheDocument();
    });

    it("renders text as plain text, never as HTML", () => {
      mockViewModel.mockReturnValue(
        baseProps({
          dashboard,
          commentary: {
            commentary: {
              headline: [{ type: "text", text: "<img src=x onerror=alert(1)> **negrito**" }],
              insights: [],
              caveat: null,
            },
          },
        }),
      );
      const { container } = render(<InsightsView />);
      expect(screen.getByText("<img src=x onerror=alert(1)> **negrito**")).toBeInTheDocument();
      expect(container.querySelector("img")).toBeNull();
    });

    it("moves focus to the result when it arrives", () => {
      mockViewModel.mockReturnValue(baseProps({ dashboard }));
      const { rerender } = render(<InsightsView />);
      mockViewModel.mockReturnValue(baseProps({ dashboard, commentary }));
      rerender(<InsightsView />);
      expect(screen.getByText(/seu maior prejuízo/i).closest("[tabindex='-1']")).toHaveFocus();
    });

    it("keeps the dashboard and offers a retry when the commentary fails", () => {
      const props = baseProps({ dashboard, commentaryError: "Não consegui comentar este dashboard. Tente de novo." });
      mockViewModel.mockReturnValue(props);
      render(<InsightsView />);

      expect(screen.getByRole("alert")).toHaveTextContent("Não consegui comentar este dashboard.");
      expect(screen.getByText("ROI por plataforma")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
      expect(props.onRequestCommentary).toHaveBeenCalledTimes(1);
    });

    it("says there is not enough data when the commentary is null", () => {
      mockViewModel.mockReturnValue(baseProps({ dashboard, commentary: { commentary: null } }));
      render(<InsightsView />);
      expect(screen.getByText("Não há dados suficientes para comentar.")).toBeInTheDocument();
    });
  });
});
