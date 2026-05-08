export const CHANGELOG_VERSION = "2026-05-08-v1";

export type ChangelogType = "feature" | "fix" | "improvement";

export interface ChangelogEntry {
  type: ChangelogType;
  title: string;
  description: string;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    type: "feature",
    title: "Home — Pódio nos cards",
    description:
      "Seus melhores resultados agora têm destaque direto na home. Os cards exibem contagem de 1º, 2º e 3º lugar com ícones de troféu, dando visibilidade imediata às suas conquistas.",
  },
  {
    type: "feature",
    title: "Torneios — Sugestões por plataforma",
    description:
      "Ao registrar um torneio, o sistema agora sugere automaticamente nomes de torneios conhecidos com base na plataforma selecionada, tornando o cadastro mais rápido e padronizado.",
  },
  {
    type: "feature",
    title: "Estatísticas — Seção de pódio",
    description:
      "A página de estatísticas ganhou uma seção dedicada ao pódio, agrupando seus resultados de 1º, 2º e 3º lugar com totais e percentual em relação ao volume de torneios jogados.",
  },
];
