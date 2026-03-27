export interface ScheduleTournament {
  id?: string;
  time: string; // "HH:mm"
  platform: string;
  name: string;
  currency: string;
  buyIn: number | string;
}

export interface PaginatedScheduleResponse {
  data: ScheduleTournament[];
  totalPages: number;
  total: number;
}

