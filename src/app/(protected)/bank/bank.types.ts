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
  onAmountChange: (value: string) => void;
  onRakeAmountChange: (value: string) => void;
  onRakePlatformChange: (value: string) => void;
  onDeposit: () => void;
  onWithdrawal: () => void;
  onRake: () => void;
  onDailyLimitInputChange: (value: string) => void;
  onSaveDailyLimit: () => void;
}
