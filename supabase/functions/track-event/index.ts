import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withRateLimit } from "../_shared/rate-limit.ts";
import { createErrorResponse, ErrorCodes, handleError } from "../_shared/error-handler.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

interface TrackEventRequest {
  events: AnalyticsEvent[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user (optional for analytics)
    let authenticatedUserId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && user) {
        authenticatedUserId = user.id;
        
        // Apply rate limiting for authenticated users
        const rateLimitResponse = await withRateLimit(user.id, 100);
        if (rateLimitResponse) {
          return rateLimitResponse;
        }
      }
    }

    // Validate request
    const body: TrackEventRequest = await req.json();
    
    if (!body.events || !Array.isArray(body.events)) {
      return new Response(
        JSON.stringify({ error: "Events array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.events.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one event is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.events.length > 100) {
      return new Response(
        JSON.stringify({ error: "Maximum 100 events per batch" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and prepare events
    const validatedEvents = body.events.map((event) => {
      if (!event.event_name || typeof event.event_name !== "string") {
        throw new Error("Each event must have an event_name");
      }

      if (event.event_name.length > 100) {
        throw new Error("Event name too long (max 100 characters)");
      }

      return {
        event_name: event.event_name,
        user_id: event.user_id || authenticatedUserId || null,
        properties: event.properties || {},
        created_at: event.timestamp || new Date().toISOString(),
      };
    });

    // Store events in database
    const { error: insertError } = await supabase
      .from("analytics_events")
      .insert(validatedEvents);

    if (insertError) {
      console.error("Error inserting analytics events:", insertError);
      throw new Error("Failed to store events");
    }

    // Optional: Forward to external analytics service
    // This can be implemented later if needed
    // await forwardToExternalService(validatedEvents);

    return new Response(
      JSON.stringify({ 
        success: true, 
        events_tracked: validatedEvents.length 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error in track-event:", error);
    return handleError(error, corsHeaders);
  }
});
