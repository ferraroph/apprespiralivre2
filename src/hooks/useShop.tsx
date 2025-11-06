import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ShopItem {
  id: string;
  name: string;
  description?: string;
  type: string;
  icon: string;
  price_coins: number;
  price_gems: number;
  duration_hours?: number;
  effect: any;
  is_active: boolean;
}

export function useShop() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from("shop_items")
          .select("*")
          .eq("is_active", true)
          .order("price_coins");

        if (error) throw error;
        setItems((data || []) as ShopItem[]);
      } catch (error) {
        console.error("Error fetching shop items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const purchaseItem = async (itemId: string) => {
    if (!user) return;

    try {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      // Get user progress
      const { data: progress } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!progress) {
        toast.error("Progresso do usuário não encontrado");
        return;
      }

      // Check if user has enough currency
      if (
        progress.respi_coins < item.price_coins ||
        progress.gems < item.price_gems
      ) {
        toast.error("Moedas ou gemas insuficientes");
        return;
      }

      // Deduct currency
      const { error: progressError } = await supabase
        .from("progress")
        .update({
          respi_coins: progress.respi_coins - item.price_coins,
          gems: progress.gems - item.price_gems,
        })
        .eq("user_id", user.id);

      if (progressError) throw progressError;

      // Add item to inventory
      const expiresAt = item.duration_hours
        ? new Date(Date.now() + item.duration_hours * 60 * 60 * 1000).toISOString()
        : null;

      const { error: inventoryError } = await supabase
        .from("user_inventory")
        .insert({
          user_id: user.id,
          item_id: itemId,
          quantity: 1,
          expires_at: expiresAt,
          active: item.type === "powerup",
        });

      if (inventoryError) throw inventoryError;

      toast.success(`✅ ${item.name} comprado com sucesso!`);
    } catch (error) {
      console.error("Error purchasing item:", error);
      toast.error("Erro ao comprar item");
    }
  };

  return { items, loading, purchaseItem };
}
