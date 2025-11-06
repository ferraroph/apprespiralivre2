import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  coins_reward: number;
  gems_reward: number;
  rarity: string;
  unlocked_at?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
}

const rarityColors = {
  bronze: "bg-orange-600",
  silver: "bg-gray-300",
  gold: "bg-yellow-400",
  platinum: "bg-cyan-400",
  diamond: "bg-blue-400",
};

export function AchievementCard({ achievement }: AchievementCardProps) {
  const rarityColor = rarityColors[achievement.rarity as keyof typeof rarityColors] || "bg-gray-400";

  return (
    <Card className="p-4 card-premium card-depth hover:scale-105 transition-transform duration-300">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${rarityColor} glow-primary-subtle`}>
          <span className="text-2xl">{achievement.icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold">{achievement.title}</h3>
            <Badge variant="outline" className="text-xs">
              {achievement.rarity}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {achievement.description}
          </p>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-primary">+{achievement.xp_reward} XP</span>
            <span className="text-yellow-500">+{achievement.coins_reward} 💰</span>
            {achievement.gems_reward > 0 && (
              <span className="text-cyan-400">+{achievement.gems_reward} 💎</span>
            )}
          </div>
          {achievement.unlocked_at && (
            <p className="text-xs text-muted-foreground mt-2">
              Desbloqueado em {new Date(achievement.unlocked_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
