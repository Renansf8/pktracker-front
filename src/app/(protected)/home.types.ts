import type { Tournament } from "@/services/hooks/types";

export interface HomeViewProps {
  isLoading: boolean;
  userName: string;
  memberSince: string | null;
  bankDisplayText: string;
  bankUsd: number;
  todayTotalBuyIn: number;
  totalTournaments: number;
  totalBuyIn: number;
  abi: number;
  totalProfit: number;
  totalWinnings: number;
  itmPercentage: number;
  itmCount: number;
  ftCount: number;
  avgDailyBuyIn: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  monthlyProfitUsd: number;
  yearlyProfitUsd: number;
  ftTournaments: Tournament[];
  goldTournaments: Tournament[];
  silverTournaments: Tournament[];
  bronzeTournaments: Tournament[];
}
