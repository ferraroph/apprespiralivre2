import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Boss } from "@/hooks/useBosses";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Swords, Heart } from "lucide-react";

interface BossBattleDialogProps {
  boss: Boss;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function BossBattleDialog({
  boss,
  open,
  onOpenChange,
  onComplete,
}: BossBattleDialogProps) {
  const { user } = useAuth();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [bossHealth, setBossHealth] = useState(boss.max_health);
  const [damageDealt, setDamageDealt] = useState(0);
  const [battling, setBattling] = useState(false);

  const phase = boss.phases[currentPhase];
  const healthPercentage = (bossHealth / boss.max_health) * 100;

  const handlePhaseAction = async () => {
    setBattling(true);

    // Simulate phase completion
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const damage = Math.floor(Math.random() * 50) + 50; // 50-100 damage
    const newHealth = Math.max(0, bossHealth - damage);
    setBossHealth(newHealth);
    setDamageDealt(damageDealt + damage);

    if (newHealth === 0) {
      // Boss defeated!
      await completeBattle(true);
      setBattling(false);
      return;
    }

    if (currentPhase < boss.phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
    } else {
      // All phases completed but boss not defeated
      setCurrentPhase(0);
    }

    setBattling(false);
  };

  const completeBattle = async (victory: boolean) => {
    if (!user) return;

    try {
      // Save boss encounter
      const { error: encounterError } = await supabase
        .from("boss_encounters")
        .insert({
          user_id: user.id,
          boss_id: boss.id,
          damage_dealt: damageDealt,
          completed: true,
          victory,
          rewards: victory
            ? { xp: 200, coins: 300, gems: 15, crystals: 2 }
            : { xp: 50, coins: 50 },
        });

      if (encounterError) throw encounterError;

      if (victory) {
        // Update user progress
        const { data: progress } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (progress) {
          await supabase
            .from("progress")
            .update({
              xp: (progress.xp || 0) + 200,
              respi_coins: (progress.respi_coins || 0) + 300,
              gems: (progress.gems || 0) + 15,
              health_crystals: (progress.health_crystals || 0) + 2,
            })
            .eq("user_id", user.id);
        }

        toast.success(
          "🎉 Boss derrotado! +200 XP, +300 Coins, +15 Gemas, +2 Cristais"
        );
      } else {
        toast.info("Batalha completada! Tente novamente amanhã.");
      }

      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error completing battle:", error);
      toast.error("Erro ao completar batalha");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Swords className="h-6 w-6 text-primary" />
            Batalha: {boss.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Boss Health */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="font-bold">
                  {bossHealth} / {boss.max_health} HP
                </span>
              </div>
              <span className="text-4xl">{boss.icon}</span>
            </div>
            <Progress value={healthPercentage} className="h-4" />
          </div>

          {/* Current Phase */}
          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-bold text-lg mb-2">
              Fase {currentPhase + 1}/{boss.phases.length}: {phase.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {phase.type === "quiz" && "Responda às perguntas corretamente"}
              {phase.type === "breathing" && "Complete o exercício de respiração"}
              {phase.type === "tap" && "Toque rapidamente para atacar!"}
            </p>

            {/* Action Button */}
            <Button
              className="w-full"
              onClick={handlePhaseAction}
              disabled={battling}
            >
              {battling ? "Atacando..." : "Atacar!"}
            </Button>
          </div>

          {/* Progress */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Dano Total</p>
              <p className="text-2xl font-bold text-primary">{damageDealt}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fase Atual</p>
              <p className="text-2xl font-bold">
                {currentPhase + 1}/{boss.phases.length}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
