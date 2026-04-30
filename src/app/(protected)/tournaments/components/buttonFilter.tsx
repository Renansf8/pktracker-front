/**
 * buttonFilter.tsx
 * ---------------------------------------------------------------------------
 * Botão de filtro de plataforma. Renomeado de `buttonFIlter.tsx` (com typo
 * maiúsculo na fonte) para `buttonFilter.tsx` na migração — o filesystem
 * case-sensitive dos servidores do Vercel não perdoa o typo.
 */
"use client";

import { Button } from "@/components/ui/button";

interface ButtonFilterProps {
  platform: string;
  setPlatform: (platform: string) => void;
  isSelected?: boolean;
}

export function ButtonFilter({
  setPlatform,
  platform,
  isSelected = false,
}: ButtonFilterProps) {
  return (
    <Button
      className={`min-w-[80px] text-[12px] p-2 h-[32px] bg-background border ${
        isSelected
          ? "text-gold border-primary"
          : "text-foreground border-border hover:border-primary/50"
      }`}
      variant="outline"
      onClick={() => setPlatform(platform)}
    >
      {platform}
    </Button>
  );
}
