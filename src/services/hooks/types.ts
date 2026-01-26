export interface Tournament {
  id?: string;
  date: string;
  platform: string;
  name: string;
  currency: string;
  buyIn: number | string;
  result: number | string;
  profit?: number;
}

export interface PaginatedTournamentsResponse {
  data: Tournament[];
  totalPages: number;
  total: number;
}

export interface Deposit {
  date: string;
  amount: number;
}

export interface Withdrawal {
  date: string;
  amount: number;
}
