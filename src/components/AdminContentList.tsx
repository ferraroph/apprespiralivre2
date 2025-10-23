import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Play, Wind, Book } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Content = Tables<"content">;

interface AdminContentListProps {
  onEdit: (content: Content) => void;
}

const typeIcons = {
  meditation: Play,
  breathing: Wind,
  lesson: Book,
};

const typeLabels = {
  meditation: "Meditação",
  breathing: "Respiração",
  lesson: "Lição",
};

export function AdminContentList({ onEdit }: AdminContentListProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useQuery({
    queryKey: ["admin-content", filterType],
    queryFn: async () => {
      let query = supabase
        .from("content")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterType !== "all") {
        query = query.eq("type", filterType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Content[];
    },
  });

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("content")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Conteúdo excluído",
        description: "O conteúdo foi excluído com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Não foi possível excluir o conteúdo.",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando conteúdos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Conteúdos Cadastrados</h3>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="meditation">Meditações</SelectItem>
            <SelectItem value="breathing">Respiração</SelectItem>
            <SelectItem value="lesson">Lições</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!content || content.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum conteúdo encontrado. Crie o primeiro conteúdo!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {content.map((item) => {
            const Icon = typeIcons[item.type as keyof typeof typeIcons] || Play;
            const typeLabel = typeLabels[item.type as keyof typeof typeLabels] || item.type;

            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{item.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description || "Sem descrição"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{typeLabel}</span>
                        {item.duration_minutes && (
                          <span>{item.duration_minutes} min</span>
                        )}
                        {item.is_premium && (
                          <span className="text-primary font-medium">Premium</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este conteúdo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
