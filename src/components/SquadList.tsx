import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Flame, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateSquadDialog } from "@/components/CreateSquadDialog";
import { useCachedAsync } from "@/hooks/useCache";

interface Squad {
  id: string;
  name: string;
  description: string | null;
  max_members: number;
  squad_streak: number;
  created_at: string;
  member_count?: number;
}

export function SquadList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningSquadId, setJoiningSquadId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchSquads = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simple query compatible with Supabase Free plan
      // First, get all squads (simple query)
      const { data: squadsData, error: squadsError } = await supabase
        .from("squads")
        .select("id, name, description, max_members, squad_streak, created_at")
        .order("squad_streak", { ascending: false });

      if (squadsError) throw squadsError;

      // Then get member counts separately (avoiding complex JOINs)
      const squadIds = (squadsData || []).map(squad => squad.id);
      
      if (squadIds.length === 0) {
        setSquads([]);
        return;
      }

      // Get member counts for all squads in one simple query
      const { data: memberData, error: memberError } = await supabase
        .from("squad_members")
        .select("squad_id")
        .in("squad_id", squadIds);

      if (memberError) {
        console.warn("Could not fetch member counts:", memberError);
        // Return squads without member counts rather than failing
        const squadsWithoutCounts = (squadsData || []).map(squad => ({
          ...squad,
          member_count: 0
        }));
        setSquads(squadsWithoutCounts);
        return;
      }

      // Count members per squad
      const memberCounts = new Map();
      (memberData || []).forEach(member => {
        const count = memberCounts.get(member.squad_id) || 0;
        memberCounts.set(member.squad_id, count + 1);
      });

      const squadsWithCounts = (squadsData || []).map(squad => ({
        ...squad,
        member_count: memberCounts.get(squad.id) || 0
      }));

      setSquads(squadsWithCounts);
    } catch (error) {
      console.error("Error fetching squads:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os squads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSquads();
  }, [fetchSquads]);

  const handleJoinSquad = async (squadId: string) => {
    try {
      setJoiningSquadId(squadId);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("join-squad", {
        body: { squad_id: squadId },
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
        description: "Você entrou no squad",
      });

      // Navigate to squad detail
      navigate(`/squads/${squadId}`);
    } catch (error) {
      console.error("Error joining squad:", error);
      toast({
        title: "Erro",
        description: "Não foi possível entrar no squad",
        variant: "destructive",
      });
    } finally {
      setJoiningSquadId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreateSquadDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          fetchSquads();
          setCreateDialogOpen(false);
        }}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Squads</h1>
          <p className="text-muted-foreground mt-1">
            Junte-se a um grupo e apoie-se mutuamente
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="glow-primary-subtle"
        >
          <Plus className="mr-2 h-4 w-4" />
          Criar Squad
        </Button>
      </div>

      {squads.length === 0 ? (
        <Card className="card-premium card-depth p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum squad ainda</h3>
          <p className="text-muted-foreground mb-6">
            Seja o primeiro a criar um squad!
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Primeiro Squad
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {squads.map((squad, index) => (
            <Card
              key={squad.id}
              className="card-premium card-depth p-6 animate-slide-up card-interactive cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/squads/${squad.id}`)}
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-primary mb-2">
                    {squad.name}
                  </h3>
                  {squad.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {squad.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span>
                      {squad.member_count}/{squad.max_members}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-primary" />
                    <span>{squad.squad_streak} dias</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinSquad(squad.id);
                  }}
                  disabled={
                    joiningSquadId === squad.id ||
                    squad.member_count >= squad.max_members
                  }
                >
                  {joiningSquadId === squad.id
                    ? "Entrando..."
                    : squad.member_count >= squad.max_members
                    ? "Squad Cheio"
                    : "Entrar no Squad"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
