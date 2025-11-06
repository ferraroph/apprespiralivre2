import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award, Users } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface League {
  id: string;
  name: string;
  tier: number;
  min_xp: number;
  icon: string;
  color: string;
}

interface LeagueParticipant {
  id: string;
  user_id: string;
  league_id: string;
  week_xp: number;
  position: number;
}

export default function Leagues() {
  const { user } = useAuth();
  const { progress, loading: progressLoading } = useProgress();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [participants, setParticipants] = useState<LeagueParticipant[]>([]);
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const { data: leaguesData } = await supabase
          .from("leagues")
          .select("*")
          .order("tier", { ascending: true });

        if (leaguesData) {
          setLeagues(leaguesData as unknown as League[]);
          
          if (progress?.xp !== undefined) {
            const userLeague = [...leaguesData]
              .reverse()
              .find(l => progress.xp >= l.min_xp);
            
            if (userLeague) {
              setCurrentLeague(userLeague as unknown as League);
              
              const { data: participantsData } = await supabase
                .from("league_participants")
                .select("*")
                .eq("league_id", userLeague.id)
                .gte("week_end", new Date().toISOString())
                .order("week_xp", { ascending: false })
                .limit(20);
              
              if (participantsData) {
                setParticipants(participantsData as unknown as LeagueParticipant[]);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching leagues:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!progressLoading) {
      fetchLeagues();
    }
  }, [progress, progressLoading]);

  const userPosition = participants.findIndex(p => p.user_id === user?.id) + 1;

  if (loading || progressLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-20 w-full" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-primary text-glow">
          Sistema de Ligas
        </h1>
        <p className="text-muted-foreground">
          Compita com outros usuários e suba de nível semanalmente!
        </p>
      </div>

      {currentLeague && (
        <Card className="p-6 card-premium card-depth glow-primary-subtle">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-primary/20">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentLeague.name}</h2>
                <p className="text-muted-foreground">Sua Liga Atual</p>
              </div>
            </div>
            {userPosition > 0 && (
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">#{userPosition}</p>
                <p className="text-sm text-muted-foreground">Posição</p>
              </div>
            )}
          </div>

          {participants.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold mb-3">🏆 Ranking Semanal</h3>
              {participants.slice(0, 10).map((participant, idx) => (
                <div
                  key={participant.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    participant.user_id === user?.id
                      ? "bg-primary/20 border border-primary"
                      : "bg-card/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg w-8">#{idx + 1}</span>
                    <Users className="h-4 w-4" />
                    <span>{participant.user_id === user?.id ? "Você" : `Jogador ${idx + 1}`}</span>
                  </div>
                  <span className="font-bold text-primary">{participant.week_xp} XP</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <div className="grid gap-4">
        <h2 className="text-2xl font-bold">Todas as Ligas</h2>
        {leagues.map((league, index) => {
          const isActive = currentLeague?.id === league.id;
          const isCompleted = progress?.xp !== undefined && progress.xp >= league.min_xp;

          return (
            <Card
              key={league.id}
              className={`card-premium card-depth p-6 animate-slide-up card-interactive transition-all duration-300 ${
                isActive ? "border-primary glow-primary-subtle scale-105" : "hover:scale-102"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full bg-card transition-all duration-300 ${
                      isActive ? "glow-primary-subtle scale-110" : ""
                    }`}
                  >
                    <span className="text-3xl">{league.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{league.name}</h3>
                    {isActive && (
                      <p className="text-sm text-primary animate-pulse">Liga Atual</p>
                    )}
                    {!isActive && isCompleted && (
                      <p className="text-sm text-muted-foreground">
                        ✓ Completada
                      </p>
                    )}
                    {!isActive && !isCompleted && (
                      <p className="text-sm text-muted-foreground">
                        {league.min_xp} XP necessário
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
