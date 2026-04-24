/**
 * src/app/(protected)/Home.view.tsx
 * ---------------------------------------------------------------------------
 * View da Home. Precisa de "use client" porque chama `useHomeViewModel()`
 * (que usa hooks do TanStack Query). O conteúdo JSX é igual ao da versão SPA.
 */
"use client";

import { PlayerSuggestions } from "@/components/PlayerSuggestions";
import { SummarizeCards } from "@/components/Summarize Cards";
import { SummarizeResults } from "@/components/SummarizeResults";
import { useHomeViewModel } from "./home.viewmodel";

export function HomeView() {
  const {
    isLoading,
    userName,
    bankDisplayText,
    bankUsd,
    todayTotalBuyIn,
    totalTournaments,
    totalBuyIn,
    abi,
    totalProfit,
    totalWinnings,
    itmPercentage,
    itmCount,
    ftCount,
    avgDailyBuyIn,
  } = useHomeViewModel();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="font-data text-sm tracking-[0.1em] uppercase text-text-secondary animate-pulse">
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[90%] mx-auto mt-10 gap-10">
      {/* ── Header: greeting + banca ─────────────────────────────────────── */}
      <header
        className="flex items-end justify-between pb-6"
        style={{ borderBottom: "1px solid rgba(212,168,67,0.14)" }}
      >
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.18em] font-medium mb-2"
            style={{ color: "#7a7068" }}
          >
            Bem-vindo de volta
          </p>
          <h1
            className="font-display text-3xl font-bold text-text-primary leading-none"
            style={{ letterSpacing: "0.02em" }}
          >
            {userName}
          </h1>
        </div>

        <div className="text-right">
          <p
            className="text-[10px] uppercase tracking-[0.18em] font-medium mb-2"
            style={{ color: "#7a7068" }}
          >
            Banca atual
          </p>
          <p
            className="font-data text-2xl font-semibold leading-none"
            style={{ color: "#d4a843" }}
          >
            {bankDisplayText}
          </p>
          {bankUsd > 0 && (
            <p className="font-data text-xs mt-1.5" style={{ color: "#7a7068" }}>
              ${" "}
              {bankUsd.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              USD
            </p>
          )}
        </div>
      </header>

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <section>
        <p
          className="text-[10px] uppercase tracking-[0.18em] font-medium mb-4"
          style={{ color: "#7a7068" }}
        >
          Resumo geral
        </p>
        <SummarizeCards
          totalTournaments={totalTournaments}
          totalProfit={totalProfit}
          totalWinnings={totalWinnings}
          abi={abi}
          totalBuyIn={totalBuyIn}
          itmPercentage={itmPercentage}
          itmCount={itmCount}
          ftCount={ftCount}
          avgDailyBuyIn={avgDailyBuyIn}
          twoRows
        />
      </section>

      {/* ── Suggestions ──────────────────────────────────────────────────── */}
      <PlayerSuggestions bankUsd={bankUsd} todayTotalBuyIn={todayTotalBuyIn} />

      {/* ── Results / Charts ─────────────────────────────────────────────── */}
      <SummarizeResults />
    </div>
  );
}
