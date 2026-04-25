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
}

export interface BankViewProps {
  isLoading: boolean;
  amount: number | undefined;
  rakeAmount: number | undefined;
  deposits: BankDeposit[];
  withdrawals: BankWithdrawal[];
  rakes: BankRake[];
  onAmountChange: (value: number | undefined) => void;
  onRakeAmountChange: (value: number | undefined) => void;
  onDeposit: () => void;
  onWithdrawal: () => void;
  onRake: () => void;
}
