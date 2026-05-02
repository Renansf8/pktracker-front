export interface StakesProgression {
  lowStake: number;
  highStake: number | null;
  nextLowStake: number | null;
  bankNeededForNextLow: number | null;
  progressToNextLow: number;
  bankUsd: number;
  rangeMin: number;
  rangeMax: number;
  customBuyIns: number | null;
}

export interface Milestone {
  id: string;
  label: string;
  sublabel: string;
  date: string;
  value?: number;
  icon: string;
}

export interface StakingDeal {
  id: string;
  backerName: string;
  myPct: number;
  markup: number;
  notes: string;
  createdAt: string;
}

export interface NewDealState {
  backerName: string;
  myPct: string;
  markup: string;
  notes: string;
}

export interface CareerViewProps {
  isLoading: boolean;
  totalTournaments: number;
  stakesProgression: StakesProgression | null;
  milestones: Milestone[];
  stakingDeals: StakingDeal[];
  newDealState: NewDealState;
  onNewDealChange: (field: string, value: string) => void;
  onAddStakingDeal: () => void;
  onRemoveStakingDeal: (id: string) => void;
}
