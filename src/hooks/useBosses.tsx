import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { isDevMode, DEV_BOSSES, DEV_TODAY_ENCOUNTER } from "@/lib/devModeData";

export interface BossPhase {
  name: string;
  type: string;
  duration: number;
}

export interface Boss {
  id: string;
  name: string;
  description?: string;
  icon: string;
  difficulty: "daily" | "weekly";
  max_health: number;
  phases: BossPhase[];
}

export interface BossEncounter {
  id: string;
  boss_id: string;
  damage_dealt: number;
  completed: boolean;
  victory: boolean;
  created_at: string;
}

export function useBosses() {
  const { user } = useAuth();
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [todayEncounter, setTodayEncounter] = useState<BossEncounter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dev mode: return simulated bosses
    if (isDevMode()) {
      setBosses(DEV_BOSSES);
      setTodayEncounter(DEV_TODAY_ENCOUNTER);
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchBosses = async () => {
      try {
        const { data: bossesData, error: bossesError } = await supabase
          .from("boss_types")
          .select("*");

        if (bossesError) {
          console.warn("[BOSSES] Table not available:", bossesError.message);
          setLoading(false);
          return;
        }
        setBosses((bossesData || []) as unknown as Boss[]);

        const today = new Date().toISOString().split("T")[0];
        const { data: encounterData } = await supabase
          .from("boss_encounters")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", `${today}T00:00:00`)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        setTodayEncounter(encounterData);
      } catch (error) {
        // Silently handle
      } finally {
        setLoading(false);
      }
    };

    fetchBosses();
  }, [user]);

  const canFightDailyBoss = () => {
    if (!todayEncounter) return true;
    return todayEncounter.completed === false;
  };

  return { bosses, todayEncounter, canFightDailyBoss, loading };
}
