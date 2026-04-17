import type {
  StatsBiggestBuyIn,
  StatsBucketRange,
  StatsBucketRecord,
  StatsHighestAbiDay,
  StatsMostTournamentsInADay,
} from "@/services/hooks/types";

export interface BucketCardData {
  range: StatsBucketRange;
  label: string;
  record: StatsBucketRecord | null;
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
}
