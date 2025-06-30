import { NavBar } from "@/components/NavBar";
import { SummarizeCards } from "@/components/Summarize Cards";
import { SummarizeResults } from "@/components/SummarizeResults";
import { useGetUser } from "@/services/hooks/useGetUser";

export const Home = () => {
  const { data: user, isLoading } = useGetUser();

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
        <SummarizeCards />
        <SummarizeResults />
      </div>
    </div>
  );
};
