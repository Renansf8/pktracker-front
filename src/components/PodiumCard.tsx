import { Card } from "./ui/card";

interface PodiumCardProps {
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  variant?: "elevated" | "nested";
}

export function PodiumCard({
  goldCount,
  silverCount,
  bronzeCount,
  variant = "elevated",
}: PodiumCardProps) {
  const surface =
    variant === "nested"
      ? "glass-inner w-full border-0 bg-transparent py-4 px-4 shadow-none text-text-primary"
      : "glass-panel w-full border-0 bg-transparent py-5 px-5 shadow-none text-text-primary";

  return (
    <Card className={surface}>
      <p className="activity-card-title">Pódios</p>
      <div className="flex items-center gap-4 mt-1">
        <span className="flex items-center gap-1.5">
          <span className="text-xl leading-none">🥇</span>
          <span className="activity-card-value">{goldCount}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-xl leading-none">🥈</span>
          <span className="activity-card-value">{silverCount}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-xl leading-none">🥉</span>
          <span className="activity-card-value">{bronzeCount}</span>
        </span>
      </div>
    </Card>
  );
}
