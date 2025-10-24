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
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkAuth = async () => {
      // Prevent multiple simultaneous checks
      if (isChecking) {
        return;
      }
      
      setIsChecking(true);
      
      // Safety timeout - if loading takes more than 10 seconds, redirect to auth
      timeoutId = setTimeout(() => {
        setIsLoading(false);
        setIsChecking(false);
        navigate("/auth");
      }, 10000);
      
      try {
        // Check if we're processing OAuth callback (hash fragment present)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isOAuthCallback = hashParams.has('access_token') || hashParams.has('error');
        
        if (isOAuthCallback) {
          // Let Supabase process the OAuth callback first
          setIsLoading(true);
          // Clear the hash to prevent reprocessing
          window.history.replaceState(null, '', window.location.pathname);
          // Wait for Supabase to process
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          navigate("/auth");
          return;
        }
        
        // Check if user has completed onboarding
        const { data: profile, error: profileError } = await supabase
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
        navigate("/auth");
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
        setIsChecking(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Ignore token refresh events
        if (event === 'TOKEN_REFRESHED') {
          return;
        }
        
        if (!session && event !== 'SIGNED_OUT') {
          navigate("/auth");
        } else if (event === 'SIGNED_IN') {
          // User just signed in, re-check auth
          // Small delay to ensure profile data is available
          setTimeout(() => checkAuth(), 500);
        }
      }
    );

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [navigate, isChecking]);

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
