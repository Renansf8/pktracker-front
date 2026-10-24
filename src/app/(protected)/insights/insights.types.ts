import type { GeneratedDashboard } from "@/services/hooks/genui.types";

export const PROMPT_MAX_LENGTH = 500;

export interface InsightsViewProps {
  prompt: string;
  suggestions: string[];
  dashboard: GeneratedDashboard | null;
  isGenerating: boolean;
  errorMessage: string | null;
  canSubmit: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  onPickSuggestion: (suggestion: string) => void;
}
