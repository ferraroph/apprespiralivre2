import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, Crown, EyeOff } from "lucide-react";

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Product {
  id: "streak_freeze" | "premium_monthly" | "remove_ads";
  name: string;
  price: string;
  description: string;
  benefits: string[];
  icon: React.ReactNode;
  highlight?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: "streak_freeze",
    name: "Congelamento de Sequência",
    price: "R$ 4,90",
    description: "Proteja sua sequência por 1 dia",
    benefits: [
      "Congele sua sequência por 1 dia",
      "Use quando precisar de uma pausa",
      "Mantenha seu progresso intacto",
    ],
    icon: <Zap className="h-6 w-6" />,
  },
  {
    id: "premium_monthly",
    name: "Premium Mensal",
    price: "R$ 9,90/mês",
    description: "Acesso a conteúdo premium por 30 dias",
    benefits: [
      "Acesso a meditações exclusivas",
      "Exercícios de respiração avançados",
      "Conteúdo premium ilimitado",
      "Suporte prioritário",
    ],
    icon: <Crown className="h-6 w-6" />,
    highlight: true,
  },
  {
    id: "remove_ads",
    name: "Remover Anúncios",
    price: "R$ 14,90",
    description: "Remova anúncios permanentemente",
    benefits: [
      "Experiência sem anúncios",
      "Compra única, benefício vitalício",
      "Navegação mais fluida",
    ],
    icon: <EyeOff className="h-6 w-6" />,
  },
];

export function PurchaseDialog({ open, onOpenChange }: PurchaseDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handlePurchase = async (productId: string) => {
    setIsLoading(productId);

    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { product_id: productId },
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Redirect to Stripe Checkout
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível processar o pagamento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto"
>
        <DialogHeader>
          <DialogTitle className="text-primary text-glow text-2xl">
            Melhorar Experiência
          </DialogTitle>
          <DialogDescription>
            Escolha um produto para aprimorar sua jornada
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className={`relative rounded-lg border p-6 space-y-4 transition-all hover:shadow-lg ${
                product.highlight
                  ? "border-primary bg-primary/5 shadow-primary/20"
                  : "border-border bg-card"
              }`}
            >
              {product.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                  Mais Popular
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  product.highlight ? "bg-primary/20 text-primary" : "bg-muted"
                }`}>
                  {product.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-2xl font-bold text-primary">{product.price}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>

              <ul className="space-y-2">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  product.highlight ? "glow-primary-subtle" : ""
                }`}
                onClick={() => handlePurchase(product.id)}
                disabled={isLoading !== null}
                variant={product.highlight ? "default" : "outline"}
              >
                {isLoading === product.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Comprar Agora"
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Pagamento seguro processado por Stripe. Você será redirecionado para completar a compra.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
