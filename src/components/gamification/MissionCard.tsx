import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { UserMission } from "@/hooks/useMissions";
import { cn } from "@/lib/utils";

interface MissionCardProps {
  userMission: UserMission;
  onClaim: (id: string) => void;
}

export function MissionCard({ userMission, onClaim }: MissionCardProps) {
  const { mission, current_progress, completed, claimed } = userMission;
  const progress = (current_progress / mission.target_value) * 100;

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-300 hover:scale-[1.02]",
        completed && !claimed && "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
        claimed && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label={mission.name}>
            {mission.icon}
          </span>
          <div>
            <h3 className="font-semibold text-foreground">{mission.name}</h3>
            <p className="text-sm text-muted-foreground">
              {current_progress}/{mission.target_value}
            </p>
          </div>
        </div>
        {completed ? (
          <CheckCircle2 className={cn(
            "h-6 w-6",
            claimed ? "text-muted-foreground" : "text-primary animate-pulse"
          )} />
        ) : (
          <Circle className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      <Progress 
        value={progress} 
        className={cn(
          "mb-3 h-2",
          completed && !claimed && "bg-primary/20"
        )} 
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm font-medium">
          <span className="text-blue-400 flex items-center gap-1">
            ⚡ {mission.xp_reward} XP
          </span>
          <span className="text-yellow-400 flex items-center gap-1">
            💰 {mission.coins_reward} Coins
          </span>
          {mission.gems_reward && mission.gems_reward > 0 && (
            <span className="text-green-400 flex items-center gap-1">
              💎 {mission.gems_reward} Gems
            </span>
          )}
        </div>
        {completed && !claimed && (
          <Button 
            size="sm" 
            onClick={() => onClaim(userMission.id)}
            className="animate-pulse"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Resgatar
          </Button>
        )}
        {claimed && (
          <span className="text-xs text-muted-foreground">Resgatado ✓</span>
        )}
      </div>
    </Card>
  );
}
