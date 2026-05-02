export interface BankCurvePoint {
  date: string;
  balance: number;
  label: string;
}

export interface PeriodStats {
  profit: number;
  roi: number;
  abi: number;
  itmPct: number;
  count: number;
}

export interface HeatmapEntry {
  day: string;
  avg: number;
  count: number;
}

export interface StreakInfo {
  maxWinStreak: number;
  maxLossStreak: number;
  currentStreak: number;
  currentStreakType: "win" | "loss" | "neutral";
}

export interface AnalyticsViewProps {
  isLoading: boolean;
  hasCurveData: boolean;
  curve: BankCurvePoint[];
  currentBalance: number;
  thisMonth: PeriodStats;
  lastMonth: PeriodStats;
  thisMonthName: string;
  lastMonthName: string;
  heatmap: HeatmapEntry[];
  streaks: StreakInfo;
}
