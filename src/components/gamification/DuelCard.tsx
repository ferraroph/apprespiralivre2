import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Duel {
  id: string;
  challenger_id: string;
  opponent_id: string;
  duel_type: string;
  bet_amount: number;
  status: string;
  start_date: string;
  end_date: string;
  challenger_score: number;
  opponent_score: number;
  winner_id?: string;
}

interface DuelCardProps {
  duel: Duel;
  onAccept?: (duelId: string) => void;
}

export function DuelCard({ duel, onAccept }: DuelCardProps) {
  const { user } = useAuth();
  const isChallenger = user?.id === duel.challenger_id;
  const isPending = duel.status === "pending";
  const canAccept = !isChallenger && isPending;

  const statusColors = {
    pending: "bg-yellow-500",
    active: "bg-green-500",
    completed: "bg-blue-500",
  };

  return (
    <Card className="p-4 card-premium card-depth hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          <Badge className={statusColors[duel.status as keyof typeof statusColors]}>
            {duel.status}
          </Badge>
        </div>
        <span className="text-lg font-bold text-yellow-500">
          {duel.bet_amount} 💰
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm">
            {isChallenger ? "Você" : "Desafiante"}
          </span>
          <span className="font-bold">{duel.challenger_score}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">
            {!isChallenger ? "Você" : "Oponente"}
          </span>
          <span className="font-bold">{duel.opponent_score}</span>
        </div>
      </div>

      {duel.status === "active" && (
        <div className="text-xs text-muted-foreground mb-3">
          Termina em: {new Date(duel.end_date).toLocaleDateString()}
        </div>
      )}

      {duel.winner_id && (
        <Badge variant="outline" className="w-full justify-center">
          {duel.winner_id === user?.id ? "🏆 Você Venceu!" : "Derrota"}
        </Badge>
      )}

      {canAccept && onAccept && (
        <Button
          onClick={() => onAccept(duel.id)}
          className="w-full"
          variant="default"
        >
          ⚔️ Aceitar Duelo
        </Button>
      )}
    </Card>
  );
}
