import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummarizeCards } from "./Summarize Cards";
import type { Tournament } from "@/services/hooks/types";
import { useTournaments } from "@/services/hooks/useTournaments";
import { convertIsoDateToBr } from "@/utils/dateConvert";

/** Layout for período (Dia / Semana / …); cores vêm do `tabs` base alinhado ao glass */
const periodTabsListClass =
  "h-auto w-full max-w-xl flex-wrap gap-1 rounded-xl p-1.5 sm:w-[50%]";

const periodTabTriggerClass = "min-w-[4.25rem] flex-1 px-3 py-2.5";

export const SummarizeResults = () => {
  const { getAllTournaments } = useTournaments();

  const { data: tournaments } = getAllTournaments;

  const today = new Date();
  const todayBr = `${today.getDate().toString().padStart(2, "0")}/${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;

  // Get month name in Portuguese
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const currentMonthName = monthNames[today.getMonth()];

  const todayTournaments = tournaments?.data?.data?.filter(
    (tournament: Tournament) => {
      const tournamentDate = convertIsoDateToBr(tournament.date).split(" ")[0]; // Get only the date part
      return tournamentDate === todayBr;
    },
  );

  // Format for comparison (MM/YYYY)
  const currentMonthFormat = `${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;

  const monthTournaments = tournaments?.data?.data?.filter(
    (tournament: Tournament) => {
      const tournamentDate = convertIsoDateToBr(tournament.date).split(" ")[0]; // Get only the date part
      const [, month, year] = tournamentDate.split("/");
      return `${month}/${year}` === currentMonthFormat;
    },
  );

  // Daily stats
  const totalTournaments = todayTournaments?.length || 0;

  const totalBuyIn =
    todayTournaments?.reduce((acc: number, tournament: Tournament) => {
      return acc + Number(tournament.buyIn);
    }, 0) || 0;

  const abi = totalTournaments > 0 ? totalBuyIn / totalTournaments : 0;

  const totalProfit =
    todayTournaments?.reduce((acc: number, tournament: Tournament) => {
      const total = acc + Number(tournament.result);
      return total;
    }, 0) || 0;

  const totalWinnings =
    todayTournaments?.reduce((acc: number, tournament: Tournament) => {
      const total = acc + Number(tournament.profit);
      return total;
    }, 0) || 0;

  // Monthly stats
  const monthlyTotalTournaments = monthTournaments?.length || 0;

  const monthlyTotalBuyIn =
    monthTournaments?.reduce((acc: number, tournament: Tournament) => {
      return acc + Number(tournament.buyIn);
    }, 0) || 0;

  const monthlyAbi =
    monthlyTotalTournaments > 0
      ? monthlyTotalBuyIn / monthlyTotalTournaments
      : 0;

  const monthlyTotalProfit =
    monthTournaments?.reduce((acc: number, tournament: Tournament) => {
      const total = acc + Number(tournament.result);
      return total;
    }, 0) || 0;

  const monthlyTotalWinnings =
    monthTournaments?.reduce((acc: number, tournament: Tournament) => {
      const total = acc + Number(tournament.profit);
      return total;
    }, 0) || 0;

  return (
    <div className="glass-panel mt-8 flex flex-col gap-6 rounded-3xl p-6 sm:p-8">
      <p className="text-text-primary text-2xl font-semibold tracking-tight">
        Resultados
      </p>

      <Tabs defaultValue="dia">
        <TabsList className={periodTabsListClass}>
          <TabsTrigger className={periodTabTriggerClass} value="dia">
            Dia
          </TabsTrigger>
          <TabsTrigger className={periodTabTriggerClass} value="semana">
            Semana
          </TabsTrigger>
          <TabsTrigger className={periodTabTriggerClass} value="mes">
            Mês
          </TabsTrigger>
          <TabsTrigger className={periodTabTriggerClass} value="ano">
            Ano
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dia">
          <p className="text-text-primary text-lg">{todayBr}</p>
          <SummarizeCards
            totalTournaments={totalTournaments}
            totalProfit={totalProfit}
            totalWinnings={totalWinnings}
            abi={abi}
            totalBuyIn={totalBuyIn}
            cardVariant="nested"
          />
        </TabsContent>
        <TabsContent value="mes">
          <p className="text-text-primary text-xl">{currentMonthName}</p>
          <SummarizeCards
            totalTournaments={monthlyTotalTournaments}
            totalProfit={monthlyTotalProfit}
            totalWinnings={monthlyTotalWinnings}
            abi={monthlyAbi}
            totalBuyIn={monthlyTotalBuyIn}
            cardVariant="nested"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
