import { BarChart, Text, Title } from "@tremor/react";

const usd = (v: number) => `$ ${v.toFixed(2)}`;

/** Largura do eixo Y para valores $ com casa decimal não serem cortados */
const yAxisMoneyWidth = 92;

type DayRow = { torneio: string; Lucro: number };
type MonthRow = { dia: string; Lucro: number };

export function DayProfitBarChart({ data }: { data: DayRow[] }) {
  if (data.length === 0) {
    return (
      <p className="mt-4 text-sm text-slate-400">
        Nenhum torneio neste dia — sem dados para o gráfico.
      </p>
    );
  }

  return (
    <div className="dark mt-6">
      <div className="glass-chart-surface p-4 sm:p-5">
        <Title className="text-base font-semibold text-slate-100">
          Lucro por torneio (hoje)
        </Title>
        <Text className="text-sm text-slate-400">
          Cada barra é um torneio do dia · valores em USD (lucro pode ser
          negativo)
        </Text>
        <BarChart
          className="mt-4 h-72 pl-1"
          data={data}
          index="torneio"
          categories={["Lucro"]}
          colors={["blue"]}
          valueFormatter={(v) => usd(Number(v))}
          yAxisWidth={yAxisMoneyWidth}
          padding={{ left: 12, right: 16 }}
          showAnimation
          showLegend={false}
        />
      </div>
    </div>
  );
}

export function MonthProfitBarChart({ data }: { data: MonthRow[] }) {
  return (
    <div className="dark mt-6">
      <div className="glass-chart-surface overflow-x-auto p-4 sm:p-5">
        <Title className="text-base font-semibold text-slate-100">
          Lucro por dia (mês atual)
        </Title>
        <Text className="text-sm text-slate-400">
          Todos os dias do mês · dias sem torneio aparecem com $ 0,00
        </Text>
        <BarChart
          className="mt-4 h-80 min-w-[640px] pl-1"
          data={data}
          index="dia"
          categories={["Lucro"]}
          colors={["blue"]}
          valueFormatter={(v) => usd(Number(v))}
          yAxisWidth={yAxisMoneyWidth}
          padding={{ left: 12, right: 16 }}
          barCategoryGap="8%"
          rotateLabelX={{
            angle: -45,
            verticalShift: 6,
            xAxisHeight: 72,
          }}
          showAnimation
          showLegend={false}
        />
      </div>
    </div>
  );
}
