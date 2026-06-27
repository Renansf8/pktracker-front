import { Card } from "./ui/card";

interface ActivityCardProps {
  title: string;
  value: number;
  isValuePositiveOrNegative?: boolean;
  isCurrency?: boolean;
  convertedValue?: string;
  suffix?: string;
  variant?: "elevated" | "nested";
}

export const ActivityCard = ({
  title,
  value,
  isValuePositiveOrNegative,
  isCurrency,
  convertedValue,
  suffix,
  variant = "elevated",
}: ActivityCardProps) => {
  const surface =
    variant === "nested"
      ? "glass-inner w-full border-0 bg-transparent py-4 px-4 shadow-none text-text-primary"
      : "glass-panel w-full border-0 bg-transparent py-5 px-5 shadow-none text-text-primary";

  return (
    <Card className={surface}>
      <p className="activity-card-title">{title}</p>

      {isValuePositiveOrNegative ? (
        <p
          className={
            value > 0
              ? "activity-card-value-positive"
              : "activity-card-value-negative"
          }
        >
          $ {value}
          {convertedValue && (
            <span className="activity-card-converted">({convertedValue})</span>
          )}
        </p>
      ) : isCurrency ? (
        <p className="activity-card-value">
          $ {value}
          {convertedValue && (
            <span className="activity-card-converted">({convertedValue})</span>
          )}
        </p>
      ) : (
        <p className="activity-card-value">
          {value}
          {suffix}
        </p>
      )}
    </Card>
  );
};
