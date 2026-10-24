// Mirrors pktracker-api/src/modules/genui (genui.schema.ts + dashboard.entity.ts).

export type DashboardGroupBy = "platform" | "currency" | "tournament_name" | "buy_in_range";
/** Metrics computed per group (stat, bar_chart). */
export type DashboardGroupMetric =
  | "roi"
  | "itm_rate"
  | "ft_rate"
  | "day2_rate"
  | "tournament_count"
  | "wins"
  | "podiums"
  | "abi"
  | "avg_profit"
  | "biggest_cash"
  | "total_invested";
export type DashboardOrder = "desc" | "asc";
export type DashboardBucket = "day" | "week" | "month";
export type DashboardValueUnit = "money" | "percent" | "count";

export interface DashboardPeriod {
  from: string;
  to: string;
}

export type DashboardWidget =
  | {
      type: "stat";
      title: string;
      metric: "total_profit" | DashboardGroupMetric;
      period: DashboardPeriod;
      platform: string | null;
    }
  | {
      type: "line_chart";
      title: string;
      metric: "cumulative_profit" | "profit" | "tournament_count";
      bucket: DashboardBucket;
      period: DashboardPeriod;
      platform: string | null;
    }
  | {
      type: "bar_chart";
      title: string;
      metric: "profit" | DashboardGroupMetric;
      groupBy: DashboardGroupBy;
      order: DashboardOrder;
      limit: number | null;
      period: DashboardPeriod;
      platform: string | null;
    }
  | {
      type: "table";
      title: string;
      groupBy: DashboardGroupBy;
      sortBy: "profit" | "roi" | "tournaments" | "buy_ins" | "itm_rate" | "ft_rate" | "abi";
      order: DashboardOrder;
      limit: number | null;
      period: DashboardPeriod;
      platform: string | null;
    }
  | {
      type: "tournament_list";
      title: string;
      sortBy: "profit" | "prize" | "buy_in" | "date";
      order: DashboardOrder;
      limit: number | null;
      period: DashboardPeriod;
      platform: string | null;
    };

export interface DashboardSpec {
  title: string;
  summary: string;
  widgets: DashboardWidget[];
}

export interface DashboardGroupStatsRow {
  label: string;
  /** Which tournament a tournament-name row is; null for other groupings.
   *  buyIn is null when the entries were paid with a ticket. */
  entry: { platform: string; currency: string; buyIn: number | null } | null;
  tournaments: number;
  buyIns: number;
  profit: number;
  roi: number | null;
  itmRate: number | null;
  ftRate: number | null;
  day2Rate: number | null;
  wins: number;
  podiums: number;
  abi: number | null;
  avgProfit: number | null;
  biggestCash: number | null;
}

export interface DashboardTournamentListItem {
  /** YYYY-MM-DD */
  date: string;
  name: string;
  platform: string;
  currency: string;
  /** null when paid with a ticket. */
  buyIn: number | null;
  /** null when nothing was won; "ticket" when the prize was a ticket. */
  prize: number | "ticket" | null;
  profit: number;
  position: number | null;
  itm: boolean;
  hasFt: boolean;
}

export type DashboardWidgetData =
  | { type: "stat"; value: number | null; unit: DashboardValueUnit }
  | {
      type: "line_chart";
      unit: DashboardValueUnit;
      points: { bucket: string; value: number }[];
    }
  | {
      type: "bar_chart";
      unit: DashboardValueUnit;
      bars: { label: string; value: number | null }[];
    }
  | { type: "table"; rows: DashboardGroupStatsRow[] }
  | { type: "tournament_list"; rows: DashboardTournamentListItem[] };

export interface GeneratedDashboard {
  spec: DashboardSpec;
  /** Same order as spec.widgets. */
  data: DashboardWidgetData[];
}
