export interface MonthlyStats {
  year: number;
  month: number;
  profit: number;
  totalBuyIn: number;
  count: number;
  itmCount: number;
  itmRate: number;
  ftCount: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  abi: number;
  days: number;
}

export interface MonthlyYearTotals {
  profit: number;
  count: number;
  totalBuyIn: number;
  itmRate: number;
  abi: number;
  days: number;
}

export interface MonthlyViewProps {
  isLoading: boolean;
  selectedYear: number;
  availableYears: number[];
  months: MonthlyStats[];
  yearTotals: MonthlyYearTotals;
  brlRate: number | undefined;
  onYearChange: (year: number) => void;
}
