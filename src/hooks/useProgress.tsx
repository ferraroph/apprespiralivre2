import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useProgress() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch progress
        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (progressError) throw progressError;
        setProgress(progressData);

        // Calculate daily progress
        if (profileData) {
          await supabase.rpc("calculate_daily_progress", {
            p_user_id: user.id,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to changes
    const progressChannel = supabase
      .channel("progress-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "progress",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
    };
  }, [user]);

  return { profile, progress, loading };
}
