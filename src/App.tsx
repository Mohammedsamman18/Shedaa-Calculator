import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Players from "./pages/Players";
import NewMatch from "./pages/NewMatch";
import Scoreboard from "./pages/Scoreboard";
import MatchHistory from "./pages/MatchHistory";
import Stats from "./pages/Stats";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-table-green">
        <div className="text-center">
          <div className="text-5xl mb-3">♠️</div>
          <p className="text-table-green-foreground/70">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/players" element={<Players />} />
      <Route path="/new-match" element={<NewMatch />} />
      <Route path="/scoreboard" element={<Scoreboard />} />
      <Route path="/history" element={<MatchHistory />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
