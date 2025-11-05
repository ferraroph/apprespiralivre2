import { Coins, Gem, Zap, Heart } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";

export function ResourcesHeader() {
  const { progress } = useProgress();

  const resources = [
    { 
      icon: Zap, 
      value: progress?.xp || 0, 
      label: "XP",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    { 
      icon: Coins, 
      value: progress?.respi_coins || 0, 
      label: "Coins",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    },
    { 
      icon: Gem, 
      value: progress?.gems || 0, 
      label: "Gemas",
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    { 
      icon: Heart, 
      value: progress?.health_crystals || 0, 
      label: "Cristais",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {resources.map((resource) => {
        const Icon = resource.icon;
        return (
          <div
            key={resource.label}
            className={cn(
              "flex items-center gap-2 p-3 rounded-xl border border-border/50",
              resource.bgColor,
              "backdrop-blur-sm transition-all duration-300 hover:scale-105"
            )}
          >
            <Icon className={cn("h-5 w-5", resource.color)} />
            <div>
              <p className="text-lg font-bold">{resource.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{resource.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
