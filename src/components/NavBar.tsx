import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router";

export const NavBar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    navigate("/signin");
    logout();
  };

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
          {/* Chip mark */}
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
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-7">
          <Link
            to="/"
            className={`${linkBase} ${isActive("/") ? activeCls : inactiveCls}`}
          >
            Dashboard
          </Link>
          <Link
            to="/tournaments"
            className={`${linkBase} ${isActive("/tournaments") ? activeCls : inactiveCls}`}
          >
            Torneios
          </Link>
          <Link
            to="/schedule"
            className={`${linkBase} ${isActive("/schedule") ? activeCls : inactiveCls}`}
          >
            Grade
          </Link>
          <Link
            to="/bank"
            className={`${linkBase} ${isActive("/bank") ? activeCls : inactiveCls}`}
          >
            Banca
          </Link>
          <Link
            to="/stats"
            className={`${linkBase} ${isActive("/stats") ? activeCls : inactiveCls}`}
          >
            Estatísticas
          </Link>
          <Link
            to="/profile"
            className={`${linkBase} ${isActive("/profile") ? activeCls : inactiveCls}`}
          >
            Perfil
          </Link>

          {/* Logout — visually distinct */}
          <Link
            to="/signin"
            onClick={handleLogout}
            className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary hover:text-error-val transition-colors duration-200 ml-2"
            style={{ borderLeft: "1px solid rgba(212,168,67,0.15)", paddingLeft: "16px" }}
          >
            Sair
          </Link>
        </div>
      </div>
    </nav>
  );
};
