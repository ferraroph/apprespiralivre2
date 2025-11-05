import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Leagues from "./pages/Leagues";
import Content from "./pages/Content";
import CommunityReal from "./pages/CommunityReal";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Squads from "./pages/Squads";
import SquadDetailPage from "./pages/SquadDetailPage";
import Admin from "./pages/Admin";
import AICoach from "./pages/AICoach";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

console.log('[APP] Inicializando aplicação');

const queryClient = new QueryClient();
console.log('[APP] QueryClient criado');

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);
console.log('[APP] Sentry Routes configurado');

// Error fallback component
const ErrorFallback = () => {
  console.error('[APP] ErrorFallback renderizado - erro capturado pelo Sentry');
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Algo deu errado</h1>
        <p className="text-muted-foreground mb-4">
          Desculpe, ocorreu um erro inesperado. Nossa equipe foi notificada.
        </p>
        <button
          onClick={() => {
            console.log('[APP] Usuário clicou em recarregar página');
            window.location.reload();
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Recarregar página
        </button>
      </div>
    </div>
  );
};

const App = () => {
  console.log('[APP] Componente App renderizado');
  
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />} showDialog>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SentryRoutes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/leagues" element={<AppLayout><Leagues /></AppLayout>} />
              <Route path="/content" element={<AppLayout><Content /></AppLayout>} />
              <Route path="/community" element={<AppLayout><CommunityReal /></AppLayout>} />
              <Route path="/squads" element={<AppLayout><Squads /></AppLayout>} />
              <Route path="/squads/:id" element={<AppLayout><SquadDetailPage /></AppLayout>} />
              <Route path="/ai-coach" element={<AppLayout><AICoach /></AppLayout>} />
              <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
              <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
              <Route path="/admin" element={<AppLayout><Admin /></AppLayout>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </SentryRoutes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
};

export default App;
