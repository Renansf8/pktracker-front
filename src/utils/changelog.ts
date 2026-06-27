export const CHANGELOG_VERSION = "2026-06-27-v1";

export type ChangelogType = "feature" | "fix" | "improvement";

export interface ChangelogEntry {
  type: ChangelogType;
  title: string;
  description: string;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    type: "improvement",
    title: "Valores em real por toda a plataforma",
    description:
      "Os valores em BRL agora aparecem ao lado (ou abaixo) dos valores em dólar no Resumo Geral da home (Buy In total, Ganhos totais, Média de Buy-ins/dia) e na página de Banca (totais de Depósitos, Saques e Rake). A conversão foi corrigida para usar uma API de câmbio gratuita e confiável com o dólar como base.",
  },
  {
    type: "feature",
    title: "Hover em Final Tables e Pódios",
    description:
      "Passe o mouse sobre os cards de Final Tables ou Pódios no Resumo Geral para ver a lista dos últimos 10 torneios de cada categoria. No card de Pódios, alterne entre 🥇 🥈 🥉 pelas abas interativas.",
  },
];
