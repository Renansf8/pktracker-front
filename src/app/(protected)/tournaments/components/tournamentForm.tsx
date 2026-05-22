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
import { TournamentNameCombobox } from "./TournamentNameCombobox";

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
import { Check, ChevronDownIcon } from "lucide-react";
import { useState } from "react";

interface TournamentFormProps {
  platform: string;
}

export function TournamentForm({ platform }: TournamentFormProps) {
  const [open, setOpen] = useState(false);
  const ticketOrNumber = (msg: string) =>
    z
      .string()
      .nonempty({ message: msg })
      .refine((v) => v.toLowerCase() === "ticket" || !isNaN(Number(v)), {
        message: "Informe um valor numérico ou 'ticket'",
      });

  const schema = z.object({
    date: z.string().nonempty({ message: "Data é obrigatória" }),
    platform: z
      .string({ required_error: "Plataforma é obrigatória" })
      .min(1, { message: "Plataforma é obrigatória" }),
    name: z.string().nonempty({ message: "Nome é obrigatório" }),
    currency: z.string().nonempty({ message: "Moeda é obrigatória" }),
    buyIn: ticketOrNumber("Buy-in é obrigatório"),
    result: ticketOrNumber("obrigatório"),
    itm: z.boolean(),
    hasFt: z.boolean(),
    hasSecondDay: z.boolean(),
    position: z.string().optional(),
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
      itm: false,
      hasFt: false,
      hasSecondDay: false,
      position: "",
    },
  });

  const { createTournament } = useTournaments(platform);

  const itm = form.watch("itm");
  const selectedPlatform = form.watch("platform");

  const normalizeTicketField = (v: string): number | "ticket" =>
    v.toLowerCase() === "ticket" ? "ticket" : Number(v);

  const onSubmit = (data: FormData) => {
    const tournamentData = {
      ...data,
      date: data.date,
      buyIn: normalizeTicketField(data.buyIn),
      result: normalizeTicketField(data.result),
      itm: data.itm,
      hasFt: data.hasFt,
      hasSecondDay: data.hasSecondDay,
      position: data.itm && data.position ? Number(data.position) : null,
    };
    createTournament.mutate(tournamentData);
    form.reset();
  };

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3 text-text-primary">
            <div className="flex gap-3 items-start">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <div className="flex flex-col justify-between h-[80px] w-36">
                    <div className="gap-1 flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              id="date"
                              className="w-36 justify-between font-normal"
                            >
                              {field.value
                                ? new Date(field.value).toLocaleDateString(
                                    "pt-BR",
                                  )
                                : "DD/MM/AAAA"}
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
                  <div className="flex flex-col justify-between h-[80px] w-36">
                    <div className="gap-1 flex flex-col">
                      <FormLabel>Plataforma</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Plataforma" />
                          </SelectTrigger>
                          <SelectContent>
                            {platforms.map((platform) => (
                              <SelectItem
                                key={platform.id}
                                value={platform.name}
                              >
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
                  <div className="flex flex-col justify-between h-[80px] flex-1 min-w-[160px]">
                    <div className="gap-1 flex flex-col">
                      <FormLabel>Torneio</FormLabel>
                      <FormControl>
                        <TournamentNameCombobox
                          value={field.value}
                          onChange={field.onChange}
                          platform={selectedPlatform}
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
                  <div className="flex flex-col justify-between h-[80px] w-24">
                    <div className="gap-1 flex flex-col">
                      <FormLabel>Moeda</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
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
                name="buyIn"
                render={({ field }) => (
                  <div className="flex flex-col justify-between h-[80px] w-28">
                    <div className="gap-1 flex flex-col">
                      <FormLabel>Buy-in</FormLabel>
                      <FormControl>
                        <Input
                          className="border-input-border w-28"
                          placeholder="3.00"
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
                  <div className="flex flex-col justify-between h-[80px] w-28">
                    <div className="gap-1 flex flex-col">
                      <FormLabel>Resultado</FormLabel>
                      <FormControl>
                        <Input
                          className="border-input-border w-28"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-[10px] min-h-[14px]" />
                  </div>
                )}
              />
            </div>

            <div className="flex gap-3 items-start">
              <FormField
                control={form.control}
                name="itm"
                render={({ field }) => (
                  <div className="flex flex-col justify-between h-[80px]">
                    <div className="gap-1 flex flex-col">
                      <FormLabel>ITM</FormLabel>
                      <FormControl>
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange(!field.value);
                            if (field.value) form.setValue("position", "");
                          }}
                          className={`h-9 w-20 rounded-md border text-sm font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                            field.value
                              ? "border-success bg-success/20 text-success"
                              : "border-input bg-transparent text-muted-foreground"
                          }`}
                        >
                          {field.value && <Check className="size-3" />}
                          {field.value ? "Sim" : "Não"}
                        </button>
                      </FormControl>
                    </div>
                    <FormMessage className="text-[10px] min-h-[14px]" />
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="hasFt"
                render={({ field }) => (
                  <div className="flex flex-col justify-between h-[80px]">
                    <div className="gap-1 flex flex-col">
                      <FormLabel>FT</FormLabel>
                      <FormControl>
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          className={`h-9 w-20 rounded-md border text-sm font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                            field.value
                              ? "border-success bg-success/20 text-success"
                              : "border-input bg-transparent text-muted-foreground"
                          }`}
                        >
                          {field.value && <Check className="size-3" />}
                          {field.value ? "Sim" : "Não"}
                        </button>
                      </FormControl>
                    </div>
                    <FormMessage className="text-[10px] min-h-[14px]" />
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="hasSecondDay"
                render={({ field }) => (
                  <div className="flex flex-col justify-between h-[80px]">
                    <div className="gap-1 flex flex-col">
                      <FormLabel>Dia 2</FormLabel>
                      <FormControl>
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          className={`h-9 w-20 rounded-md border text-sm font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                            field.value
                              ? "border-success bg-success/20 text-success"
                              : "border-input bg-transparent text-muted-foreground"
                          }`}
                        >
                          {field.value && <Check className="size-3" />}
                          {field.value ? "Sim" : "Não"}
                        </button>
                      </FormControl>
                    </div>
                    <FormMessage className="text-[10px] min-h-[14px]" />
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <div className="flex flex-col justify-between h-[80px] w-28">
                    <div className="gap-1 flex flex-col">
                      <FormLabel>Posição</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          className="border-input-border w-28"
                          placeholder="1"
                          disabled={!itm}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-[10px] min-h-[14px]" />
                  </div>
                )}
              />
              <div className="flex-1" />
              <div className="flex items-center h-[80px]">
                <Button
                  type="submit"
                  className="p-0 bg-success/90 hover:bg-success/80 mb-2 w-[104px]"
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
