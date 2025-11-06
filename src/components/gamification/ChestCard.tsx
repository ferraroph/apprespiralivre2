import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserChest } from "@/hooks/useChests";
import { Sparkles, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChestCardProps {
  chest: UserChest;
  onOpen: (id: string) => void;
}

const rarityColors = {
  bronze: "from-amber-900/20 to-amber-700/20 border-amber-700",
  silver: "from-gray-400/20 to-gray-300/20 border-gray-400",
  gold: "from-yellow-500/20 to-yellow-400/20 border-yellow-500",
  diamond: "from-cyan-500/20 to-blue-500/20 border-cyan-400",
};

export function ChestCard({ chest, onOpen }: ChestCardProps) {
  const isOpened = chest.opened;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        "bg-gradient-to-br",
        rarityColors[chest.chest_type.rarity as keyof typeof rarityColors] ||
          rarityColors.bronze,
        !isOpened && "hover:scale-105 hover:shadow-lg cursor-pointer"
      )}
      onClick={() => !isOpened && onOpen(chest.id)}
    >
      <div className="p-6 text-center space-y-4">
        {/* Chest Icon */}
        <div className="text-6xl animate-pulse">{chest.chest_type.icon}</div>

        {/* Chest Name */}
        <div>
          <h3 className="font-bold text-lg">{chest.chest_type.name}</h3>
          <Badge variant="outline" className="mt-2">
            {chest.chest_type.rarity}
          </Badge>
        </div>

        {/* Status */}
        {isOpened ? (
          <div className="space-y-2">
            <Badge variant="secondary" className="w-full">
              ✅ Aberto
            </Badge>
            {chest.rewards && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>+{chest.rewards.xp} XP</p>
                <p>+{chest.rewards.coins} Coins</p>
                {chest.rewards.gems > 0 && <p>+{chest.rewards.gems} Gemas</p>}
              </div>
            )}
          </div>
        ) : (
          <Button className="w-full group" onClick={() => onOpen(chest.id)}>
            <Sparkles className="mr-2 h-4 w-4 group-hover:animate-spin" />
            Abrir Baú
          </Button>
        )}
      </div>

      {/* Locked overlay for opened chests */}
      {isOpened && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
    </Card>
  );
}
