import type { CommentaryResponse, GeneratedDashboard } from "@/services/hooks/genui.types";

export const PROMPT_MAX_LENGTH = 500;

export interface InsightsViewProps {
  prompt: string;
  suggestions: string[];
  dashboard: GeneratedDashboard | null;
  isGenerating: boolean;
  errorMessage: string | null;
  canSubmit: boolean;
  /** Last commentary response; null until the user asks for one. */
  commentary: CommentaryResponse | null;
  isCommenting: boolean;
  commentaryError: string | null;
  canComment: boolean;
  onRequestCommentary: () => void;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  onPickSuggestion: (suggestion: string) => void;
}
