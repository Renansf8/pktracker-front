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
