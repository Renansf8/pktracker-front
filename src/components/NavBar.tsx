import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router";

export const NavBar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  const handleLogout = () => {
    navigate("/signin");
    logout();
  };

  return (
    <div className="flex justify-between w-[90%] mx-auto items-center py-4 text-text-primary">
      <div>
        <p className="text-2xl font-bold">PKTracker</p>
      </div>
      <div className="flex gap-8">
        <Link
          to="/"
          className={`pb-1 ${
            isActive("/") ? "border-b-2 border-purple-500" : ""
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/tournaments"
          className={`pb-1 ${
            isActive("/tournaments") ? "border-b-2 border-purple-500" : ""
          }`}
        >
          Torneios
        </Link>
        <Link
          to="/stats"
          className={`pb-1 ${
            isActive("/stats") ? "border-b-2 border-purple-500" : ""
          }`}
        >
          Estatísticas
        </Link>
        <Link
          to="/profile"
          className={`pb-1 ${
            isActive("/profile") ? "border-b-2 border-purple-500" : ""
          }`}
        >
          Perfil
        </Link>
        <Link to="/signin" onClick={handleLogout} className="p-0">
          Sair
        </Link>
      </div>
    </div>
  );
};
