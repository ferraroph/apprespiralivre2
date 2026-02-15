import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Users } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { isDevMode, DEV_LEAGUES, getDevLeagueParticipants, DEV_USER } from "@/lib/devModeData";
import type { DevLeague, DevLeagueParticipant } from "@/lib/devModeData";

export default function Leagues() {
  const { user } = useAuth();
  const { progress, loading: progressLoading } = useProgress();
  const [leagues, setLeagues] = useState<DevLeague[]>([]);
  const [participants, setParticipants] = useState<DevLeagueParticipant[]>([]);
  const [currentLeague, setCurrentLeague] = useState<DevLeague | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dev mode: use full simulated data
    if (isDevMode()) {
      setLeagues(DEV_LEAGUES);
      
      // Find user's league based on XP
      const userXp = progress?.xp || 0;
      const userLeague = [...DEV_LEAGUES]
        .reverse()
        .find(l => userXp >= l.min_xp);
      
      if (userLeague) {
        setCurrentLeague(userLeague);
        setParticipants(getDevLeagueParticipants(userLeague.id));
      }
      
      setLoading(false);
      return;
    }

    const fetchLeagues = async () => {
      try {
        const { data: leaguesData, error } = await supabase
          .from("leagues")
          .select("*")
          .order("tier", { ascending: true });

        if (error) {
          console.warn("[LEAGUES] Table not available:", error.message);
          setLoading(false);
          return;
        }

        if (leaguesData) {
          setLeagues(leaguesData as unknown as DevLeague[]);
          
          if (progress?.xp !== undefined) {
            const userLeague = [...leaguesData]
              .reverse()
              .find(l => progress.xp >= l.min_xp);
            
            if (userLeague) {
              setCurrentLeague(userLeague as unknown as DevLeague);
              
              const { data: participantsData } = await supabase
                .from("league_participants")
                .select("*")
                .eq("league_id", userLeague.id)
                .gte("week_end", new Date().toISOString())
                .order("week_xp", { ascending: false })
                .limit(20);
              
              if (participantsData) {
                setParticipants(participantsData as unknown as DevLeagueParticipant[]);
              }
            }
          }
        }
      } catch (error) {
        // Silently handle
      } finally {
        setLoading(false);
      }
    };

    if (!progressLoading) {
      fetchLeagues();
    }
  }, [progress, progressLoading]);

  const userId = isDevMode() ? DEV_USER.id : user?.id;
  const userPosition = participants.findIndex(p => p.user_id === userId) + 1;

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
                <span className="text-4xl">{currentLeague.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentLeague.name}</h2>
                <p className="text-muted-foreground">Sua Liga Atual • {progress?.xp || 0} XP</p>
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
                    participant.user_id === userId
                      ? "bg-primary/20 border border-primary"
                      : "bg-card/50 hover:bg-card/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-lg w-8 ${idx < 3 ? 'text-primary' : ''}`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <Users className="h-4 w-4" />
                    <span className={participant.user_id === userId ? 'font-bold text-primary' : ''}>
                      {participant.display_name || (participant.user_id === userId ? "Você" : `Jogador ${idx + 1}`)}
                    </span>
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
                isActive ? "border-primary glow-primary-subtle" : ""
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
                      <p className="text-sm text-green-400">✓ Completada</p>
                    )}
                    {!isActive && !isCompleted && (
                      <p className="text-sm text-muted-foreground">
                        {league.min_xp} XP necessário
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  Tier {league.tier}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
