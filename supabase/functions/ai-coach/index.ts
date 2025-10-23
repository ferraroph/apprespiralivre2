import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withRateLimit } from "../_shared/rate-limit.ts";
import { createErrorResponse, ErrorCodes, handleError } from "../_shared/error-handler.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AICoachRequest {
  message: string;
  includeContext: boolean;
}

interface UserContext {
  profile: {
    id: string;
    name?: string;
    email?: string;
    [key: string]: unknown;
  } | null;
  progress: {
    current_streak?: number;
    cigarettes_avoided?: number;
    money_saved?: number;
    [key: string]: unknown;
  } | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
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

    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(user.id, 100);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Validate request
    const body: AICoachRequest = await req.json();
    
    if (!body.message || typeof body.message !== "string" || body.message.trim().length === 0) {
      return createErrorResponse(
        "Message is required",
        ErrorCodes.INVALID_INPUT,
        400,
        undefined,
        corsHeaders
      );
    }

    if (body.message.length > 2000) {
      return createErrorResponse(
        "Message too long (max 2000 characters)",
        ErrorCodes.INVALID_INPUT,
        400,
        undefined,
        corsHeaders
      );
    }

    // Fetch user context if requested
    let userContext: UserContext | null = null;
    
    if (body.includeContext) {
      const [profileResult, progressResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("progress").select("*").eq("user_id", user.id).single(),
      ]);

      userContext = {
        profile: profileResult.data,
        progress: progressResult.data,
      };
    }

    // Insert user message to database
    const { error: insertError } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "user",
      content: body.message,
    });

    if (insertError) {
      console.error("Error inserting user message:", insertError);
      throw new Error("Failed to save message");
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(userContext);

    // Fetch recent chat history
    const { data: recentMessages } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const chatHistory = (recentMessages || []).reverse();

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "gemini-2.0-flash-exp",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory,
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Lovable AI error:", errorText);
      throw new Error("AI service unavailable");
    }

    // Set up SSE headers
    const headers = {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    };

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiResponse.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Save complete AI response to database
              await supabase.from("chat_messages").insert({
                user_id: user.id,
                role: "assistant",
                content: fullResponse,
              });
              
              controller.close();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                
                if (data === "[DONE]") {
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                  console.error("Error parsing chunk:", e);
                }
              }
            }
          }
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, { headers });

  } catch (error) {
    console.error("Error in ai-coach:", error);
    return handleError(error, corsHeaders);
  }
});

function buildSystemPrompt(userContext: UserContext | null): string {
  let prompt = `Você é um coach de cessação do tabagismo empático e solidário. Seu objetivo é ajudar as pessoas a pararem de fumar através de apoio emocional, estratégias práticas e motivação positiva.

Diretrizes:
- Seja sempre empático, compreensivo e não julgador
- Ofereça conselhos práticos e baseados em evidências
- Celebre pequenas vitórias e progresso
- Ajude a lidar com desejos e gatilhos
- Forneça estratégias de enfrentamento quando necessário
- Use uma linguagem encorajadora e positiva
- Mantenha as respostas concisas e acionáveis
- Responda sempre em português brasileiro`;

  if (userContext?.progress) {
    const { current_streak, cigarettes_avoided, money_saved } = userContext.progress;
    
    prompt += `\n\nContexto do usuário:`;
    
    if (current_streak) {
      prompt += `\n- Sequência atual: ${current_streak} dias sem fumar`;
    }
    
    if (cigarettes_avoided) {
      prompt += `\n- Cigarros evitados: ${cigarettes_avoided}`;
    }
    
    if (money_saved) {
      prompt += `\n- Dinheiro economizado: R$ ${money_saved.toFixed(2)}`;
    }
  }

  return prompt;
}
