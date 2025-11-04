import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreateSquadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateSquadDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSquadDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateSquad = async () => {
    // Validate input
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do squad é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (name.length > 50) {
      toast({
        title: "Erro",
        description: "Nome do squad deve ter no máximo 50 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (description.length > 200) {
      toast({
        title: "Erro",
        description: "Descrição deve ter no máximo 200 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-squad", {
        body: { name: name.trim(), description: description.trim() || null },
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Squad criado com sucesso",
      });

      // Reset form
      setName("");
      setDescription("");
      onOpenChange(false);

      // Call success callback or navigate to squad
      if (onSuccess) {
        onSuccess();
      }

      if (data?.squad?.id) {
        navigate(`/squads/${data.squad.id}`);
      }
    } catch (error) {
      console.error("Error creating squad:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar o squad",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md"
>
        <DialogHeader>
          <DialogTitle className="text-primary text-glow">
            Criar Novo Squad
          </DialogTitle>
          <DialogDescription>
            Crie um grupo para apoiar e competir com outros usuários
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome do Squad <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Guerreiros da Liberdade"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/50 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva o propósito do seu squad..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={4}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/200 caracteres
            </p>
          </div>

          <Button
            className="w-full glow-primary-subtle"
            onClick={handleCreateSquad}
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Squad"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
