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

export interface BankViewProps {
  isLoading: boolean;
  amount: number | undefined;
  deposits: BankDeposit[];
  withdrawals: BankWithdrawal[];
  onAmountChange: (value: number | undefined) => void;
  onDeposit: () => void;
  onWithdrawal: () => void;
}
