import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { isDevMode, getDevMissions } from "@/lib/devModeData";

export interface Mission {
  id: string;
  type: "daily" | "weekly";
  name: string;
  description?: string;
  icon: string;
  target_value: number;
  xp_reward: number;
  coins_reward: number;
  gems_reward?: number;
  category: string;
}

export interface UserMission {
  id: string;
  mission_id: string;
  current_progress: number;
  completed: boolean;
  claimed: boolean;
  mission: Mission;
}

export function useMissions() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMissions = async () => {
    // Dev mode: return simulated missions
    if (isDevMode()) {
      setMissions(getDevMissions());
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: allMissions, error: missionsError } = await supabase
        .from("missions")
        .select("*")
        .eq("is_active", true)
        .order("type");

      if (missionsError) {
        console.warn("[MISSIONS] Table not available:", missionsError.message);
        setLoading(false);
        return;
      }

      const { data: userMissionsData, error: userMissionsError } = await supabase
        .from("user_missions")
        .select("*, mission:missions(*)")
        .eq("user_id", user.id)
        .eq("date", new Date().toISOString().split("T")[0]);

      if (userMissionsError) {
        console.warn("[MISSIONS] user_missions not available:", userMissionsError.message);
        setLoading(false);
        return;
      }

      const existingMissionIds = new Set(
        userMissionsData?.map((um) => um.mission_id) || []
      );
      const missionsToCreate = allMissions?.filter(
        (m) => !existingMissionIds.has(m.id)
      );

      if (missionsToCreate && missionsToCreate.length > 0) {
        const { error: insertError } = await supabase
          .from("user_missions")
          .insert(
            missionsToCreate.map((m) => ({
              user_id: user.id,
              mission_id: m.id,
              current_progress: 0,
              completed: false,
              claimed: false,
              date: new Date().toISOString().split("T")[0],
            }))
          );

        if (insertError) throw insertError;

        const { data: refreshedData } = await supabase
          .from("user_missions")
          .select("*, mission:missions(*)")
          .eq("user_id", user.id)
          .eq("date", new Date().toISOString().split("T")[0]);

        setMissions((refreshedData || []) as UserMission[]);
      } else {
        setMissions((userMissionsData || []) as UserMission[]);
      }
    } catch (error) {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();

    if (isDevMode() || !user) return;

    const channel = supabase
      .channel("user-missions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_missions",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchMissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const claimReward = async (userMissionId: string) => {
    // Dev mode: simulate claiming
    if (isDevMode()) {
      setMissions(prev => prev.map(m =>
        m.id === userMissionId ? { ...m, claimed: true } : m
      ));
      const mission = missions.find(m => m.id === userMissionId);
      if (mission) {
        toast.success(`🎉 Recompensa resgatada! +${mission.mission.xp_reward} XP, +${mission.mission.coins_reward} Coins`);
      }
      return;
    }

    if (!user) return;

    try {
      const mission = missions.find((m) => m.id === userMissionId);
      if (!mission || !mission.completed || mission.claimed) return;

      const { error: claimError } = await supabase
        .from("user_missions")
        .update({ claimed: true })
        .eq("id", userMissionId);

      if (claimError) throw claimError;

      const { data: currentProgress } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (currentProgress) {
        const { error: progressError } = await supabase
          .from("progress")
          .update({
            xp: (currentProgress.xp || 0) + mission.mission.xp_reward,
            respi_coins:
              (currentProgress.respi_coins || 0) + mission.mission.coins_reward,
            gems:
              (currentProgress.gems || 0) + (mission.mission.gems_reward || 0),
          })
          .eq("user_id", user.id);

        if (progressError) throw progressError;

        toast.success(
          `🎉 Recompensa resgatada! +${mission.mission.xp_reward} XP, +${mission.mission.coins_reward} Coins`
        );
        fetchMissions();
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast.error("Erro ao resgatar recompensa");
    }
  };

  return { missions, loading, claimReward, refetch: fetchMissions };
}
