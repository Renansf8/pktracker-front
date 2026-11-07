"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlatformTag } from "@/components/PlatformTag";
import { cn } from "@/lib/utils";
import { CURRENCY_SYMBOLS, formatIsoDate, formatValue, valueTone } from "@/utils/insightsFormat";
import type {
  DashboardBucket,
  DashboardGroupBy,
  DashboardPeriod,
  DashboardWidget,
  DashboardWidgetData,
  GeneratedDashboard,
} from "@/services/hooks/genui.types";

const COLOR_POSITIVE = "#22c55e";
const COLOR_NEGATIVE = "#ef4444";
const COLOR_NEUTRAL = "#38bdf8";
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const tickStyle = { fill: "var(--color-muted-foreground)", fontSize: 11 };
const GROUP_LABELS: Record<DashboardGroupBy, string> = {
  platform: "Plataforma",
  currency: "Moeda",
  tournament_name: "Torneio",
  buy_in_range: "Faixa de buy-in",
};

function formatEntryBuyIn(entry: { currency: string; buyIn: number | null }): string {
  if (entry.buyIn === null) return "Ticket";
  const symbol = CURRENCY_SYMBOLS[entry.currency] ?? `${entry.currency} `;
  return `${symbol} ${entry.buyIn.toFixed(2)}`;
}

function formatPeriod(period: DashboardPeriod): string {
  return `${formatIsoDate(period.from)} – ${formatIsoDate(period.to)}`;
}

function formatBucket(iso: string, bucket: DashboardBucket): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (bucket === "month") return `${MONTHS[Number(m) - 1]}/${y.slice(2)}`;
  return `${d}/${m}`;
}

function WidgetShell({
  widget,
  className,
  children,
}: {
  widget: DashboardWidget;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn("glass-panel rounded-2xl p-5 flex flex-col gap-4 min-w-0", className)}
    >
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-text-primary">
          {widget.title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {widget.platform && <PlatformTag platform={widget.platform} />}
          <span className="font-data text-[10px] uppercase tracking-[0.14em] text-muted-foreground whitespace-nowrap">
            {formatPeriod(widget.period)}
          </span>
        </div>
      </header>
      {children}
    </section>
  );
}

function EmptyData() {
  return (
    <p className="font-data text-xs uppercase tracking-[0.12em] text-muted-foreground py-8 text-center">
      Sem torneios nesse período
    </p>
  );
}

function StatWidget({
  data,
}: {
  data: Extract<DashboardWidgetData, { type: "stat" }>;
}) {
  return (
    <p className={cn("font-data text-4xl font-semibold tabular-nums", valueTone(data.value, data.unit))}>
      {formatValue(data.value, data.unit)}
    </p>
  );
}

function LineWidget({
  widget,
  data,
}: {
  widget: Extract<DashboardWidget, { type: "line_chart" }>;
  data: Extract<DashboardWidgetData, { type: "line_chart" }>;
}) {
  if (!data.points.length) return <EmptyData />;
  const rows = data.points.map((p) => ({
    label: formatBucket(p.bucket, widget.bucket),
    value: p.value,
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(148 163 184 / 0.22)" vertical={false} />
        <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
        <YAxis
          width={80}
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatValue(Number(v), data.unit)}
        />
        {data.unit !== "count" && <ReferenceLine y={0} stroke="rgb(148 163 184 / 0.5)" />}
        <Tooltip formatter={(v) => formatValue(Number(v), data.unit)} />
        <Line type="monotone" dataKey="value" stroke={COLOR_NEUTRAL} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarWidget({
  widget,
  data,
}: {
  widget: Extract<DashboardWidget, { type: "bar_chart" }>;
  data: Extract<DashboardWidgetData, { type: "bar_chart" }>;
}) {
  if (!data.bars.length) return <EmptyData />;
  const rows = data.bars.map((b) => ({ label: b.label, value: b.value ?? 0 }));
  // Tournament names are long: tilt them so they don't overlap.
  const tilted = widget.groupBy === "tournament_name";
  return (
    <ResponsiveContainer width="100%" height={tilted ? 340 : 260}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(148 163 184 / 0.22)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={tilted ? -30 : 0}
          textAnchor={tilted ? "end" : "middle"}
          height={tilted ? 90 : 30}
        />
        <YAxis
          width={80}
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatValue(Number(v), data.unit)}
        />
        <Tooltip formatter={(v) => formatValue(Number(v), data.unit)} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {rows.map((row) => (
            <Cell
              key={row.label}
              fill={
                data.unit === "count"
                  ? COLOR_NEUTRAL
                  : row.value < 0
                    ? COLOR_NEGATIVE
                    : COLOR_POSITIVE
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function TableWidget({
  widget,
  data,
}: {
  widget: Extract<DashboardWidget, { type: "table" }>;
  data: Extract<DashboardWidgetData, { type: "table" }>;
}) {
  if (!data.rows.length) return <EmptyData />;
  // A tournament is name + platform + buy-in. The platform column is left out
  // when the widget is filtered to one platform (the header tag says which).
  const isTournament = widget.groupBy === "tournament_name";
  const showPlatform = isTournament && !widget.platform;
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{GROUP_LABELS[widget.groupBy]}</TableHead>
            {showPlatform && <TableHead>Plataforma</TableHead>}
            {isTournament && <TableHead className="text-right">Buy-in</TableHead>}
            <TableHead className="text-right">Torneios</TableHead>
            <TableHead className="text-right">Investido</TableHead>
            <TableHead className="text-right">Lucro</TableHead>
            <TableHead className="text-right">ROI</TableHead>
            <TableHead className="text-right">ITM</TableHead>
            <TableHead className="text-right">FT</TableHead>
            <TableHead className="text-right">ABI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((row) => (
            <TableRow
              key={`${row.label}-${row.entry?.platform ?? ""}-${row.entry?.currency ?? ""}-${row.entry?.buyIn ?? ""}`}
            >
              <TableCell>
                {widget.groupBy === "platform" ? <PlatformTag platform={row.label} /> : row.label}
              </TableCell>
              {showPlatform && (
                <TableCell>{row.entry ? <PlatformTag platform={row.entry.platform} /> : "—"}</TableCell>
              )}
              {isTournament && (
                <TableCell className="text-right tabular-nums">
                  {row.entry ? formatEntryBuyIn(row.entry) : "—"}
                </TableCell>
              )}
              <TableCell className="text-right tabular-nums">{row.tournaments}</TableCell>
              <TableCell className="text-right tabular-nums">{formatValue(row.buyIns, "money")}</TableCell>
              <TableCell className={cn("text-right tabular-nums", valueTone(row.profit, "money"))}>
                {formatValue(row.profit, "money")}
              </TableCell>
              <TableCell className={cn("text-right tabular-nums", valueTone(row.roi, "percent"))}>
                {formatValue(row.roi, "percent")}
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatValue(row.itmRate, "percent")}</TableCell>
              <TableCell className="text-right tabular-nums">{formatValue(row.ftRate, "percent")}</TableCell>
              <TableCell className="text-right tabular-nums">{formatValue(row.abi, "money")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatMoneyIn(value: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return `${symbol} ${value.toFixed(2)}`;
}

function TournamentListWidget({
  widget,
  data,
}: {
  widget: Extract<DashboardWidget, { type: "tournament_list" }>;
  data: Extract<DashboardWidgetData, { type: "tournament_list" }>;
}) {
  if (!data.rows.length) return <EmptyData />;
  const showPlatform = !widget.platform;
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Torneio</TableHead>
            {showPlatform && <TableHead>Plataforma</TableHead>}
            <TableHead className="text-right">Buy-in</TableHead>
            <TableHead className="text-right">Posição</TableHead>
            <TableHead className="text-right">Prêmio</TableHead>
            <TableHead className="text-right">Lucro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((row, index) => (
            <TableRow key={`${row.date}-${row.name}-${index}`}>
              <TableCell className="tabular-nums whitespace-nowrap">{formatIsoDate(row.date)}</TableCell>
              <TableCell>{row.name}</TableCell>
              {showPlatform && (
                <TableCell>
                  <PlatformTag platform={row.platform} />
                </TableCell>
              )}
              <TableCell className="text-right tabular-nums">{formatEntryBuyIn(row)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {row.position ? `${row.position}º` : "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.prize === null
                  ? "—"
                  : row.prize === "ticket"
                    ? "Ticket"
                    : formatMoneyIn(row.prize, row.currency)}
              </TableCell>
              <TableCell className={cn("text-right tabular-nums", valueTone(row.profit, "money"))}>
                {formatMoneyIn(row.profit, row.currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function renderWidgetBody(widget: DashboardWidget, data: DashboardWidgetData | undefined) {
  if (!data || data.type !== widget.type) return <EmptyData />;
  switch (widget.type) {
    case "stat":
      return <StatWidget data={data as Extract<DashboardWidgetData, { type: "stat" }>} />;
    case "line_chart":
      return (
        <LineWidget
          widget={widget}
          data={data as Extract<DashboardWidgetData, { type: "line_chart" }>}
        />
      );
    case "bar_chart":
      return (
        <BarWidget
          widget={widget}
          data={data as Extract<DashboardWidgetData, { type: "bar_chart" }>}
        />
      );
    case "table":
      return (
        <TableWidget
          widget={widget}
          data={data as Extract<DashboardWidgetData, { type: "table" }>}
        />
      );
    case "tournament_list":
      return (
        <TournamentListWidget
          widget={widget}
          data={data as Extract<DashboardWidgetData, { type: "tournament_list" }>}
        />
      );
  }
}

export function DashboardRenderer({
  dashboard,
  afterSummary,
}: {
  dashboard: GeneratedDashboard;
  /** Rendered between the dashboard summary and its widgets. */
  afterSummary?: React.ReactNode;
}) {
  const { spec, data } = dashboard;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-text-primary">{spec.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{spec.summary}</p>
      </div>

      {afterSummary}

      {spec.widgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spec.widgets.map((widget, index) => (
            <WidgetShell
              key={`${widget.type}-${index}`}
              widget={widget}
              className={widget.type === "stat" ? undefined : "md:col-span-2"}
            >
              {renderWidgetBody(widget, data[index])}
            </WidgetShell>
          ))}
        </div>
      )}
    </div>
  );
}
