import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUser } from "@/services/hooks/useGetUser";
import { useNavigate } from "react-router";

export const Home = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const { data: user, isLoading } = useGetUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="mx-auto max-w-md w-full bg-background text-text-primary border-input-border">
        <CardHeader>
          <CardTitle>Bem-vindo!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-secondary">Email:</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Nome:</p>
              <p className="font-medium">{user?.name}</p>
            </div>
            <Button
              onClick={handleLogout}
              className="w-full bg-black"
              variant="default"
            >
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
