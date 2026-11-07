import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError, type AxiosResponse } from "axios";
import { useInsightsViewModel } from "../insights.viewmodel";
import { apiClient } from "@/services/api/client";
import type { CommentaryResponse, GeneratedDashboard } from "@/services/hooks/genui.types";

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
const emptyDashboard: GeneratedDashboard = { spec: { title: "t", summary: "s", widgets: [] }, data: [] };
const commentaryA: CommentaryResponse = {
  commentary: {
    headline: [{ type: "text", text: "Comentário do dashboard A" }],
    insights: [],
    caveat: null,
  },
};

function httpError(status: number, message: string) {
  return new AxiosError("fail", String(status), undefined, undefined, {
    status,
    data: { statusCode: status, message },
  } as AxiosResponse);
}

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useInsightsViewModel(), { wrapper });
}

async function generate(result: ReturnType<typeof setup>["result"], text = "meu roi") {
  act(() => result.current.onPromptChange(text));
  act(() => result.current.onSubmit());
  await waitFor(() => expect(result.current.dashboard).not.toBeNull());
}

const commentaryCalls = () =>
  post.mock.calls.filter(([url]) => url === "/genui/dashboard/commentary");

describe("useInsightsViewModel commentary — edge cases", () => {
  beforeEach(() => post.mockReset());

  it("shows the message the API sent for a quota error (429) and keeps the dashboard", async () => {
    post.mockResolvedValueOnce({ data: dashboard });
    const { result } = setup();
    await generate(result);

    post.mockRejectedValueOnce(httpError(429, "Limite de 30 comentários por dia atingido."));
    act(() => result.current.onRequestCommentary());
    await waitFor(() => expect(result.current.commentaryError).not.toBeNull());
    expect(result.current.commentaryError).toBe("Limite de 30 comentários por dia atingido.");
    expect(result.current.dashboard).toEqual(dashboard);
    expect(result.current.commentary).toBeNull();
  });

  it("shows the 400 message for an invalid dashboard", async () => {
    post.mockResolvedValueOnce({ data: dashboard });
    const { result } = setup();
    await generate(result);

    post.mockRejectedValueOnce(httpError(400, "Dashboard inválido."));
    act(() => result.current.onRequestCommentary());
    await waitFor(() => expect(result.current.commentaryError).toBe("Dashboard inválido."));
  });

  it("clears the error when the retry succeeds", async () => {
    post.mockResolvedValueOnce({ data: dashboard });
    const { result } = setup();
    await generate(result);

    post.mockRejectedValueOnce(httpError(502, "Não consegui comentar este dashboard. Tente de novo."));
    act(() => result.current.onRequestCommentary());
    await waitFor(() => expect(result.current.commentaryError).not.toBeNull());

    post.mockResolvedValueOnce({ data: commentaryA });
    act(() => result.current.onRequestCommentary());
    await waitFor(() => expect(result.current.commentary).toEqual(commentaryA));
    expect(result.current.commentaryError).toBeNull();
  });

  it("sends a single request when the button is clicked twice while loading", async () => {
    post.mockResolvedValueOnce({ data: dashboard });
    const { result } = setup();
    await generate(result);

    let resolve!: (value: unknown) => void;
    post.mockReturnValueOnce(new Promise((r) => (resolve = r)));
    act(() => result.current.onRequestCommentary());
    await waitFor(() => expect(result.current.isCommenting).toBe(true));
    expect(result.current.canComment).toBe(false);
    act(() => result.current.onRequestCommentary());
    expect(commentaryCalls()).toHaveLength(1);

    await act(async () => resolve({ data: commentaryA }));
    await waitFor(() => expect(result.current.commentary).toEqual(commentaryA));
  });

  it("does not call the API without a dashboard or with a dashboard without widgets", async () => {
    const { result } = setup();
    expect(result.current.canComment).toBe(false);
    act(() => result.current.onRequestCommentary());
    expect(post).not.toHaveBeenCalled();

    post.mockResolvedValueOnce({ data: emptyDashboard });
    await generate(result);
    expect(result.current.canComment).toBe(false);
    act(() => result.current.onRequestCommentary());
    expect(commentaryCalls()).toHaveLength(0);
  });

  it("ignores a commentary that arrives after a new dashboard was requested", async () => {
    post.mockResolvedValueOnce({ data: dashboard });
    const { result } = setup();
    await generate(result, "dashboard A");

    let resolveCommentary!: (value: unknown) => void;
    post.mockReturnValueOnce(new Promise((r) => (resolveCommentary = r)));
    act(() => result.current.onRequestCommentary());
    await waitFor(() => expect(result.current.isCommenting).toBe(true));

    // new dashboard B while the commentary of A is still in flight
    let resolveB!: (value: unknown) => void;
    post.mockReturnValueOnce(new Promise((r) => (resolveB = r)));
    act(() => result.current.onPromptChange("dashboard B"));
    act(() => result.current.onSubmit());
    expect(result.current.isCommenting).toBe(false);

    await act(async () => resolveCommentary({ data: commentaryA }));
    await act(async () => resolveB({ data: dashboard }));
    await waitFor(() => expect(result.current.isGenerating).toBe(false));
    expect(result.current.commentary).toBeNull();
    expect(result.current.canComment).toBe(true);
  });

  it("clears a commentary error when a new dashboard is requested", async () => {
    post.mockResolvedValueOnce({ data: dashboard });
    const { result } = setup();
    await generate(result);
    post.mockRejectedValueOnce(httpError(502, "falhou"));
    act(() => result.current.onRequestCommentary());
    await waitFor(() => expect(result.current.commentaryError).toBe("falhou"));

    post.mockResolvedValueOnce({ data: dashboard });
    act(() => result.current.onSubmit());
    await waitFor(() => expect(result.current.commentaryError).toBeNull());
  });
});
