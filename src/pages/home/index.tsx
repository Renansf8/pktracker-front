import { NavBar } from "@/components/NavBar";
import { SummarizeCards } from "@/components/Summarize Cards";
import { SummarizeResults } from "@/components/SummarizeResults";
import type { Tournament } from "@/services/hooks/types";
import { useGetUser } from "@/services/hooks/useGetUser";
import { useTournaments } from "@/services/hooks/useTournaments";

export const Home = () => {
  const { data: user, isLoading } = useGetUser();
  const { getAllTournaments } = useTournaments();

  const { data: tournaments } = getAllTournaments;

  const totalTournaments = tournaments?.data?.length;
  const totalBuyIn = tournaments?.data?.reduce(
    (acc: number, tournament: Tournament) => {
      return acc + Number(tournament.buyIn);
    },
    0
  );

  const abi = totalBuyIn / totalTournaments || 0;

  const totalProfit = tournaments?.data?.reduce(
    (acc: number, tournament: Tournament) => {
      const total = acc + Number(tournament.result);
      return total;
    },
    0
  );

  const totalWinnings = tournaments?.data?.reduce(
    (acc: number, tournament: Tournament) => {
      const total = acc + Number(tournament.profit);
      return total;
    },
    0
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <NavBar />
      <div className="flex flex-col justify-center w-[80%] mx-auto mt-8">
        <p className="text-text-primary">Fala, {user?.name} </p>
        <p className="text-text-primary">
          Banca: <b>{user?.bank.bank.toFixed(2)} U$</b>
        </p>
        <SummarizeCards
          totalTournaments={totalTournaments}
          totalProfit={totalProfit}
          totalWinnings={totalWinnings}
          abi={abi}
        />
        <SummarizeResults />
      </div>
    </div>
  );
};
