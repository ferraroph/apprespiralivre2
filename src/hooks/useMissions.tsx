import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

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
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all active missions
      const { data: allMissions, error: missionsError } = await supabase
        .from("missions")
        .select("*")
        .eq("is_active", true)
        .order("type");

      if (missionsError) throw missionsError;

      // Fetch user's progress on missions
      const { data: userMissionsData, error: userMissionsError } = await supabase
        .from("user_missions")
        .select("*, mission:missions(*)")
        .eq("user_id", user.id)
        .eq("date", new Date().toISOString().split("T")[0]);

      if (userMissionsError) throw userMissionsError;

      // Create user missions for any missions user doesn't have yet
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

        // Refetch after creating
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
      console.error("Error fetching missions:", error);
      toast.error("Erro ao carregar missões");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();

    // Subscribe to changes
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
    if (!user) return;

    try {
      const mission = missions.find((m) => m.id === userMissionId);
      if (!mission || !mission.completed || mission.claimed) return;

      // Update user_missions to claimed
      const { error: claimError } = await supabase
        .from("user_missions")
        .update({ claimed: true })
        .eq("id", userMissionId);

      if (claimError) throw claimError;

      // Update user progress (XP, coins, gems)
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
