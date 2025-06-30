import { ActivityCard } from "./ActivityCard";

export const SummarizeCards = () => {
  return (
    <div className="flex gap-4 mt-4 w-full justify-between">
      <ActivityCard title="Torneios jogados" value={10} />
      <ActivityCard title="ABI" value={55} />
      <ActivityCard title="Ganhos totais (Lucro)" value={12.345} isOverall />
    </div>
  );
};
