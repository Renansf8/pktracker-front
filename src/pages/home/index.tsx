import { SummarizeCards } from "@/components/Summarize Cards";
import { SummarizeResults } from "@/components/SummarizeResults";

import type { Tournament } from "@/services/hooks/types";
import { useCurrency } from "@/services/hooks/useCurrency";
import { useGetUser } from "@/services/hooks/useGetUser";
import { useTournaments } from "@/services/hooks/useTournaments";

import { convertUsdToBrl } from "@/utils/currencyConvert";

export const Home = () => {
  const { data: user, isLoading } = useGetUser();
  const { currencies } = useCurrency();
  const { getAllTournaments } = useTournaments();

  const { data: tournaments } = getAllTournaments;

  const totalTournaments = tournaments?.data?.length;
  const totalBuyIn = tournaments?.data?.data?.reduce(
    (acc: number, tournament: Tournament) => {
      return acc + Number(tournament.buyIn);
    },
    0
  );

  const abi = totalBuyIn / totalTournaments || 0;

  const totalProfit = tournaments?.data?.data?.reduce(
    (acc: number, tournament: Tournament) => {
      const total = acc + Number(tournament.result);
      return total;
    },
    0
  );

  const totalWinnings = tournaments?.data?.data?.reduce(
    (acc: number, tournament: Tournament) => {
      const total = acc + Number(tournament.profit);
      return total;
    },
    0
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log("currencies", currencies);

  return (
    <div>
      <div className="flex flex-col justify-center w-[90%] mx-auto mt-8">
        <p className="text-text-primary">Fala, {user?.name} </p>
        <p className="text-text-primary">
          Banca:{" "}
          <b>
            $ {user?.bank?.bank?.toFixed(2) ?? "0.00"} (
            {user?.bank?.bank !== undefined &&
            currencies?.data?.rates?.BRL !== undefined
              ? convertUsdToBrl(currencies.data.rates.BRL * user.bank.bank)
              : "0.00"}
            )
          </b>
        </p>
        <SummarizeCards
          totalTournaments={totalTournaments}
          totalProfit={totalProfit}
          totalWinnings={totalWinnings}
          abi={abi}
          totalBuyIn={totalBuyIn}
        />
        <SummarizeResults />
      </div>
    </div>
  );
};
