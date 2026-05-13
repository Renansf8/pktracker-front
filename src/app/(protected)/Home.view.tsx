"use client";

import { GoalProgress } from "@/components/GoalProgress";
import { PlayerSuggestions } from "@/components/PlayerSuggestions";
import { SummarizeCards } from "@/components/Summarize Cards";
import { SummarizeResults } from "@/components/SummarizeResults";
import { WhatsNewModal } from "@/components/WhatsNewModal";
import { useWhatsNew } from "@/utils/useWhatsNew";
import { useHomeViewModel } from "./home.viewmodel";

export function HomeView() {
  const { open, dismiss, changelog, version } = useWhatsNew();
  const {
    isLoading,
    userName,
    memberSince,
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
    goldCount,
    silverCount,
    bronzeCount,
    monthlyProfitUsd,
    yearlyProfitUsd,
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
    <>
      <WhatsNewModal
        open={open}
        onClose={dismiss}
        changelog={changelog}
        version={version}
      />
      <div className="flex flex-col w-[90%] mx-auto mt-10 gap-10">
        {/* ── Header: greeting + banca ─────────────────────────────────────── */}
        <header
          className="flex items-end justify-between pb-6"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.18em] font-medium mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Bem-vindo de volta
            </p>
            <h1
              className="font-display text-3xl font-bold text-text-primary leading-none"
              style={{ letterSpacing: "0.02em" }}
            >
              {userName}
            </h1>
            {memberSince && (
              <p
                className="font-data text-[10px] uppercase tracking-[0.18em] mt-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                membro desde {memberSince}
              </p>
            )}
          </div>

          <div className="text-right">
            <p
              className="text-[10px] uppercase tracking-[0.18em] font-medium mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Banca atual
            </p>
            <p
              className="font-data text-2xl font-semibold leading-none"
              style={{ color: "var(--primary)" }}
            >
              {bankDisplayText}
            </p>
            {bankUsd > 0 && (
              <p
                className="font-data text-xs mt-1.5"
                style={{ color: "var(--muted-foreground)" }}
              >
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

        <section>
          <p
            className="text-[10px] uppercase tracking-[0.18em] font-medium mb-4"
            style={{ color: "var(--muted-foreground)" }}
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
            goldCount={goldCount}
            silverCount={silverCount}
            bronzeCount={bronzeCount}
            twoRows
          />
        </section>

        <GoalProgress
          monthlyProfitUsd={monthlyProfitUsd}
          yearlyProfitUsd={yearlyProfitUsd}
        />

        <PlayerSuggestions
          bankUsd={bankUsd}
          todayTotalBuyIn={todayTotalBuyIn}
        />

        <SummarizeResults />
      </div>
    </>
  );
}
