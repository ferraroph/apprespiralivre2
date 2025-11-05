import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Bot, User, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function AICoach() {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch chat history
  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ["chat-messages"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) throw error;
      return data as Message[];
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setIsStreaming(true);
    setStreamingMessage("");

    try {
      // Call AI coach edge function with streaming
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message: userMessage,
            includeContext: true,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Muitas requisições. Por favor, aguarde um momento.");
        }
        if (response.status === 402) {
          throw new Error("Créditos da IA esgotados. Entre em contato com o suporte.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha ao obter resposta da IA");
      }

      // Handle SSE streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setStreamingMessage((prev) => prev + parsed.content);
              }
            } catch (e) {
              // Invalid JSON, skip
            }
          }
        }
      }

      // Refetch messages after streaming completes
      await refetch();
      setStreamingMessage("");
    } catch (error: any) {
      console.error("AI Coach error:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar mensagem",
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-12rem)]">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-bold text-primary text-glow">
            Coach IA
          </h1>
        </div>
        <p className="text-muted-foreground">
          Seu assistente pessoal para parar de fumar
        </p>
      </div>

      <Card className="card-premium h-[calc(100%-8rem)] flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-4">
            {messages && messages.length === 0 && !streamingMessage && (
              <div className="text-center text-muted-foreground py-12">
                <Bot className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
                <p className="text-lg font-semibold mb-2">
                  Olá! Sou seu coach de cessação do tabagismo.
                </p>
                <p className="text-sm">
                  Estou aqui para te ajudar com estratégias, motivação e apoio.
                  <br />
                  Como posso te ajudar hoje?
                </p>
              </div>
            )}

            {messages?.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-slide-up ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground glow-primary-subtle"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            ))}

            {/* Streaming message */}
            {streamingMessage && (
              <div className="flex gap-3 animate-slide-up">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted">
                  <p className="whitespace-pre-wrap">{streamingMessage}</p>
                  <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-3">
            <Textarea
              placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isStreaming}
              rows={2}
              className="resize-none"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="glow-primary-subtle px-8"
              size="lg"
            >
              {isStreaming ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            O Coach IA tem acesso ao seu progresso e perfil para dar conselhos personalizados.
          </p>
        </div>
      </Card>
    </div>
  );
}
