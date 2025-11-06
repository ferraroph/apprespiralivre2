import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sword, Heart, Trophy } from "lucide-react";
import { Boss } from "@/hooks/useBosses";
import { useProgress } from "@/hooks/useProgress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BossBattleCardProps {
  boss: Boss;
  canFight: boolean;
  onBattleStart: () => void;
}

export function BossBattleCard({ boss, canFight, onBattleStart }: BossBattleCardProps) {
  const { progress } = useProgress();
  const healthCrystals = progress?.health_crystals || 0;
  const requiredCrystals = 2;

  const handleBattle = async () => {
    if (healthCrystals < requiredCrystals) {
      toast.error(`Você precisa de ${requiredCrystals} Cristais de Saúde para desafiar este boss!`);
      return;
    }
    
    // Deduct health crystals
    if (progress) {
      const { error } = await supabase
        .from("progress")
        .update({
          health_crystals: healthCrystals - requiredCrystals,
        })
        .eq("user_id", progress.user_id);
        
      if (error) {
        console.error("Error deducting crystals:", error);
        toast.error("Erro ao usar cristais");
        return;
      }
    }
    
    onBattleStart();
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-6xl" role="img" aria-label={boss.name}>
            {boss.icon}
          </span>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{boss.name}</h2>
            <p className="text-sm text-muted-foreground">{boss.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium">
                150 XP + 100 Coins + 1 Gema
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-foreground">
            {boss.max_health} HP
          </div>
          <div className="text-xs text-muted-foreground">Vida do Boss</div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Boss Health</span>
            <span className="font-medium">{boss.max_health}/{boss.max_health}</span>
          </div>
          <Progress value={100} className="h-3 bg-red-900" />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2 text-foreground">Fases do Combate:</h3>
        <div className="grid gap-2">
          {boss.phases.map((phase, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 text-xs bg-background/50 rounded-lg p-2"
            >
              <span className="font-bold text-primary">{index + 1}.</span>
              <span className="text-foreground">{phase.name}</span>
              <span className="ml-auto text-muted-foreground">{phase.duration}s</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-purple-400" />
          <span className="text-sm">
            <span className="font-bold">{healthCrystals}</span> Cristais disponíveis
          </span>
        </div>
        <Button
          onClick={handleBattle}
          disabled={!canFight || healthCrystals < requiredCrystals}
          size="lg"
          className="font-bold"
        >
          <Sword className="h-5 w-5 mr-2" />
          {!canFight ? "Boss Derrotado Hoje" : `Desafiar (${requiredCrystals} ❤️)`}
        </Button>
      </div>
    </Card>
  );
}
