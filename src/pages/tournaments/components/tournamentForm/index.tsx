"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { useTournaments } from "@/services/hooks/useTournaments";
import { convertBrDateToUs } from "@/utils/dateConvert";

export const TournamentForm = () => {
  const schema = z.object({
    date: z.string().nonempty({ message: "Data é obrigatória" }),
    platform: z.string().nonempty({ message: "Plataforma é obrigatória" }),
    name: z.string().nonempty({ message: "Nome é obrigatório" }),
    currency: z.string().nonempty({ message: "Moeda é obrigatória" }),
    buyIn: z.string().nonempty({ message: "Buy-in é obrigatório" }),
    result: z.string().nonempty({ message: "Resultado é obrigatório" }),
  });

  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: "",
      platform: "",
      name: "",
      currency: "",
      buyIn: "",
      result: "",
    },
  });

  const { createTournament } = useTournaments();

  const onSubmit = (data: FormData) => {
    const convertedDate = convertBrDateToUs(data.date);
    const tournamentData = {
      ...data,
      date: convertedDate,
      buyIn: Number(data.buyIn),
      result: Number(data.result),
    };
    createTournament.mutate(tournamentData);
    form.reset();
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <p className="text-text-primary text-xl font-bold">Adicionar Torneio</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex gap-4 text-text-primary items-end">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input
                      className="border-input-border"
                      placeholder="01/01/2025"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plataforma</FormLabel>
                  <FormControl>
                    <Input
                      className="border-input-border"
                      placeholder="PokerStars"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Torneio</FormLabel>
                  <FormControl>
                    <Input
                      className="border-input-border"
                      placeholder="Daily big"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moeda</FormLabel>
                  <FormControl>
                    <Input
                      className="border-input-border"
                      placeholder="USD"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="buyIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buy-in</FormLabel>
                  <FormControl>
                    <Input
                      className="border-input-border"
                      placeholder="3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="result"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resultado</FormLabel>
                  <FormControl>
                    <Input
                      className="border-input-border"
                      placeholder="10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="p-0 bg-success/90 hover:bg-success/80"
            >
              Adicionar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
