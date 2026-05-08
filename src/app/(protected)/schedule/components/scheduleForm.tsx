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
import { useScheduleItems } from "@/services/hooks/useScheduleItems";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { platforms } from "@/utils/platforms";

const schema = z.object({
  time: z.string().nonempty({ message: "Horário é obrigatório" }),
  platform: z
    .string({ required_error: "Plataforma é obrigatória" })
    .min(1, { message: "Plataforma é obrigatória" }),
  name: z.string().nonempty({ message: "Nome é obrigatório" }),
  currency: z.string().nonempty({ message: "Moeda é obrigatória" }),
  buyIn: z.string().nonempty({ message: "Buy-in é obrigatório" }),
});

type FormData = z.infer<typeof schema>;

export function ScheduleForm({ scheduleId }: { scheduleId: string }) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      time: "",
      platform: "",
      name: "",
      currency: "USD",
      buyIn: "",
    },
  });

  const { createItem } = useScheduleItems(scheduleId);

  const onSubmit = (data: FormData) => {
    createItem.mutate({
      time: data.time,
      platform: data.platform,
      name: data.name,
      currency: data.currency,
      buyIn: Number(data.buyIn),
    });
    form.reset();
  };

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-wrap gap-4 text-text-primary">
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <div className="flex flex-col justify-between h-[80px]">
                  <div className="gap-1 flex flex-col">
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input type="time" className="w-40" {...field} />
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
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Selecione uma plataforma" />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map((p) => (
                            <SelectItem key={p.id} value={p.name}>
                              {p.name}
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
                <div className="flex flex-col justify-between h-[80px] grow">
                  <div className="gap-1 flex flex-col">
                    <FormLabel>Torneio</FormLabel>
                    <FormControl>
                      <Input placeholder="Daily big" {...field} />
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
                      <Input className="w-24" {...field} />
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
                        type="number"
                        step="0.01"
                        className="w-32"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-[10px] min-h-[14px]" />
                </div>
              )}
            />

            <div className="flex items-start pt-5 h-20">
              <Button type="submit" disabled={createItem.isPending}>
                {createItem.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
