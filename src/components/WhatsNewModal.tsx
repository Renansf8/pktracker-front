"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChangelogEntry } from "@/utils/changelog";

const TYPE_CONFIG: Record<
  ChangelogEntry["type"],
  { label: string; color: string }
> = {
  feature: { label: "FEAT", color: "var(--primary)" },
  fix: { label: "FIX", color: "var(--pk-success)" },
  improvement: { label: "UPD", color: "#5b8dd9" },
};

function versionToLabel(version: string): string {
  const parts = version.split("-");
  if (parts.length >= 3) {
    const d = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
    if (!Number.isNaN(d.getTime())) {
      return d
        .toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
        .toUpperCase()
        .replace(".", "");
    }
  }
  return version;
}

interface WhatsNewModalProps {
  open: boolean;
  onClose: () => void;
  changelog: ChangelogEntry[];
  version: string;
}

export function WhatsNewModal({
  open,
  onClose,
  changelog,
  version,
}: WhatsNewModalProps) {
  const dateLabel = versionToLabel(version);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/75 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />

        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-md overflow-hidden",
            "glass-panel",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2",
            "data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]",
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-4 -top-4 select-none text-[110px] leading-none"
            style={{
              color: "var(--primary)",
              opacity: 0.04,
              fontFamily: "serif",
            }}
          >
            ◆
          </div>

          <div
            className="relative px-6 pt-6 pb-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <p
              className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em]"
              style={{ color: "var(--muted-foreground)" }}
            >
              O que há de novo
            </p>
            <DialogPrimitive.Title
              className="font-display text-2xl font-bold leading-none"
              style={{ color: "var(--foreground)", letterSpacing: "0.02em" }}
            >
              Atualizações
            </DialogPrimitive.Title>
            <span
              className="absolute right-10 top-6 font-data text-[11px]"
              style={{ color: "var(--muted-foreground)" }}
            >
              {dateLabel}
            </span>

            <DialogPrimitive.Close
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm opacity-50 transition-opacity hover:opacity-100 focus:outline-none"
              style={{ color: "var(--muted-foreground)" }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </DialogPrimitive.Close>
          </div>

          {/* Changelog items */}
          <div className="flex flex-col px-6 py-2">
            {changelog.map((entry, i) => {
              const config = TYPE_CONFIG[entry.type];
              return (
                <div
                  key={i}
                  className="flex gap-4 py-4"
                  style={{
                    borderBottom:
                      i < changelog.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                    animation: "stat-reveal 0.4s ease both",
                    animationDelay: `${i * 90 + 60}ms`,
                  }}
                >
                  {/* Type badge */}
                  <div className="flex-shrink-0 pt-0.5">
                    <span
                      className="font-data rounded-sm px-1.5 py-0.5 text-[9px] font-semibold tracking-widest"
                      style={{
                        color: config.color,
                        background: `color-mix(in srgb, ${config.color} 12%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${config.color} 28%, transparent)`,
                      }}
                    >
                      {config.label}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p
                      className="font-display text-sm font-semibold leading-snug"
                      style={{ color: "var(--foreground)" }}
                    >
                      {entry.title}
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {entry.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 pb-6 pt-2">
            <button
              onClick={onClose}
              className="btn-gold w-full py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
            >
              Entendido
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
