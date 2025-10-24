import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MobileNav } from "./MobileNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { Loader2 } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we're processing OAuth callback (hash fragment present)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isOAuthCallback = hashParams.has('access_token') || hashParams.has('error');
        
        if (isOAuthCallback) {
          // Let Supabase process the OAuth callback first
          setIsLoading(true);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for Supabase to process
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        // Check if user has completed onboarding
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
        console.error("Auth check error:", error);
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) {
          navigate("/auth");
        } else if (event === 'SIGNED_IN') {
          // User just signed in, check profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          if (profile) {
            setIsAuthenticated(true);
          } else {
            navigate("/onboarding");
          }
        }
      }
    );

    return () => subscription.unsubscribe();
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
    <div className="min-h-screen w-full">
      <DesktopSidebar />
      <main className="pb-20 md:pb-0 md:pl-64 min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
