import { Card } from "./ui/card";

interface ActivityCardProps {
  title: string;
  value: number;
  isOverall?: boolean;
}

export const ActivityCard = ({
  title,
  value,
  isOverall,
}: ActivityCardProps) => {
  return (
    <Card className="bg-background-tertiary border-input-border p-4 w-full">
      <p className="text-text-secondary">{title}</p>
      <p className="text-text-primary text-2xl">
        {value} {isOverall ? "(+ 7.645)" : ""}
      </p>
    </Card>
  );
};
