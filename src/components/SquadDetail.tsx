import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Flame, Crown, ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Squad {
  id: string;
  name: string;
  description: string | null;
  max_members: number;
  squad_streak: number;
  created_at: string;
}

interface SquadMember {
  id: string;
  user_id: string;
  role: "leader" | "member";
  joined_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
  progress: {
    current_streak: number;
  };
}

export function SquadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [squad, setSquad] = useState<Squad | null>(null);
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSquadDetails();
    }
  }, [id]);

  const fetchSquadDetails = async () => {
    try {
      setLoading(true);

      // Fetch squad details
      const { data: squadData, error: squadError } = await supabase
        .from("squads")
        .select("*")
        .eq("id", id)
        .single();

      if (squadError) throw squadError;
      setSquad(squadData);

      // Fetch squad members with profiles and progress
      const { data: membersData, error: membersError } = await supabase
        .from("squad_members")
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          ),
          progress:user_id (
            current_streak
          )
        `)
        .eq("squad_id", id)
        .order("joined_at", { ascending: true });

      if (membersError) throw membersError;
      setMembers(membersData || []);
    } catch (error) {
      console.error("Error fetching squad details:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do squad",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSquad = async () => {
    if (!id) return;

    try {
      setLeaving(true);

      const { data, error } = await supabase.functions.invoke("leave-squad", {
        body: { squad_id: id },
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
        description: "Você saiu do squad",
      });

      navigate("/squads");
    } catch (error) {
      console.error("Error leaving squad:", error);
      toast({
        title: "Erro",
        description: "Não foi possível sair do squad",
        variant: "destructive",
      });
    } finally {
      setLeaving(false);
    }
  };

  const isMember = members.some((m) => m.user_id === user?.id);
  const sortedMembers = [...members].sort(
    (a, b) => (b.progress?.current_streak || 0) - (a.progress?.current_streak || 0)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!squad) {
    return (
      <Card className="card-premium card-depth p-12 text-center">
        <h3 className="text-xl font-semibold mb-2">Squad não encontrado</h3>
        <Button onClick={() => navigate("/squads")} className="mt-4">
          Voltar para Squads
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/squads")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primary">{squad.name}</h1>
          {squad.description && (
            <p className="text-muted-foreground mt-1">{squad.description}</p>
          )}
        </div>
        {isMember && (
          <Button
            variant="destructive"
            onClick={handleLeaveSquad}
            disabled={leaving}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {leaving ? "Saindo..." : "Sair do Squad"}
          </Button>
        )}
      </div>

      {/* Squad Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-premium card-depth p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 glow-primary-subtle">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Membros</p>
              <p className="text-2xl font-bold text-primary">
                {members.length}/{squad.max_members}
              </p>
            </div>
          </div>
        </Card>

        <Card className="card-premium card-depth p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 glow-primary-subtle">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Squad Streak</p>
              <p className="text-2xl font-bold text-primary">
                {squad.squad_streak} dias
              </p>
            </div>
          </div>
        </Card>

        <Card className="card-premium card-depth p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 glow-primary-subtle">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Líder</p>
              <p className="text-lg font-bold text-primary">
                {members.find((m) => m.role === "leader")?.profiles?.name || "N/A"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Squad Leaderboard */}
      <Card className="card-premium card-depth p-6">
        <h2 className="text-xl font-bold mb-4 text-primary">
          Ranking do Squad
        </h2>
        <div className="space-y-3">
          {sortedMembers.map((member, index) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-primary/10 hover:border-primary/30 transition-colors"
            >
              <div className="text-2xl font-bold text-primary w-8">
                #{index + 1}
              </div>
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {member.profiles?.name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{member.profiles?.name}</p>
                  {member.role === "leader" && (
                    <Crown className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Membro desde {new Date(member.joined_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                <span className="text-xl font-bold text-primary">
                  {member.progress?.current_streak || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
