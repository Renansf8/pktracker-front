export interface HomeViewProps {
  isLoading: boolean;
  userName: string;
  bankDisplayText: string;
  /** Banca em USD (valor numérico para sugestões) */
  bankUsd: number;
  /** Soma dos buy-ins dos torneios com data de hoje (calendário local). */
  todayTotalBuyIn: number;
  totalTournaments: number;
  totalBuyIn: number;
  abi: number;
  totalProfit: number;
  totalWinnings: number;
}
