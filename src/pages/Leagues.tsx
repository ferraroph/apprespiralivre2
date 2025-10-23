import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award, Users } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { Skeleton } from "@/components/ui/skeleton";

const leagues = [
  { name: "Iniciante", color: "text-gray-400", icon: Award, minXP: 0 },
  { name: "Bronze", color: "text-orange-600", icon: Medal, minXP: 100 },
  { name: "Prata", color: "text-gray-300", icon: Medal, minXP: 500 },
  { name: "Ouro", color: "text-yellow-400", icon: Trophy, minXP: 1500 },
  { name: "Platina", color: "text-cyan-400", icon: Trophy, minXP: 3000 },
  { name: "Diamante", color: "text-blue-400", icon: Trophy, minXP: 5000 },
];

export default function Leagues() {
  const { progress, loading } = useProgress();
  const [position] = useState(Math.floor(Math.random() * 50) + 1); // Mock ranking

  const currentLeague = leagues.findIndex(
    (l) => progress?.xp && progress.xp >= l.minXP && (leagues[leagues.findIndex((x) => x === l) + 1]?.minXP ? progress.xp < leagues[leagues.findIndex((x) => x === l) + 1].minXP : true)
  );

  if (loading) {
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
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary text-glow">
          Sistema de Ligas
        </h1>
        <p className="text-muted-foreground">
          Compita com outros usuários e suba de nível!
        </p>
      </div>

      <div className="grid gap-4">
        {leagues.map((league, index) => {
          const Icon = league.icon;
          const isActive = index === currentLeague;
          const isCompleted = progress?.xp && progress.xp >= league.minXP;

          return (
            <Card
              key={league.name}
              className={`card-premium card-depth p-6 animate-slide-up card-interactive ${
                isActive ? "border-primary glow-primary-subtle" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full bg-card ${
                      isActive ? "glow-primary-subtle" : ""
                    }`}
                  >
                    <Icon className={`h-8 w-8 ${league.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{league.name}</h3>
                    {isActive && (
                      <p className="text-sm text-primary">Liga Atual</p>
                    )}
                    {!isActive && isCompleted && (
                      <p className="text-sm text-muted-foreground">
                        Completada
                      </p>
                    )}
                    {!isActive && !isCompleted && (
                      <p className="text-sm text-muted-foreground">
                        {league.minXP} XP necessário
                      </p>
                    )}
                  </div>
                </div>
                {isActive && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">#{position}</p>
                    <p className="text-sm text-muted-foreground">Posição</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
