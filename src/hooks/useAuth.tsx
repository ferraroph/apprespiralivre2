import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isDevMode, DEV_USER, DEV_SESSION } from "@/lib/devModeData";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dev mode: skip real auth
    if (isDevMode()) {
      setUser(DEV_USER);
      setSession(DEV_SESSION);
      setLoading(false);
      return;
    }

    // Production: real auth flow
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (isDevMode()) return;
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("[AUTH] Erro no logout:", error);
    }
  };

  return { user, session, loading, signOut };
}
