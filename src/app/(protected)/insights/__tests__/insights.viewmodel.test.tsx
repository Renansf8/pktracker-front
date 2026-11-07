import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useInsightsViewModel } from "../insights.viewmodel";
import { apiClient } from "@/services/api/client";
import type { GeneratedDashboard } from "@/services/hooks/genui.types";

jest.mock("@/services/api/client", () => ({ apiClient: { post: jest.fn() } }));

const post = apiClient.post as jest.Mock;
const period = { from: "2026-07-15", to: "2026-10-15" };
const dashboard: GeneratedDashboard = {
  spec: {
    title: "t",
    summary: "s",
    widgets: [{ type: "stat", title: "ROI", metric: "roi", period, platform: null }],
  },
  data: [{ type: "stat", unit: "percent", value: 1 }],
};

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useInsightsViewModel(), { wrapper });
}

async function generate(result: ReturnType<typeof setup>["result"], text: string) {
  act(() => result.current.onPromptChange(text));
  act(() => result.current.onSubmit());
  await waitFor(() => expect(result.current.dashboard).not.toBeNull());
}

describe("useInsightsViewModel commentary", () => {
  beforeEach(() => post.mockReset());

  it("sends the dashboard spec and the submitted prompt, not the edited textarea", async () => {
    post.mockResolvedValueOnce({ data: dashboard });
    const { result } = setup();
    await generate(result, "meu roi");
    act(() => result.current.onPromptChange("outra coisa"));

    post.mockResolvedValueOnce({ data: { commentary: null } });
    act(() => result.current.onRequestCommentary());
    await waitFor(() => expect(result.current.commentary).toEqual({ commentary: null }));

    expect(post).toHaveBeenLastCalledWith("/genui/dashboard/commentary", {
      spec: dashboard.spec,
      prompt: "meu roi",
    });
  });

  it("keeps the dashboard and exposes the API message when commentary fails", async () => {
    post.mockResolvedValueOnce({ data: dashboard });
    const { result } = setup();
    await generate(result, "meu roi");

    post.mockRejectedValueOnce(new Error("boom"));
    act(() => result.current.onRequestCommentary());
    await waitFor(() => expect(result.current.commentaryError).not.toBeNull());
    expect(result.current.commentaryError).toBe("Não foi possível gerar o comentário. Tente novamente.");
    expect(result.current.dashboard).not.toBeNull();
  });

  it("clears the previous commentary when a new dashboard is requested", async () => {
    post.mockResolvedValueOnce({ data: dashboard });
    const { result } = setup();
    await generate(result, "meu roi");
    post.mockResolvedValueOnce({ data: { commentary: null } });
    act(() => result.current.onRequestCommentary());
    await waitFor(() => expect(result.current.commentary).not.toBeNull());

    post.mockResolvedValueOnce({ data: dashboard });
    act(() => result.current.onSubmit());
    await waitFor(() => expect(result.current.commentary).toBeNull());
  });
});

describe("getGenUiErrorMessage", () => {
  it("accepts message as a string or as an array", () => {
    const { getGenUiErrorMessage } = jest.requireActual("@/services/hooks/useGenUi");
    const axiosErr = (message: unknown) => ({ isAxiosError: true, response: { data: { message } } });
    expect(getGenUiErrorMessage(axiosErr("Dashboard inválido."))).toBe("Dashboard inválido.");
    expect(getGenUiErrorMessage(axiosErr(["Dashboard inválido.", "x"]))).toBe("Dashboard inválido.");
    expect(getGenUiErrorMessage(axiosErr([]), "fallback")).toBe("fallback");
  });
});
