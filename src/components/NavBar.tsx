"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { signOutAction } from "@/lib/auth/actions";
import type { User } from "@/services/api/types";

type NavBarProps = {
  user: User | null;
};

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/tournaments", label: "Torneios" },
  { href: "/schedule", label: "Grade" },
  { href: "/bank", label: "Banca" },
  { href: "/stats", label: "Estatísticas" },
  { href: "/profile", label: "Perfil" },
] as const;

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-7 h-7" aria-hidden />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Modo claro" : "Modo escuro"}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className="flex items-center justify-center w-7 h-7 transition-colors duration-200"
      style={{
        border: "1px solid var(--pk-panel-top)",
        borderRadius: "2px",
      }}
    >
      {isDark ? (
        <Sun size={12} style={{ color: "var(--primary)" }} strokeWidth={2} />
      ) : (
        <Moon size={12} style={{ color: "var(--primary)" }} strokeWidth={2} />
      )}
    </button>
  );
}

export function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  const linkBase =
    "text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-200 pb-0.5";
  const activeCls = "text-gold border-b border-gold";
  const inactiveCls = "text-text-secondary hover:text-text-primary";

  return (
    <nav
      className="w-full"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between w-[90%] mx-auto py-5">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span
            className="flex items-center justify-center w-7 h-7 text-[10px] font-bold font-display text-gold"
            style={{
              border: "1px solid var(--pk-panel-top)",
              borderRadius: "2px",
              letterSpacing: "0.05em",
            }}
          >
            PK
          </span>
          <span className="font-display text-base font-bold tracking-[0.12em] uppercase text-text-primary">
            Tracker
          </span>
          {user && (
            <span
              className="ml-3 text-[11px] tracking-[0.1em] uppercase"
              style={{ color: "var(--muted-foreground)" }}
            >
              — {user.name}
            </span>
          )}
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-7">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${linkBase} ${isActive(item.href) ? activeCls : inactiveCls}`}
            >
              {item.label}
            </Link>
          ))}

          <ThemeToggle />

          <form action={signOutAction}>
            <button
              type="submit"
              className="text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-200 ml-2 cursor-pointer bg-transparent border-0"
              style={{
                color: "var(--muted-foreground)",
                borderLeft: "1px solid var(--border)",
                paddingLeft: "16px",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--destructive)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "var(--muted-foreground)")
              }
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
