"use client";

import { useState } from "react";
import { getGenUiErrorMessage, useGenUi } from "@/services/hooks/useGenUi";
import { PROMPT_MAX_LENGTH, type InsightsViewProps } from "./insights.types";

const SUGGESTIONS = [
  "Meu ROI por plataforma nos últimos 3 meses",
  "Como evoluiu meu lucro este ano?",
  "Compara meu ITM e ABI por moeda",
  "Quantos torneios joguei por semana no último mês?",
];

export function useInsightsViewModel(): InsightsViewProps {
  const [prompt, setPrompt] = useState("");
  const { generateDashboard } = useGenUi();

  const trimmed = prompt.trim();
  const canSubmit = trimmed.length > 0 && !generateDashboard.isPending;

  const submit = (value: string) => {
    const text = value.trim();
    if (!text || generateDashboard.isPending) return;
    generateDashboard.mutate(text);
  };

  return {
    prompt,
    suggestions: SUGGESTIONS,
    dashboard: generateDashboard.data ?? null,
    isGenerating: generateDashboard.isPending,
    errorMessage: generateDashboard.isError
      ? getGenUiErrorMessage(generateDashboard.error)
      : null,
    canSubmit,
    onPromptChange: (value) => setPrompt(value.slice(0, PROMPT_MAX_LENGTH)),
    onSubmit: () => submit(prompt),
    onPickSuggestion: (suggestion) => {
      setPrompt(suggestion);
      submit(suggestion);
    },
  };
}
