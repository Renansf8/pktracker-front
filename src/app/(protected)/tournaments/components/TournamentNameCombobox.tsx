"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { tournamentNamesByPlatform } from "@/utils/tournamentNames";

interface TournamentNameComboboxProps {
  value: string;
  onChange: (value: string) => void;
  platform: string;
}

export function TournamentNameCombobox({
  value,
  onChange,
  platform,
}: TournamentNameComboboxProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options = tournamentNamesByPlatform[platform] ?? [];
  const filtered = options.filter((name) =>
    name.toLowerCase().includes(value.toLowerCase()),
  );
  const showDropdown = open && filtered.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        className="border-input-border"
        placeholder="Daily big"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {showDropdown && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-border bg-popover shadow-md">
          {filtered.map((name) => (
            <li
              key={name}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(name);
                setOpen(false);
              }}
              className={`cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                value === name ? "bg-accent/50 font-medium" : ""
              }`}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
