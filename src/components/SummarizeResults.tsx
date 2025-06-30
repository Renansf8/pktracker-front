import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const SummarizeResults = () => {
  return (
    <div className="flex flex-col gap-4 mt-8">
      <p className="text-text-primary text-3xl">Resultados</p>
      <div className="flex gap-4">
        <p className="text-text-primary">10</p>
      </div>
      <Tabs defaultValue="dia">
        <TabsList className="bg-background-tertiary w-[50%]">
          <TabsTrigger className="text-text-primary" value="dia">
            Dia
          </TabsTrigger>
          <TabsTrigger className="text-text-primary" value="semana">
            Semana
          </TabsTrigger>
          <TabsTrigger className="text-text-primary" value="mes">
            Mês
          </TabsTrigger>
          <TabsTrigger className="text-text-primary" value="ano">
            Ano
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
