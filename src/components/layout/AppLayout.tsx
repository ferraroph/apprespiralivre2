import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MobileNav } from "./MobileNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { InstallPrompt } from "../InstallPrompt";
import { Loader2 } from "lucide-react";
import { isDevMode } from "@/lib/devModeData";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Dev mode: skip all auth checks
    if (isDevMode()) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // Production: real auth flow
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (!profile) {
          navigate("/onboarding");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("[LAYOUT] Auth error:", error);
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate("/auth");
        } else if (event === 'TOKEN_REFRESHED') {
          setIsAuthenticated(!!session);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full relative">
      <DesktopSidebar />
      <main className="pb-20 md:pb-0 md:pl-64 min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </div>
      </main>
      <MobileNav />
      <InstallPrompt 
        autoShow={true}
        delay={5000}
      />
    </div>
  );
}
