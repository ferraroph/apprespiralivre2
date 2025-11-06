import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

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
  created_at: string;
}

export function useDuels() {
  const { user } = useAuth();
  const [duels, setDuels] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDuels = async () => {
      try {
        const { data, error } = await supabase
          .from("duels")
          .select("*")
          .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDuels(data as unknown as Duel[]);
      } catch (error) {
        console.error("Error fetching duels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDuels();

    const channel = supabase
      .channel("duels-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "duels",
        },
        () => fetchDuels()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createDuel = async (opponentId: string, betAmount: number, duelType: string) => {
    if (!user) return;

    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const { error } = await supabase.from("duels").insert({
        challenger_id: user.id,
        opponent_id: opponentId,
        bet_amount: betAmount,
        duel_type: duelType,
        status: "pending",
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
      });

      if (error) throw error;

      toast({
        title: "⚔️ Duelo Criado!",
        description: "Aguardando aceitação do oponente.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const acceptDuel = async (duelId: string) => {
    try {
      const { error } = await supabase
        .from("duels")
        .update({ status: "active" })
        .eq("id", duelId);

      if (error) throw error;

      toast({
        title: "⚔️ Duelo Aceito!",
        description: "Que a batalha comece!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return { duels, loading, createDuel, acceptDuel };
}
