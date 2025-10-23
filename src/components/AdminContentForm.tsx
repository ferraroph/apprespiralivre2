import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminContentUpload } from "./AdminContentUpload";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Content = Tables<"content">;

interface AdminContentFormProps {
  content?: Content;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AdminContentForm({ content, onSuccess, onCancel }: AdminContentFormProps) {
  const [title, setTitle] = useState(content?.title || "");
  const [description, setDescription] = useState(content?.description || "");
  const [type, setType] = useState(content?.type || "meditation");
  const [mediaUrl, setMediaUrl] = useState(content?.media_url || "");
  const [durationMinutes, setDurationMinutes] = useState(
    content?.duration_minutes?.toString() || ""
  );
  const [isPremium, setIsPremium] = useState(content?.is_premium || false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!title.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o título.",
        variant: "destructive",
      });
      return;
    }

    if (!type) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione o tipo de conteúdo.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const contentData = {
        title: title.trim(),
        description: description.trim() || null,
        type,
        media_url: mediaUrl || null,
        duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
        is_premium: isPremium,
      };

      if (content?.id) {
        // Update existing content
        const { error } = await supabase
          .from("content")
          .update(contentData)
          .eq("id", content.id);

        if (error) throw error;

        toast({
          title: "Conteúdo atualizado",
          description: "O conteúdo foi atualizado com sucesso.",
        });
      } else {
        // Insert new content
        const { error } = await supabase
          .from("content")
          .insert(contentData);

        if (error) throw error;

        toast({
          title: "Conteúdo criado",
          description: "O conteúdo foi criado com sucesso.",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Content form error:", error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar o conteúdo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Respiração Consciente"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o conteúdo..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo *</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meditation">Meditação</SelectItem>
              <SelectItem value="breathing">Técnica de Respiração</SelectItem>
              <SelectItem value="lesson">Lição</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duração (minutos)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder="Ex: 5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="premium">Conteúdo Premium</Label>
          <Select
            value={isPremium ? "true" : "false"}
            onValueChange={(value) => setIsPremium(value === "true")}
          >
            <SelectTrigger id="premium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Gratuito</SelectItem>
              <SelectItem value="true">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!content?.id && (
          <AdminContentUpload onUploadComplete={setMediaUrl} />
        )}

        {mediaUrl && (
          <div className="space-y-2">
            <Label>URL da Mídia</Label>
            <Input value={mediaUrl} readOnly className="bg-muted" />
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvando..." : content?.id ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
