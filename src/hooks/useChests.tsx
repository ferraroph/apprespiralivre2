import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { isDevMode } from "@/lib/devModeData";

export interface ChestType {
  id: string;
  name: string;
  rarity: string;
  icon: string;
  min_xp: number;
  max_xp: number;
  min_coins: number;
  max_coins: number;
  min_gems: number;
  max_gems: number;
  gem_chance: number;
}

export interface UserChest {
  id: string;
  user_id: string;
  chest_type_id: string;
  opened: boolean;
  rewards: Record<string, unknown>;
  earned_at: string;
  opened_at?: string;
  chest_type: ChestType;
}

export function useChests() {
  const { user } = useAuth();
  const [chests, setChests] = useState<UserChest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChests = async () => {
    if (isDevMode() || !user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_chests")
        .select("*, chest_type:chest_types(*)")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (error) {
        console.warn("[CHESTS] Table not available:", error.message);
        setLoading(false);
        return;
      }
      setChests((data || []) as unknown as UserChest[]);
    } catch (error) {
      // Silently handle - tables may not be created yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChests();

    if (isDevMode() || !user) return;

    const channel = supabase
      .channel("user-chests-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_chests",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchChests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const openChest = async (chestId: string) => {
    if (!user || isDevMode()) return;

    try {
      const chest = chests.find((c) => c.id === chestId);
      if (!chest || chest.opened) return;

      const xpReward =
        Math.floor(
          Math.random() * (chest.chest_type.max_xp - chest.chest_type.min_xp + 1)
        ) + chest.chest_type.min_xp;
      const coinsReward =
        Math.floor(
          Math.random() *
            (chest.chest_type.max_coins - chest.chest_type.min_coins + 1)
        ) + chest.chest_type.min_coins;
      const gemsReward =
        Math.random() * 100 < chest.chest_type.gem_chance
          ? Math.floor(
              Math.random() *
                (chest.chest_type.max_gems - chest.chest_type.min_gems + 1)
            ) + chest.chest_type.min_gems
          : 0;

      const rewards = { xp: xpReward, coins: coinsReward, gems: gemsReward };

      const { error: chestError } = await supabase
        .from("user_chests")
        .update({ opened: true, rewards, opened_at: new Date().toISOString() })
        .eq("id", chestId);

      if (chestError) throw chestError;

      const { data: progress } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (progress) {
        const { error: progressError } = await supabase
          .from("progress")
          .update({
            xp: (progress.xp || 0) + xpReward,
            respi_coins: (progress.respi_coins || 0) + coinsReward,
            gems: (progress.gems || 0) + gemsReward,
          })
          .eq("user_id", user.id);

        if (progressError) throw progressError;
      }

      toast.success(
        `🎉 Baú aberto! +${xpReward} XP, +${coinsReward} Coins${gemsReward > 0 ? `, +${gemsReward} Gemas` : ""}`
      );
      fetchChests();
    } catch (error) {
      console.error("Error opening chest:", error);
      toast.error("Erro ao abrir baú");
    }
  };

  return { chests, loading, openChest, refetch: fetchChests };
}
