import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Track achievement unlock event
 */
export async function trackAchievementUnlock(
  supabase: any,
  userId: string,
  achievementId: string,
  achievementName: string
) {
  try {
    await supabase.functions.invoke("track-event", {
      body: {
        events: [{
          event_name: "achievement_unlocked",
          user_id: userId,
          properties: {
            achievement_id: achievementId,
            achievement_name: achievementName,
          },
        }],
      },
    });
  } catch (error) {
    console.error("Error tracking achievement unlock:", error);
    // Don't throw - analytics should not break the main flow
  }
}
