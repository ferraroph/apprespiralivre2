import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopItem } from "@/hooks/useShop";
import { useProgress } from "@/hooks/useProgress";
import { Coins, Gem, Clock } from "lucide-react";

interface ShopCardProps {
  item: ShopItem;
  onPurchase: (id: string) => void;
}

export function ShopCard({ item, onPurchase }: ShopCardProps) {
  const { progress } = useProgress();

  const canAfford =
    (progress?.respi_coins || 0) >= item.price_coins &&
    (progress?.gems || 0) >= item.price_gems;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-6 space-y-4">
        {/* Item Icon & Type */}
        <div className="flex items-start justify-between">
          <div className="text-5xl">{item.icon}</div>
          <Badge variant={item.type === "powerup" ? "default" : "secondary"}>
            {item.type === "powerup" ? "Power-up" : "Cosmético"}
          </Badge>
        </div>

        {/* Item Info */}
        <div>
          <h3 className="font-bold text-lg">{item.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {item.description}
          </p>
        </div>

        {/* Duration (if applicable) */}
        {item.duration_hours && item.duration_hours > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Duração: {item.duration_hours}h</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-4">
          {item.price_coins > 0 && (
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-yellow-400" />
              <span className="font-bold">{item.price_coins}</span>
            </div>
          )}
          {item.price_gems > 0 && (
            <div className="flex items-center gap-1">
              <Gem className="h-4 w-4 text-green-400" />
              <span className="font-bold">{item.price_gems}</span>
            </div>
          )}
        </div>

        {/* Purchase Button */}
        <Button
          className="w-full"
          onClick={() => onPurchase(item.id)}
          disabled={!canAfford}
        >
          {canAfford ? "Comprar" : "Insuficiente"}
        </Button>
      </div>
    </Card>
  );
}
