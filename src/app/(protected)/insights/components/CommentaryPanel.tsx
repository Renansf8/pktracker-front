"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  CommentaryResponse,
  CommentarySegment,
  DashboardValueUnit,
} from "@/services/hooks/genui.types";
import {
  CURRENCY_SYMBOLS,
  formatIsoDate,
  formatValue,
} from "@/utils/insightsFormat";

type FactSegment = Extract<CommentarySegment, { type: "fact" }>;

export interface CommentaryPanelProps {
  commentary: CommentaryResponse | null;
  isCommenting: boolean;
  error: string | null;
  canComment: boolean;
  onRequestCommentary: () => void;
}

function formatFact(segment: FactSegment): string {
  const { value, unit, currency, label } = segment;
  if (value === null) return label ?? "—";
  if (unit === "date") return formatIsoDate(String(value));
  if (typeof value !== "number") return String(value);
  if (unit === "money" && currency) {
    const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
    return Number.isFinite(value) ? `${symbol} ${value.toFixed(2)}` : "—";
  }
  return formatValue(value, unit as DashboardValueUnit);
}

/** Plain text only: segments are rendered as React text nodes, never as HTML or markdown. */
function Segments({ segments }: { segments: CommentarySegment[] }) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.type === "text" ? (
          <span key={index}>{segment.text}</span>
        ) : (
          <strong
            key={index}
            className={"font-data font-semibold tabular-nums text-text-primary"}
          >
            {formatFact(segment)}
          </strong>
        ),
      )}
    </>
  );
}

export function CommentaryPanel({
  commentary,
  isCommenting,
  error,
  canComment,
  onRequestCommentary,
}: CommentaryPanelProps) {
  const resultRef = useRef<HTMLDivElement>(null);
  const result = commentary?.commentary ?? null;
  const hasResponse = commentary !== null;

  // Move focus to the result when it arrives so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (hasResponse) resultRef.current?.focus();
  }, [hasResponse]);

  const showButton = !hasResponse;

  return (
    <section
      aria-labelledby="commentary-heading"
      className="glass-panel rounded-2xl p-5 flex flex-col gap-4 min-w-0"
    >
      <h3
        id="commentary-heading"
        className="font-display text-base font-semibold text-text-primary"
      >
        Comentário da IA
      </h3>

      {error && (
        <p role="alert" className="text-sm" style={{ color: "var(--destructive)" }}>
          {error}
        </p>
      )}

      <div aria-live="polite" aria-busy={isCommenting} className="flex flex-col gap-3">
        {isCommenting && (
          <div>
            <p className="font-data text-sm tracking-[0.1em] uppercase text-text-secondary animate-pulse">
              Analisando seus números…
            </p>
            <div aria-hidden="true" className="mt-3 flex flex-col gap-2 animate-pulse">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-5/6 rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
            </div>
          </div>
        )}

        {hasResponse && !isCommenting && (
          <div ref={resultRef} tabIndex={-1} className="flex flex-col gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            {result ? (
              <>
                <p className="text-base font-medium text-text-primary break-words">
                  <Segments segments={result.headline} />
                </p>
                {result.insights.length > 0 && (
                  <ul className="list-disc pl-5 flex flex-col gap-2 text-sm text-text-secondary">
                    {result.insights.map((insight, index) => (
                      <li key={index} className="break-words">
                        <Segments segments={insight.segments} />
                      </li>
                    ))}
                  </ul>
                )}
                {result.caveat && (
                  <p className="text-xs text-text-secondary break-words">{result.caveat}</p>
                )}
                <p className="text-xs text-text-secondary">
                  Comentário gerado por IA; os números vêm dos seus registros.
                </p>
              </>
            ) : (
              <p className="text-sm text-text-secondary">Não há dados suficientes para comentar.</p>
            )}
          </div>
        )}
      </div>

      {showButton && (
        <div className="flex flex-col gap-2">
          <div>
            <Button
              type="button"
              onClick={onRequestCommentary}
              aria-disabled={!canComment}
              className={cn("w-full sm:w-auto", !canComment && "opacity-60 cursor-not-allowed")}
            >
              {error ? "Tentar de novo" : "Comentar resultados"}
            </Button>
          </div>
          <p className="text-xs text-text-secondary">
            Envia os números deste dashboard à Anthropic para gerar o comentário.{" "}
            <Link
              href="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-text-primary"
            >
              Política de privacidade
              <span className="sr-only"> (abre em nova aba)</span>
            </Link>
          </p>
        </div>
      )}
    </section>
  );
}
