"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentaryPanel } from "./components/CommentaryPanel";
import { DashboardRenderer } from "./components/DashboardRenderer";
import { PROMPT_MAX_LENGTH } from "./insights.types";
import { useInsightsViewModel } from "./insights.viewmodel";

export function InsightsView() {
  const {
    prompt,
    suggestions,
    dashboard,
    isGenerating,
    errorMessage,
    canSubmit,
    commentary,
    isCommenting,
    commentaryError,
    canComment,
    onRequestCommentary,
    onPromptChange,
    onSubmit,
    onPickSuggestion,
  } = useInsightsViewModel();

  return (
    <div className="flex flex-col w-[90%] mx-auto mt-10 gap-10 pb-16">
      <header className="pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <p
          className="text-[10px] uppercase tracking-[0.18em] font-medium mb-2"
          style={{ color: "var(--muted-foreground)" }}
        >
          Insights
        </p>
        <h1
          className="font-display text-3xl font-bold text-text-primary leading-none"
          style={{ letterSpacing: "0.02em" }}
        >
          Pergunte sobre seus resultados
        </h1>
      </header>

      <form
        className="glass-panel rounded-3xl p-5 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label htmlFor="insights-prompt" className="sr-only">
          O que você quer ver?
        </label>
        <textarea
          id="insights-prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          maxLength={PROMPT_MAX_LENGTH}
          rows={2}
          placeholder="Ex.: meu ROI por plataforma nos últimos 3 meses"
          disabled={isGenerating}
          className="w-full resize-none rounded-xl border border-input-border bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex flex-wrap items-center gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isGenerating}
              onClick={() => onPickSuggestion(suggestion)}
              className="rounded-full border border-input-border px-3 py-1 text-xs text-muted-foreground hover:text-text-primary hover:border-text-secondary transition-colors disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
          <div className="flex-1" />
          <Button type="submit" disabled={!canSubmit} className="gap-2">
            <Sparkles className="size-4" />
            {isGenerating ? "Gerando…" : "Gerar dashboard"}
          </Button>
        </div>
      </form>

      {errorMessage && (
        <p role="alert" className="text-sm" style={{ color: "var(--destructive)" }}>
          {errorMessage}
        </p>
      )}

      {isGenerating && (
        <p className="font-data text-sm tracking-[0.1em] uppercase text-text-secondary animate-pulse">
          Montando seu dashboard…
        </p>
      )}

      {!isGenerating && dashboard && (
        <DashboardRenderer
          dashboard={dashboard}
          afterSummary={
            dashboard.spec.widgets.length > 0 ? (
              <CommentaryPanel
                commentary={commentary}
                isCommenting={isCommenting}
                error={commentaryError}
                canComment={canComment}
                onRequestCommentary={onRequestCommentary}
              />
            ) : undefined
          }
        />
      )}
    </div>
  );
}
