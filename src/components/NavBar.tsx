import { useAuth } from "@/contexts/AuthContext";
import { useGetUser } from "@/services/hooks/useGetUser";
import { Link, useNavigate } from "react-router";

export const NavBar = () => {
  const { data: user } = useGetUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="flex justify-between items-center p-4 text-text-primary">
      <div>
        <p className="text-2xl font-bold">PKTracker</p>
      </div>
      <div className="flex gap-8">
        <Link to="/">Dashboard</Link>
        <Link to="/tournaments">Torneios</Link>
        <Link to="/stats">Estatísticas</Link>
        <Link to="/profile">{user?.name}</Link>

        <Link className="p-0" to="/signin" onClick={handleLogout}>
          Sair
        </Link>
      </div>
    </div>
  );
};
