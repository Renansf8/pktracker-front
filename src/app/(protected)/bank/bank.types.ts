export interface BankDeposit {
  id?: string;
  date: string;
  amount: number;
}

export interface BankWithdrawal {
  id?: string;
  date: string;
  amount: number;
}

export interface BankRake {
  id?: string;
  date: string;
  amount: number;
  platform?: string;
}

export interface BankMonthlyStats {
  year: number;
  month: number;
  deposits: number;
  withdrawals: number;
  rake: number;
  depositCount: number;
  withdrawalCount: number;
  rakeCount: number;
  net: number;
}

export interface BankYearTotals {
  deposits: number;
  withdrawals: number;
  rake: number;
  net: number;
}

export interface BankViewProps {
  isLoading: boolean;
  amount: string;
  rakeAmount: string;
  rakePlatform: string;
  deposits: BankDeposit[];
  withdrawals: BankWithdrawal[];
  rakes: BankRake[];
  dailyLimitPct: number;
  dailyLimitInput: string;
  months: BankMonthlyStats[];
  yearTotals: BankYearTotals;
  selectedYear: number;
  availableYears: number[];
  onAmountChange: (value: string) => void;
  onRakeAmountChange: (value: string) => void;
  onRakePlatformChange: (value: string) => void;
  onDeposit: () => void;
  onWithdrawal: () => void;
  onRake: () => void;
  onDailyLimitInputChange: (value: string) => void;
  onSaveDailyLimit: () => void;
  onYearChange: (year: number) => void;
}
