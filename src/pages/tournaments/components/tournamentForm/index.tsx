"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { useTournaments } from "@/services/hooks/useTournaments";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { platforms } from "@/utils/platforms";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

export const TournamentForm = () => {
  const [open, setOpen] = useState(false);
  const schema = z.object({
    date: z.string().nonempty({ message: "Data é obrigatória" }),
    platform: z
      .string({ required_error: "Plataforma é obrigatória" })
      .min(1, { message: "Plataforma é obrigatória" }),
    name: z.string().nonempty({ message: "Nome é obrigatório" }),
    currency: z.string().nonempty({ message: "Moeda é obrigatória" }),
    buyIn: z.string().nonempty({ message: "Buy-in é obrigatório" }),
    result: z.string().nonempty({ message: "obrigatório" }),
  });

  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: "",
      platform: "",
      name: "",
      currency: "USD",
      buyIn: "",
      result: "",
    },
  });

  const { createTournament } = useTournaments();

  const onSubmit = (data: FormData) => {
    // A data já está no formato ISO, não precisa converter
    const tournamentData = {
      ...data,
      date: data.date,
      buyIn: Number(data.buyIn),
      result: Number(data.result),
    };
    createTournament.mutate(tournamentData);
    form.reset();
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex gap-4 text-text-primary">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <div className="flex flex-col justify-between h-[80px]">
                  <div className="gap-1 flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            id="date"
                            className="w-48 justify-between font-normal"
                          >
                            {field.value
                              ? new Date(field.value).toLocaleDateString(
                                  "pt-BR"
                                )
                              : "Selecione uma data"}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              if (date) {
                                // Pega a data selecionada e adiciona a hora atual
                                const now = new Date();
                                date.setHours(now.getHours());
                                date.setMinutes(now.getMinutes());
                                date.setSeconds(now.getSeconds());
                                date.setMilliseconds(now.getMilliseconds());
                                field.onChange(date.toISOString());
                              } else {
                                field.onChange("");
                              }
                              setOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  </div>
                  <FormMessage className="text-[10px] min-h-[14px]" />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <div className="flex flex-col justify-between h-[80px]">
                  <div className="gap-1 flex flex-col">
                    <FormLabel>Plataforma</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma plataforma" />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map((platform) => (
                            <SelectItem key={platform.id} value={platform.name}>
                              {platform.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </div>
                  <FormMessage className="text-[10px] min-h-[14px]" />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <div className="flex flex-col justify-between h-[80px]">
                  <div className="gap-1 flex flex-col">
                    <FormLabel>Torneio</FormLabel>
                    <FormControl>
                      <Input
                        className="border-input-border"
                        placeholder="Daily big"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-[10px] min-h-[14px]" />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <div className="flex flex-col justify-between h-[80px]">
                  <div className="gap-1 flex flex-col">
                    <FormLabel>Moeda</FormLabel>
                    <FormControl>
                      <Input
                        className="border-input-border"
                        placeholder="USD"
                        {...field}
                        value={"USD"}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-[10px] min-h-[14px]" />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="buyIn"
              render={({ field }) => (
                <div className="flex flex-col justify-between h-[80px]">
                  <div className="gap-1 flex flex-col">
                    <FormLabel>Buy-in</FormLabel>
                    <FormControl>
                      <Input
                        className="border-input-border"
                        placeholder="3"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-[10px] min-h-[14px]" />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="result"
              render={({ field }) => (
                <div className="flex flex-col justify-between h-[80px]">
                  <div className="gap-1 flex flex-col">
                    <FormLabel>Resultado</FormLabel>
                    <FormControl>
                      <Input
                        className="border-input-border"
                        placeholder="10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-[10px] min-h-[14px]" />
                </div>
              )}
            />
            <div className="flex items-center h-[80px]">
              <Button
                type="submit"
                className="p-0 bg-success/90 hover:bg-success/80 mb-2"
              >
                Adicionar
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
