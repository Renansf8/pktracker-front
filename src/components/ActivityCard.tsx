import { Card } from "./ui/card";

interface ActivityCardProps {
  title: string;
  value: number;
  isValuePositiveOrNegative?: boolean;
  isCurrency?: boolean;
  convertedValue?: string;
  /** nested = inset glass inside an outer glass panel (e.g. abas Resultados) */
  variant?: "elevated" | "nested";
}

export const ActivityCard = ({
  title,
  value,
  isValuePositiveOrNegative,
  isCurrency,
  convertedValue,
  variant = "elevated",
}: ActivityCardProps) => {
  const surface =
    variant === "nested"
      ? "glass-inner w-full gap-3 border border-white/10 bg-transparent py-4 px-4 shadow-none rounded-2xl text-text-primary"
      : "glass-panel w-full gap-3 border-0 bg-transparent py-5 px-5 shadow-none rounded-3xl text-text-primary";

  return (
    <Card className={surface}>
      <p className="text-text-secondary">{title}</p>
      {isValuePositiveOrNegative ? (
        <p
          className={`text-[16px] ${
            value > 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          $ {value} ({convertedValue})
        </p>
      ) : isCurrency ? (
        <p className="text-[16px] text-text-primary">$ {value}</p>
      ) : (
        <p className="text-[16px] text-text-primary">{value}</p>
      )}
    </Card>
  );
};
