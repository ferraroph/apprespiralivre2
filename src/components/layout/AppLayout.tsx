import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MobileNav } from "./MobileNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { InstallPrompt } from "../InstallPrompt";
import { Loader2 } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  console.log('[LAYOUT] AppLayout inicializado');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  console.log('[LAYOUT] Estados iniciais:', { isLoading, isAuthenticated });

  useEffect(() => {
    console.log('[LAYOUT] Effect de verificação de autenticação iniciado');
    
    const checkAuth = async () => {
      console.log('[LAYOUT] Verificando autenticação');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[LAYOUT] Sessão obtida:', { hasSession: !!session, userId: session?.user?.id });
        
        if (!session) {
          console.log('[LAYOUT] Sem sessão - redirecionando para /auth');
          navigate("/auth");
          return;
        }
        
        console.log('[LAYOUT] Verificando perfil do usuário');
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        console.log('[LAYOUT] Perfil obtido:', { hasProfile: !!profile });

        if (!profile) {
          console.log('[LAYOUT] Sem perfil - redirecionando para /onboarding');
          navigate("/onboarding");
          return;
        }

        console.log('[LAYOUT] Usuário autenticado e com perfil - definindo como autenticado');
        setIsAuthenticated(true);
      } catch (error) {
        console.error("[LAYOUT] Erro na verificação de autenticação:", error);
        navigate("/auth");
      } finally {
        console.log('[LAYOUT] Finalizando verificação de autenticação');
        setIsLoading(false);
      }
    };

    checkAuth();

    console.log('[LAYOUT] Configurando listener de mudanças de autenticação');
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[LAYOUT] Mudança de autenticação:', { event, hasSession: !!session });
        
        if (event === 'SIGNED_OUT') {
          console.log('[LAYOUT] Usuário deslogado - redirecionando para /auth');
          navigate("/auth");
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[LAYOUT] Token refreshed - atualizando estado de autenticação');
          // Just update the session, don't navigate
          setIsAuthenticated(!!session);
        }
      }
    );

    return () => {
      console.log('[LAYOUT] Removendo listener de autenticação');
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    console.log('[LAYOUT] Renderizando tela de loading');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[LAYOUT] Usuário não autenticado - não renderizando conteúdo');
    return null;
  }

  console.log('[LAYOUT] Renderizando interface autenticada completa');
  
  return (
    <div className="min-h-screen w-full relative">
      <DesktopSidebar />
      <main className="pb-20 md:pb-0 md:pl-64 min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </div>
      </main>
      <MobileNav />
      
      {/* PWA Install Prompt - positioned with high z-index */}
      <InstallPrompt 
        autoShow={true}
        delay={5000} // Show after 5 seconds for better UX
        onInstallSuccess={() => {
          console.log('[LAYOUT] PWA instalado com sucesso');
        }}
        onDismiss={() => {
          console.log('[LAYOUT] Prompt de instalação PWA dispensado');
        }}
      />
    </div>
  );
}
