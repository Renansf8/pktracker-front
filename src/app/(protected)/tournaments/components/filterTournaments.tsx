"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ButtonFilter } from "./buttonFilter";
import { tournamentSpeeds, tournamentTypes } from "@/utils/tournamentOptions";
import type { TournamentSpeed, TournamentType } from "@/services/hooks/types";

interface FilterTournamentsProps {
  setPlatform: (platform: string) => void;
  filter?: () => void;
  clearFilter?: () => void;
  selectedPlatform?: string;
  nameInput?: string;
  onNameChange?: (name: string) => void;
  type?: TournamentType | "";
  onTypeChange?: (type: TournamentType | "") => void;
  speed?: TournamentSpeed | "";
  onSpeedChange?: (speed: TournamentSpeed | "") => void;
  minBuyInInput?: string;
  onMinBuyInChange?: (value: string) => void;
  maxBuyInInput?: string;
  onMaxBuyInChange?: (value: string) => void;
  onApplyBuyInFilter?: () => void;
}

export function FilterTournaments({
  setPlatform,
  clearFilter,
  selectedPlatform = "",
  nameInput = "",
  onNameChange,
  type = "",
  onTypeChange,
  speed = "",
  onSpeedChange,
  minBuyInInput = "",
  onMinBuyInChange,
  maxBuyInInput = "",
  onMaxBuyInChange,
  onApplyBuyInFilter,
}: FilterTournamentsProps) {
  return (
    <div className="text-text-primary flex flex-col gap-3 pl-4">
      <div className="flex items-center gap-3">
        <p className="shrink-0">Nome:</p>
        <Input
          value={nameInput}
          onChange={(e) => onNameChange?.(e.target.value)}
          placeholder="Buscar por nome..."
          className="h-[32px] max-w-[240px] text-[13px]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="shrink-0">Tipo:</p>
        <Select
          value={type || "all"}
          onValueChange={(value) =>
            onTypeChange?.(value === "all" ? "" : (value as TournamentType))
          }
        >
          <SelectTrigger className="h-[32px] w-[140px] text-[13px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {tournamentTypes.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="shrink-0">Velocidade:</p>
        <Select
          value={speed || "all"}
          onValueChange={(value) =>
            onSpeedChange?.(value === "all" ? "" : (value as TournamentSpeed))
          }
        >
          <SelectTrigger className="h-[32px] w-[140px] text-[13px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {tournamentSpeeds.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-3">
        <p className="shrink-0">Buy-in:</p>
        <Input
          type="number"
          value={minBuyInInput}
          onChange={(e) => onMinBuyInChange?.(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onApplyBuyInFilter?.()}
          placeholder="Mín."
          className="h-[32px] max-w-[100px] text-[13px]"
        />
        <span>-</span>
        <Input
          type="number"
          value={maxBuyInInput}
          onChange={(e) => onMaxBuyInChange?.(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onApplyBuyInFilter?.()}
          placeholder="Máx."
          className="h-[32px] max-w-[100px] text-[13px]"
        />
        <Button
          className="text-[12px] p-2 h-[32px]"
          variant="outline"
          onClick={onApplyBuyInFilter}
        >
          Aplicar
        </Button>
      </div>
      <div className="flex gap-3">
        <p>Plataforma:</p>
        <ButtonFilter
          platform="Poker Stars"
          setPlatform={setPlatform}
          isSelected={selectedPlatform === "Poker Stars"}
        />
        <ButtonFilter
          platform="GG"
          setPlatform={setPlatform}
          isSelected={selectedPlatform === "GG"}
        />
        <ButtonFilter
          platform="Party Poker"
          setPlatform={setPlatform}
          isSelected={selectedPlatform === "Party Poker"}
        />
        <ButtonFilter
          platform="888"
          setPlatform={setPlatform}
          isSelected={selectedPlatform === "888"}
        />
        <ButtonFilter
          platform="Champions"
          setPlatform={setPlatform}
          isSelected={selectedPlatform === "Champions"}
        />
        <ButtonFilter
          platform="WPT"
          setPlatform={setPlatform}
          isSelected={selectedPlatform === "WPT"}
        />
        <ButtonFilter
          platform="YA"
          setPlatform={setPlatform}
          isSelected={selectedPlatform === "YA"}
        />
        <ButtonFilter
          platform="WPN"
          setPlatform={setPlatform}
          isSelected={selectedPlatform === "WPN"}
        />
        <ButtonFilter
          platform="ACR"
          setPlatform={setPlatform}
          isSelected={selectedPlatform === "ACR"}
        />
      </div>
      <Button
        className="text-[12px] p-2 h-[32px] max-w-[80px]"
        variant="outline"
        onClick={clearFilter}
      >
        Limpar
      </Button>
    </div>
  );
}
