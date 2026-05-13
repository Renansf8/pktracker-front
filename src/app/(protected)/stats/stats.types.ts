import type {
  StatsBiggestBuyIn,
  StatsBucketRange,
  StatsBucketRecord,
  StatsHighestAbiDay,
  StatsMostTournamentsInADay,
  Tournament,
} from "@/services/hooks/types";

export interface BucketCardData {
  range: StatsBucketRange;
  label: string;
  record: StatsBucketRecord | null;
}

export interface StatsPlatformEntry {
  platform: string;
  profit: number;
  count: number;
}

export interface StatsPlatformStats {
  mostProfit: StatsPlatformEntry | null;
  mostLoss: StatsPlatformEntry | null;
  mostTournaments: StatsPlatformEntry | null;
  leastTournaments: StatsPlatformEntry | null;
}

export interface PodiumByPosition {
  gold: Tournament[];
  silver: Tournament[];
  bronze: Tournament[];
}

export interface StatsViewProps {
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
  biggestBuyIn: StatsBiggestBuyIn | null;
  mostTournamentsInADay: StatsMostTournamentsInADay | null;
  highestAbiDay: StatsHighestAbiDay | null;
  profitBuckets: BucketCardData[];
  lossBuckets: BucketCardData[];
  platformStats: StatsPlatformStats | null;
  allPlatforms: StatsPlatformEntry[];
  totalTournaments: number;
  itmRate: number;
  ftRate: number;
  podiumByPosition: PodiumByPosition;
  ticketCount: number;
}
