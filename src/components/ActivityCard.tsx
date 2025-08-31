import { Card } from "./ui/card";

interface ActivityCardProps {
  title: string;
  value: number;
  isValuePositiveOrNegative?: boolean;
  isCurrency?: boolean;
}

export const ActivityCard = ({
  title,
  value,
  isValuePositiveOrNegative,
  isCurrency,
}: ActivityCardProps) => {
  return (
    <Card className="bg-background-tertiary border-input-border p-4 w-full">
      <p className="text-text-secondary">{title}</p>
      {isValuePositiveOrNegative ? (
        <p
          className={`text-2xl ${
            value > 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          $ {value}
        </p>
      ) : isCurrency ? (
        <p className="text-2xl text-text-primary">$ {value}</p>
      ) : (
        <p className="text-2xl text-text-primary">{value}</p>
      )}
    </Card>
  );
};
