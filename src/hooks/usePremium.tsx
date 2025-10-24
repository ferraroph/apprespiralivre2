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
  const { user } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    premiumUntil: null,
    streakFreezeCount: 0,
    adsRemoved: false,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
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
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("premium_until, streak_freeze_count, ads_removed")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        // Check if premium is active
        const isPremium = profile?.premium_until
          ? new Date(profile.premium_until) > new Date()
          : false;

        setPremiumStatus({
          isPremium,
          premiumUntil: profile?.premium_until || null,
          streakFreezeCount: profile?.streak_freeze_count || 0,
          adsRemoved: profile?.ads_removed || false,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching premium status:", error);
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
          filter: `id=eq.${user.id}`,
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
