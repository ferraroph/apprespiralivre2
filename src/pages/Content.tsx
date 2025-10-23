import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, Wind, Book, Lock } from "lucide-react";
import { usePremium } from "@/hooks/usePremium";
import { Tables } from "@/integrations/supabase/types";

type Content = Tables<"content">;

const typeIcons = {
  meditation: Play,
  breathing: Wind,
  lesson: Book,
};

const typeTitles = {
  meditation: "Meditações",
  breathing: "Técnicas de Respiração",
  lesson: "Lições",
};

export default function Content() {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const { isPremium } = usePremium();

  const { data: content, isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Content[];
    },
  });

  const handleContentClick = async (item: Content) => {
    // Check if content is premium and user doesn't have premium
    if (item.is_premium && !isPremium) {
      return;
    }

    setSelectedContent(item);

    // Track content view for analytics
    try {
      await supabase.from("analytics_events").insert({
        event_name: "content_viewed",
        properties: {
          content_id: item.id,
          content_type: item.type,
          content_title: item.title,
        },
      });
    } catch (error) {
      console.error("Failed to track content view:", error);
    }
  };

  const groupedContent = content?.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, Content[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando conteúdo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary text-glow">
          Conteúdo
        </h1>
        <p className="text-muted-foreground">
          Recursos para fortalecer sua jornada
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedContent || {}).map(([type, items], sectionIndex) => {
          const Icon = typeIcons[type as keyof typeof typeIcons] || Play;
          const title = typeTitles[type as keyof typeof typeTitles] || type;

          return (
            <div
              key={type}
              className="space-y-4 animate-slide-up"
              style={{ animationDelay: `${sectionIndex * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">{title}</h2>
              </div>

              <div className="grid gap-4">
                {items.map((item, itemIndex) => {
                  const isLocked = item.is_premium && !isPremium;

                  return (
                    <Card
                      key={item.id}
                      className="card-premium p-4 animate-scale-in cursor-pointer hover:scale-[1.02] transition-transform"
                      style={{
                        animationDelay: `${(sectionIndex * 0.3 + itemIndex * 0.1)}s`,
                      }}
                      onClick={() => handleContentClick(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{item.title}</h3>
                            {isLocked && (
                              <Lock className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {item.description}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.duration_minutes ? `${item.duration_minutes} min` : ""}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
                          disabled={isLocked}
                        >
                          {isLocked ? <Lock className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {(!content || content.length === 0) && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum conteúdo disponível no momento.
            </p>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedContent?.description && (
              <p className="text-muted-foreground">{selectedContent.description}</p>
            )}
            {selectedContent?.media_url && (
              <div className="w-full">
                {selectedContent.type === "meditation" || selectedContent.type === "lesson" ? (
                  <audio
                    controls
                    className="w-full"
                    src={selectedContent.media_url}
                  >
                    Seu navegador não suporta o elemento de áudio.
                  </audio>
                ) : (
                  <video
                    controls
                    className="w-full rounded-lg"
                    src={selectedContent.media_url}
                  >
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                )}
              </div>
            )}
            {!selectedContent?.media_url && (
              <p className="text-center text-muted-foreground py-8">
                Mídia não disponível para este conteúdo.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
