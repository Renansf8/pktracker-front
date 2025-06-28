import { Router } from "./router/routes";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster richColors closeButton />
    </AuthProvider>
  );
}

export default App;
