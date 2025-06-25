import { Router } from "./router/routes";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
      <Router />
      <Toaster richColors closeButton />
    </>
  );
}

export default App;
