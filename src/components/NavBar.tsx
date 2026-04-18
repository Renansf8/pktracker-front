/**
 * src/components/NavBar.tsx
 * ---------------------------------------------------------------------------
 * Barra de navegação superior. Recebe `user` por prop (buscado no servidor
 * pelo (protected)/layout.tsx) e trata logout via Server Action.
 *
 * Mudanças em relação à versão do react-router:
 *   - `import { Link } from "react-router"`  →  `import Link from "next/link"`
 *     (Link do Next usa prop `href` em vez de `to`)
 *   - `useLocation()`   →  `usePathname()` (vem de `next/navigation`)
 *   - `useNavigate()`   →  removido; redirects são feitos no servidor
 *     pelo `signOutAction`.
 *   - `useAuth()`       →  removido; `user` chega via prop.
 *
 * Este componente é "use client" porque usa `usePathname` (hook). A Server
 * Action `signOutAction` é importada do módulo marcado "use server" e pode
 * ser chamada daqui sem problemas — o Next cuida da transição.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

export function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  const linkBase =
    "text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary transition-colors duration-200 pb-0.5";
  const activeCls = "text-gold border-b border-gold";
  const inactiveCls = "hover:text-text-primary";

  return (
    <nav
      className="w-full"
      style={{ borderBottom: "1px solid rgba(212,168,67,0.12)" }}
    >
      <div className="flex items-center justify-between w-[90%] mx-auto py-5">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span
            className="flex items-center justify-center w-7 h-7 text-[10px] font-bold font-display text-gold"
            style={{
              border: "1px solid rgba(212,168,67,0.55)",
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
            <span className="ml-3 text-[11px] text-text-secondary tracking-[0.1em] uppercase">
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

          {/* Logout — um <form> pequeno com action={signOutAction}.
              Isso faz o Next submeter direto pro servidor sem precisar de
              useEffect, useMutation ou qualquer estado de client. */}
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary hover:text-error-val transition-colors duration-200 ml-2 cursor-pointer bg-transparent border-0"
              style={{
                borderLeft: "1px solid rgba(212,168,67,0.15)",
                paddingLeft: "16px",
              }}
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
