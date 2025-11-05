import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  console.log('[AUTH] Hook inicializado');
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('[AUTH] Estados iniciais:', { user, session, loading });

  useEffect(() => {
    console.log('[AUTH] Configurando listener de estado de autenticação');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AUTH] Mudança de estado:', { event, session: !!session, userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        console.log('[AUTH] Estados atualizados após mudança:', { 
          user: session?.user?.email, 
          hasSession: !!session, 
          loading: false 
        });
      }
    );

    // Check for existing session
    console.log('[AUTH] Verificando sessão existente');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH] Sessão existente encontrada:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        email: session?.user?.email 
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('[AUTH] Removendo subscription do listener');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('[AUTH] Iniciando logout');
    try {
      await supabase.auth.signOut();
      console.log('[AUTH] Logout realizado com sucesso');
    } catch (error) {
      console.error('[AUTH] Erro no logout:', error);
    }
  };

  console.log('[AUTH] Retornando dados:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    loading,
    userEmail: user?.email 
  });

  return { user, session, loading, signOut };
}
