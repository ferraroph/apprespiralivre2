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
        console.log("[AppLayout] Already checking, skipping");
        return;
      }
      
      setIsChecking(true);
      
      // Safety timeout - if loading takes more than 10 seconds, redirect to auth
      timeoutId = setTimeout(() => {
        console.error("[AppLayout] Auth check timeout - redirecting to /auth");
        setIsLoading(false);
        setIsChecking(false);
        navigate("/auth");
      }, 10000);
      
      try {
        console.log("[AppLayout] Starting auth check");
        
        // Check if we're processing OAuth callback (hash fragment present)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isOAuthCallback = hashParams.has('access_token') || hashParams.has('error');
        
        console.log("[AppLayout] Is OAuth callback?", isOAuthCallback);
        
        if (isOAuthCallback) {
          console.log("[AppLayout] Processing OAuth callback, waiting for Supabase");
          // Let Supabase process the OAuth callback first
          setIsLoading(true);
          // Clear the hash to prevent reprocessing
          window.history.replaceState(null, '', window.location.pathname);
          // Wait for Supabase to process
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        console.log("[AppLayout] Getting session");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[AppLayout] Session error:", sessionError);
          throw sessionError;
        }
        
        console.log("[AppLayout] Session:", session ? "exists" : "null");
        
        if (!session) {
          console.log("[AppLayout] No session, redirecting to /auth");
          navigate("/auth");
          return;
        }

        console.log("[AppLayout] Checking profile for user:", session.user.id);
        
        // Check if user has completed onboarding
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        console.log("[AppLayout] Profile:", profile ? "exists" : "null", "Error:", profileError);

        if (!profile) {
          console.log("[AppLayout] No profile, redirecting to /onboarding");
          navigate("/onboarding");
          return;
        }

        console.log("[AppLayout] Auth successful, setting authenticated");
        setIsAuthenticated(true);
      } catch (error) {
        console.error("[AppLayout] Auth check error:", error);
        navigate("/auth");
      } finally {
        clearTimeout(timeoutId);
        console.log("[AppLayout] Auth check complete, setting loading to false");
        setIsLoading(false);
        setIsChecking(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[AppLayout] Auth state changed:", event, session ? "has session" : "no session");
        
        // Ignore token refresh events
        if (event === 'TOKEN_REFRESHED') {
          console.log("[AppLayout] Token refreshed, ignoring");
          return;
        }
        
        if (!session && event !== 'SIGNED_OUT') {
          console.log("[AppLayout] No session in auth change, redirecting to /auth");
          navigate("/auth");
        } else if (event === 'SIGNED_IN') {
          console.log("[AppLayout] SIGNED_IN event, triggering new auth check");
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
