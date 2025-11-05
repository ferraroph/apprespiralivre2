import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";

export default function Missions() {
  const dailyMissions = [
    { id: 1, name: "Check-in Triplo", icon: "✅", current: 2, target: 3, xp: 100, coins: 50 },
    { id: 2, name: "Conversa com Coach", icon: "🤖", current: 0, target: 1, xp: 50, coins: 25 },
    { id: 3, name: "Ajuda no Squad", icon: "🤝", current: 0, target: 1, xp: 75, coins: 35 },
    { id: 4, name: "Derrotar Boss", icon: "⚔️", current: 0, target: 1, xp: 150, coins: 100 },
  ];

  const weeklyMissions = [
    { id: 5, name: "Streak de Ferro", icon: "🔥", current: 4, target: 7, xp: 500, coins: 300 },
    { id: 6, name: "Subir na Liga", icon: "📈", current: 0, target: 3, xp: 300, coins: 200 },
  ];

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">🎯 Missões</h1>
          <p className="text-muted-foreground">Complete missões para ganhar XP e recompensas</p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Missões Diárias</h2>
            <div className="grid gap-4">
              {dailyMissions.map((mission) => {
                const isCompleted = mission.current >= mission.target;
                const progress = (mission.current / mission.target) * 100;

                return (
                  <Card key={mission.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{mission.icon}</span>
                        <div>
                          <h3 className="font-semibold">{mission.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {mission.current}/{mission.target}
                          </p>
                        </div>
                      </div>
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <Progress value={progress} className="mb-3" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm">
                        <span className="text-blue-400">⚡ {mission.xp} XP</span>
                        <span className="text-yellow-400">💰 {mission.coins} Coins</span>
                      </div>
                      {isCompleted && (
                        <Button size="sm">Resgatar</Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Missões Semanais</h2>
            <div className="grid gap-4">
              {weeklyMissions.map((mission) => {
                const isCompleted = mission.current >= mission.target;
                const progress = (mission.current / mission.target) * 100;

                return (
                  <Card key={mission.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{mission.icon}</span>
                        <div>
                          <h3 className="font-semibold">{mission.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {mission.current}/{mission.target}
                          </p>
                        </div>
                      </div>
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <Progress value={progress} className="mb-3" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm">
                        <span className="text-blue-400">⚡ {mission.xp} XP</span>
                        <span className="text-yellow-400">💰 {mission.coins} Coins</span>
                      </div>
                      {isCompleted && (
                        <Button size="sm">Resgatar</Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
  );
}
