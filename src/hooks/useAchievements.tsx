import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category_id: string;
  xp_reward: number;
  coins_reward: number;
  gems_reward: number;
  rarity: string;
  is_secret: boolean;
  achievement_type: string;
  unlocked_at?: string;
}

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from("achievements")
          .select("*")
          .eq("user_id", user.id)
          .order("unlocked_at", { ascending: false });

        if (error) throw error;
        setAchievements(data as unknown as Achievement[]);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();

    const channel = supabase
      .channel("achievements-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "achievements",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchAchievements()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unlockAchievement = async (
    achievementType: string,
    title: string,
    description: string,
    icon: string,
    rarity: string,
    xpReward: number,
    coinsReward: number,
    gemsReward: number
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("achievements").insert({
        user_id: user.id,
        achievement_type: achievementType,
        title,
        description,
        icon,
        rarity,
        xp_reward: xpReward,
        coins_reward: coinsReward,
        gems_reward: gemsReward,
      });

      if (error) throw error;

      toast({
        title: "🏆 Conquista Desbloqueada!",
        description: `${title} - +${xpReward} XP, +${coinsReward} moedas`,
      });
    } catch (error) {
      console.error("Error unlocking achievement:", error);
    }
  };

  return { achievements, loading, unlockAchievement };
}
