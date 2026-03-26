export interface HomeViewProps {
  isLoading: boolean;
  userName: string;
  bankDisplayText: string;
  /** Banca em USD (valor numérico para sugestões) */
  bankUsd: number;
  totalTournaments: number;
  totalBuyIn: number;
  abi: number;
  totalProfit: number;
  totalWinnings: number;
}
