import { NavBar } from "@/components/NavBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tournament } from "@/services/hooks/types";
import { useTournaments } from "@/services/hooks/useTournaments";
import { TournamentForm } from "./components/tournamentForm";
import { convertIsoDateToBr } from "@/utils/dateConvert";

export const Tournaments = () => {
  const { getAllTournaments } = useTournaments();

  const { data: tournaments, isLoading } = getAllTournaments;

  console.log("tournaments", tournaments);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <NavBar />
      <div className="flex flex-col justify-center w-[80%] mx-auto mt-8">
        <h2 className="text-text-primary text-2xl font-bold">Torneios</h2>

        <TournamentForm />

        <Table className="mt-8">
          <TableHeader>
            <TableRow>
              <TableHead className="text-text-primary text-center">
                Data
              </TableHead>
              <TableHead className="text-text-primary text-center">
                Plataforma
              </TableHead>
              <TableHead className="text-text-primary text-center">
                Torneio
              </TableHead>
              <TableHead className="text-text-primary text-center">
                Moeda
              </TableHead>
              <TableHead className="text-text-primary text-center">
                Buy-in
              </TableHead>
              <TableHead className="text-text-primary text-center">
                Resultado
              </TableHead>
              <TableHead className="text-text-primary text-center">
                Profit
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments?.data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-text-primary text-center"
                >
                  Nenhum torneio encontrado
                </TableCell>
              </TableRow>
            ) : (
              tournaments?.data?.map((tournament: Tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell className="text-text-primary text-center">
                    {convertIsoDateToBr(tournament.date)}
                  </TableCell>
                  <TableCell className="text-text-primary text-center">
                    {tournament.platform}
                  </TableCell>
                  <TableCell className="text-text-primary text-center">
                    {tournament.name}
                  </TableCell>
                  <TableCell className="text-text-primary text-center">
                    {tournament.currency}
                  </TableCell>
                  <TableCell className="text-text-primary text-center">
                    {tournament.buyIn}
                  </TableCell>
                  <TableCell className={`text-text-primary  text-center`}>
                    {tournament.result}
                  </TableCell>
                  <TableCell
                    className={`${
                      tournament.profit! > 0 ? "text-green-500" : "text-red-500"
                    }  text-center`}
                  >
                    {tournament.profit}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
