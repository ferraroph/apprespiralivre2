import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Target, Crown, Heart } from "lucide-react";

const archetypes = [
  {
    id: "guerreiro",
    name: "Guerreiro",
    description: "Enfrenta desafios de frente com determinação férrea",
    icon: Shield,
    color: "text-red-500",
    tags: ["Disciplinado", "Corajoso", "Persistente"],
  },
  {
    id: "estrategista",
    name: "Estrategista",
    description: "Planeja cada passo rumo à liberdade com sabedoria",
    icon: Target,
    color: "text-blue-500",
    tags: ["Analítico", "Paciente", "Calculista"],
  },
  {
    id: "inspirador",
    name: "Inspirador",
    description: "Motiva outros e encontra força na comunidade",
    icon: Crown,
    color: "text-yellow-500",
    tags: ["Carismático", "Empático", "Líder"],
  },
  {
    id: "resiliente",
    name: "Resiliente",
    description: "Supera recaídas e transforma fracassos em aprendizado",
    icon: Heart,
    color: "text-green-500",
    tags: ["Adaptável", "Forte", "Otimista"],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    archetype: "",
    cigarettesPerDay: "",
    pricePerPack: "",
  });

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: user.id,
        nickname: formData.nickname,
        archetype: formData.archetype,
        cigarettes_per_day: parseInt(formData.cigarettesPerDay),
        price_per_pack: parseFloat(formData.pricePerPack),
        quit_date: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      // Create progress
      const { error: progressError } = await supabase.from("progress").insert({
        user_id: user.id,
      });

      if (progressError) throw progressError;

      toast({
        title: "Perfil criado!",
        description: "Sua jornada começa agora.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl p-8 card-premium card-depth animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary text-glow mb-2">
            {step === 1 ? "Como quer ser chamado?" : step === 2 ? "Escolha seu Arquétipo" : "Reality Check"}
          </h1>
          <p className="text-muted-foreground">
            {step === 1
              ? "Seu apelido de guerreiro..."
              : step === 2
              ? "Qual é o seu estilo de batalha?"
              : "Vamos entender seu cenário atual"}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nickname">Seu apelido de guerreiro</Label>
              <Input
                id="nickname"
                placeholder="Ex: Lobo Solitário, Fênix..."
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({ ...formData, nickname: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
            <Button
              className="w-full glow-primary-subtle"
              onClick={() => setStep(2)}
              disabled={!formData.nickname || isLoading}
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {archetypes.map((archetype) => {
                const Icon = archetype.icon;
                const isSelected = formData.archetype === archetype.id;

                return (
                  <Card
                    key={archetype.id}
                    className={`p-6 cursor-pointer transition-all card-interactive card-depth ${
                      isSelected ? "border-primary glow-primary-subtle" : ""
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, archetype: archetype.id })
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full bg-card ${archetype.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{archetype.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {archetype.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {archetype.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Voltar
              </Button>
              <Button
                className="flex-1 glow-primary-subtle"
                onClick={() => setStep(3)}
                disabled={!formData.archetype || isLoading}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cigarettes">Quantos cigarros por dia?</Label>
                <Input
                  id="cigarettes"
                  type="number"
                  placeholder="Ex: 20"
                  value={formData.cigarettesPerDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cigarettesPerDay: e.target.value,
                    })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço do maço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 15.00"
                  value={formData.pricePerPack}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerPack: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(2)}
              >
                Voltar
              </Button>
              <Button
                className="flex-1 glow-primary-subtle"
                onClick={handleSubmit}
                disabled={
                  !formData.cigarettesPerDay ||
                  !formData.pricePerPack ||
                  isLoading
                }
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Começar Jornada"
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
