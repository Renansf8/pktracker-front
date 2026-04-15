import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { NavBar } from "@/components/NavBar";

// Lazy loading: cada página só é carregada quando o usuário navega até ela,
// reduzindo o bundle inicial e acelerando o primeiro carregamento.
const SignIn = lazy(() => import("../pages/signin").then((m) => ({ default: m.SignIn })));
const SignUp = lazy(() => import("../pages/signup").then((m) => ({ default: m.SignUp })));
const Home = lazy(() => import("@/pages/home").then((m) => ({ default: m.Home })));
const Tournaments = lazy(() => import("@/pages/tournaments").then((m) => ({ default: m.Tournaments })));
const Bank = lazy(() => import("@/pages/bank").then((m) => ({ default: m.Bank })));
const Stats = lazy(() => import("@/pages/stats").then((m) => ({ default: m.Stats })));
const Profile = lazy(() => import("@/pages/profile").then((m) => ({ default: m.Profile })));
const Schedule = lazy(() => import("@/pages/schedule").then((m) => ({ default: m.Schedule })));

const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
  </div>
);

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const Router = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tournaments"
            element={
              <ProtectedRoute>
                <Tournaments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank"
            element={
              <ProtectedRoute>
                <Bank />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <Stats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
