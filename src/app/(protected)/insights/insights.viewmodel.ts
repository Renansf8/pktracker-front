"use client";

import { useState } from "react";
import {
  COMMENTARY_FALLBACK_ERROR,
  getGenUiErrorMessage,
  useGenUi,
} from "@/services/hooks/useGenUi";
import { PROMPT_MAX_LENGTH, type InsightsViewProps } from "./insights.types";

const SUGGESTIONS = [
  "Meu ROI por plataforma nos últimos 3 meses",
  "Como evoluiu meu lucro este ano?",
  "Compara meu ITM e ABI por moeda",
  "Quantos torneios joguei por semana no último mês?",
];

export function useInsightsViewModel(): InsightsViewProps {
  const [prompt, setPrompt] = useState("");
  // The text that produced the dashboard on screen (the textarea may have changed since).
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const { generateDashboard, generateCommentary } = useGenUi();

  const trimmed = prompt.trim();
  const canSubmit = trimmed.length > 0 && !generateDashboard.isPending;

  const submit = (value: string) => {
    const text = value.trim();
    if (!text || generateDashboard.isPending) return;
    setSubmittedPrompt(text);
    generateCommentary.reset();
    generateDashboard.mutate(text);
  };

  const dashboard = generateDashboard.data ?? null;
  const canComment =
    !!dashboard && dashboard.spec.widgets.length > 0 && !generateCommentary.isPending;

  const requestCommentary = () => {
    if (!dashboard || !canComment) return;
    generateCommentary.mutate({ spec: dashboard.spec, prompt: submittedPrompt || undefined });
  };

  return {
    prompt,
    suggestions: SUGGESTIONS,
    dashboard,
    isGenerating: generateDashboard.isPending,
    errorMessage: generateDashboard.isError
      ? getGenUiErrorMessage(generateDashboard.error)
      : null,
    canSubmit,
    commentary: generateCommentary.data ?? null,
    isCommenting: generateCommentary.isPending,
    commentaryError: generateCommentary.isError
      ? getGenUiErrorMessage(generateCommentary.error, COMMENTARY_FALLBACK_ERROR)
      : null,
    canComment,
    onRequestCommentary: requestCommentary,
    onPromptChange: (value) => setPrompt(value.slice(0, PROMPT_MAX_LENGTH)),
    onSubmit: () => submit(prompt),
    onPickSuggestion: (suggestion) => {
      setPrompt(suggestion);
      submit(suggestion);
    },
  };
}
