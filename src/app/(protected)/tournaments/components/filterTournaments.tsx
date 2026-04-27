"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ButtonFilter } from "./buttonFilter";

interface FilterTournamentsProps {
  setPlatform: (platform: string) => void;
  filter?: () => void;
  clearFilter?: () => void;
  selectedPlatform?: string;
  nameInput?: string;
  onNameChange?: (name: string) => void;
}

export function FilterTournaments({
  setPlatform,
  clearFilter,
  selectedPlatform = "",
  nameInput = "",
  onNameChange,
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
        variant="secondary"
        onClick={clearFilter}
      >
        Limpar
      </Button>
    </div>
  );
}
