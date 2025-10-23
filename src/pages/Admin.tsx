import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminContentForm } from "@/components/AdminContentForm";
import { AdminContentList } from "@/components/AdminContentList";
import { Plus, Shield } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Content = Tables<"content">;

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | undefined>();

  // Check if user is admin
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!isLoading && profile?.role !== "admin") {
      navigate("/");
    }
  }, [profile, isLoading, navigate]);

  const handleEdit = (content: Content) => {
    setEditingContent(content);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingContent(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingContent(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-primary text-glow">
              Painel Admin
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gerencie o conteúdo da plataforma
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Conteúdo
        </Button>
      </div>

      <Card className="p-6">
        <AdminContentList onEdit={handleEdit} />
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? "Editar Conteúdo" : "Novo Conteúdo"}
            </DialogTitle>
          </DialogHeader>
          <AdminContentForm
            content={editingContent}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
