import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createErrorResponse, ErrorCodes, handleError } from "../_shared/error-handler.ts";
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  user_id?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface NotificationRequest {
  type: "daily_reminder" | "streak_at_risk" | "achievement" | "custom";
  payload?: NotificationPayload;
  achievement_id?: string;
}

interface FCMMessage {
  message: {
    token: string;
    notification: {
      title: string;
      body: string;
    };
    data?: Record<string, string>;
    android?: {
      priority: string;
    };
    apns?: {
      headers: {
        "apns-priority": string;
      };
    };
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firebaseServiceAccount = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
    const cronSecret = Deno.env.get("CRON_SECRET");
    
    if (!firebaseServiceAccount) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check authorization - either valid cron secret OR admin user
    const authHeader = req.headers.get("Authorization");
    const cronSecretHeader = req.headers.get("x-cron-secret");
    
    let isAuthorized = false;
    
    // Check for cron secret (for automated jobs)
    if (cronSecret && cronSecretHeader === cronSecret) {
      isAuthorized = true;
      console.log("Authorized via cron secret");
    } 
    // Check for admin JWT token
    else if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return createErrorResponse(
          "Não autorizado",
          ErrorCodes.UNAUTHORIZED,
          401,
          undefined,
          corsHeaders
        );
      }
      
      // Check if user has admin role
      const { data: hasAdminRole, error: roleError } = await supabase
        .rpc("has_role", { _user_id: user.id, _role: "admin" });
      
      if (roleError || !hasAdminRole) {
        return createErrorResponse(
          "Acesso negado. Apenas administradores podem enviar notificações",
          ErrorCodes.UNAUTHORIZED,
          403,
          undefined,
          corsHeaders
        );
      }
      
      isAuthorized = true;
      console.log(`Authorized admin user: ${user.id}`);
    }
    
    if (!isAuthorized) {
      return createErrorResponse(
        "Autorização necessária. Use token de admin ou secret de cron",
        ErrorCodes.UNAUTHORIZED,
        401,
        undefined,
        corsHeaders
      );
    }

    // Validate request
    const body: NotificationRequest = await req.json();
    
    if (!body.type) {
      return new Response(
        JSON.stringify({ error: "Notification type is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let notificationsSent = 0;
    let errors = 0;

    // Handle different notification types
    switch (body.type) {
      case "daily_reminder":
        ({ sent: notificationsSent, errors } = await sendDailyReminders(supabase));
        break;
      
      case "streak_at_risk":
        ({ sent: notificationsSent, errors } = await sendStreakAtRiskNotifications(supabase));
        break;
      
      case "achievement":
        if (!body.payload?.user_id || !body.achievement_id) {
          return new Response(
            JSON.stringify({ error: "user_id and achievement_id required for achievement notifications" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        await sendAchievementNotification(supabase, body.payload.user_id, body.achievement_id);
        notificationsSent = 1;
        break;
      
      case "custom":
        if (!body.payload) {
          return new Response(
            JSON.stringify({ error: "Payload required for custom notifications" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (body.payload.user_id) {
          await sendNotificationToUser(supabase, body.payload.user_id, body.payload.title, body.payload.body, body.payload.data);
          notificationsSent = 1;
        }
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: "Invalid notification type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifications_sent: notificationsSent,
        errors: errors 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-notification:", error);
    return handleError(error, corsHeaders);
  }
});

// Generate OAuth2 access token from Firebase service account
async function getAccessToken(): Promise<string> {
  const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT not configured");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    alg: "RS256" as const,
    typ: "JWT",
  };
  
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  // Create JWT using djwt
  const jwt = await create(header, payload, serviceAccount.private_key);

  // Exchange JWT for access token
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function sendDailyReminders(supabase: any) {
  // Query users who haven't checked in today
  const today = new Date().toISOString().split('T')[0];
  
  const { data: usersNeedingReminder, error } = await supabase
    .from("progress")
    .select("user_id")
    .or(`last_checkin_date.is.null,last_checkin_date.neq.${today}`);

  if (error) {
    console.error("Error fetching users for daily reminder:", error);
    return { sent: 0, errors: 1 };
  }

  let sent = 0;
  let errors = 0;

  for (const user of usersNeedingReminder || []) {
    try {
      await sendNotificationToUser(
        supabase,
        user.user_id,
        "Hora do Check-in! 🌟",
        "Não esqueça de registrar seu progresso hoje. Sua jornada é importante!",
        { type: "daily_reminder" }
      );
      sent++;
    } catch (error) {
      console.error(`Error sending daily reminder to user ${user.user_id}:`, error);
      errors++;
    }
  }

  return { sent, errors };
}

async function sendStreakAtRiskNotifications(supabase: any) {
  // Query users who haven't checked in for 48 hours
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  
  const { data: usersAtRisk, error } = await supabase
    .from("progress")
    .select("user_id, current_streak")
    .lt("last_checkin_date", fortyEightHoursAgo)
    .gt("current_streak", 0);

  if (error) {
    console.error("Error fetching users at risk:", error);
    return { sent: 0, errors: 1 };
  }

  let sent = 0;
  let errors = 0;

  for (const user of usersAtRisk || []) {
    try {
      await sendNotificationToUser(
        supabase,
        user.user_id,
        "⚠️ Sua sequência está em risco!",
        `Você está há 48h sem fazer check-in. Não perca sua sequência de ${user.current_streak} dias!`,
        { type: "streak_at_risk", streak: user.current_streak.toString() }
      );
      sent++;
    } catch (error) {
      console.error(`Error sending streak at risk notification to user ${user.user_id}:`, error);
      errors++;
    }
  }

  return { sent, errors };
}

async function sendAchievementNotification(supabase: any, userId: string, achievementId: string) {
  // Fetch achievement details
  const { data: achievement, error } = await supabase
    .from("achievements")
    .select("name, description")
    .eq("id", achievementId)
    .single();

  if (error || !achievement) {
    console.error("Error fetching achievement:", error);
    throw new Error("Achievement not found");
  }

  await sendNotificationToUser(
    supabase,
    userId,
    "🏆 Conquista Desbloqueada!",
    `Parabéns! Você desbloqueou: ${achievement.name}`,
    { 
      type: "achievement", 
      achievement_id: achievementId,
      achievement_name: achievement.name 
    }
  );
}

async function sendNotificationToUser(
  supabase: any,
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  // Retrieve FCM tokens for user
  const { data: tokens, error: tokenError } = await supabase
    .from("user_tokens")
    .select("fcm_token, id")
    .eq("user_id", userId);

  if (tokenError) {
    console.error("Error fetching user tokens:", tokenError);
    throw new Error("Failed to retrieve user tokens");
  }

  if (!tokens || tokens.length === 0) {
    console.log(`No FCM tokens found for user ${userId}`);
    return;
  }

  const expiredTokenIds: string[] = [];

  // Send notification to each token
  for (const tokenRecord of tokens) {
    try {
      const message: FCMMessage = {
        message: {
          token: tokenRecord.fcm_token,
          notification: {
            title,
            body,
          },
          data: data || {},
          android: {
            priority: "high",
          },
          apns: {
            headers: {
              "apns-priority": "10",
            },
          },
        },
      };

      // Get OAuth2 token from service account
      const accessToken = await getAccessToken();
      
      const response = await fetch("https://fcm.googleapis.com/v1/projects/respira-livre-app/messages:send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("FCM error:", errorData);
        
        // Check if token is invalid or expired
        if (errorData.error?.code === 404 || errorData.error?.status === "NOT_FOUND" || 
            errorData.error?.code === 400 || errorData.error?.message?.includes("invalid")) {
          expiredTokenIds.push(tokenRecord.id);
        }
      } else {
        // Update last_used_at timestamp
        await supabase
          .from("user_tokens")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", tokenRecord.id);
      }
    } catch (error) {
      console.error(`Error sending notification to token ${tokenRecord.fcm_token}:`, error);
    }
  }

  // Clean up expired tokens
  if (expiredTokenIds.length > 0) {
    await supabase
      .from("user_tokens")
      .delete()
      .in("id", expiredTokenIds);
    
    console.log(`Cleaned up ${expiredTokenIds.length} expired tokens for user ${userId}`);
  }
}
