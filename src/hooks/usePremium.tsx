import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface PremiumStatus {
  isPremium: boolean;
  premiumUntil: string | null;
  streakFreezeCount: number;
  adsRemoved: boolean;
  loading: boolean;
}

export function usePremium(): PremiumStatus {
  console.log('[PREMIUM] Hook inicializado');
  
  const { user } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    premiumUntil: null,
    streakFreezeCount: 0,
    adsRemoved: false,
    loading: true,
  });

  console.log('[PREMIUM] Estados iniciais:', { 
    hasUser: !!user, 
    userId: user?.id,
    premiumStatus 
  });

  useEffect(() => {
    console.log('[PREMIUM] Effect executado:', { hasUser: !!user, userId: user?.id });
    
    if (!user) {
      console.log('[PREMIUM] Usuário não autenticado, resetando status premium');
      setPremiumStatus({
        isPremium: false,
        premiumUntil: null,
        streakFreezeCount: 0,
        adsRemoved: false,
        loading: false,
      });
      return;
    }

    const fetchPremiumStatus = async () => {
      console.log('[PREMIUM] Buscando status premium do usuário:', user.id);
      
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("premium_until, streak_freeze_count, ads_removed")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        console.log('[PREMIUM] Dados do perfil obtidos:', profile);

        // Check if premium is active
        const isPremium = profile?.premium_until
          ? new Date(profile.premium_until) > new Date()
          : false;

        console.log('[PREMIUM] Status premium calculado:', { 
          isPremium, 
          premiumUntil: profile?.premium_until,
          now: new Date().toISOString()
        });

        const newStatus = {
          isPremium,
          premiumUntil: profile?.premium_until || null,
          streakFreezeCount: profile?.streak_freeze_count || 0,
          adsRemoved: profile?.ads_removed || false,
          loading: false,
        };

        console.log('[PREMIUM] Atualizando status:', newStatus);
        setPremiumStatus(newStatus);
      } catch (error) {
        console.error("[PREMIUM] Erro ao buscar status premium:", error);
        setPremiumStatus({
          isPremium: false,
          premiumUntil: null,
          streakFreezeCount: 0,
          adsRemoved: false,
          loading: false,
        });
      }
    };

    fetchPremiumStatus();

    // Subscribe to profile changes
    const profileChannel = supabase
      .channel("profile-premium-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchPremiumStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [user]);

  return premiumStatus;
}
