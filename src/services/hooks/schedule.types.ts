export type ScheduleType = "WEEKLY" | "SUNDAY";

export interface TournamentSchedule {
  id: string;
  name: string;
  type: ScheduleType;
}

export interface TournamentScheduleItem {
  id?: string;
  scheduleId?: string;
  time: string;
  platform: string;
  name: string;
  currency: string;
  buyIn: number | string;
}

export type ScheduleTournament = TournamentScheduleItem;
