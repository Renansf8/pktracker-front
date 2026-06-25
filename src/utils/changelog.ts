export const CHANGELOG_VERSION = "2026-06-25-v1";

export type ChangelogType = "feature" | "fix" | "improvement";

export interface ChangelogEntry {
  type: ChangelogType;
  title: string;
  description: string;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    type: "feature",
    title: "Performance Mensal",
    description:
      "Nova página /mensal com histórico mês a mês: profit, torneios, ITM%, ABI, buy-in total e dias jogados. Navegue entre anos pelas setas e veja o mês atual destacado. Cada card tem uma barra proporcional ao melhor mês do ano.",
  },
  {
    type: "fix",
    title: "Importar grade — horário corrigido",
    description:
      "Ao importar uma grade de torneios, o horário agora é registrado corretamente no fuso horário local (UTC-3), sem mais o deslocamento de 3 horas.",
  },
];
