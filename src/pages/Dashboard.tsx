import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Coins, TrendingUp, Heart, Cigarette, DollarSign, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { CheckinDialog } from "@/components/CheckinDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  console.log('[PAGE] Dashboard inicializado');
  
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, progress, loading: dataLoading } = useProgress();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  console.log('[PAGE] Dashboard estados:', { 
    hasUser: !!user, 
    authLoading, 
    dataLoading,
    hasProfile: !!profile,
    hasProgress: !!progress,
    checkinOpen
  });

  useEffect(() => {
    console.log('[PAGE] Dashboard verificando autenticação:', { authLoading, hasUser: !!user });
    if (!authLoading && !user) {
      console.log('[PAGE] Dashboard usuário não autenticado - redirecionando para /auth');
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const startDate = profile?.quit_date ? new Date(profile.quit_date) : new Date();
  console.log('[PAGE] Dashboard data de início:', startDate);

  useEffect(() => {
    console.log('[PAGE] Dashboard configurando timer de tempo decorrido');
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - startDate.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeElapsed({ days, hours, minutes, seconds });
    }, 1000);

    return () => {
      console.log('[PAGE] Dashboard limpando timer de tempo decorrido');
      clearInterval(interval);
    };
  }, [startDate]);

  if (authLoading || dataLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const canCheckin = progress?.last_checkin_date !== new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <CheckinDialog
        open={checkinOpen}
        onOpenChange={setCheckinOpen}
        onSuccess={() => window.location.reload()}
      />
      {/* Hero Counter */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 border border-primary/20 p-8 card-depth glow-primary-subtle">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-primary text-glow">
            Tempo Livre
          </h1>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Dias", value: timeElapsed.days },
              { label: "Horas", value: timeElapsed.hours },
              { label: "Min", value: timeElapsed.minutes },
              { label: "Seg", value: timeElapsed.seconds },
            ].map((item, index) => (
              <div
                key={item.label}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl md:text-6xl font-bold text-primary text-glow">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          {canCheckin && (
            <Button
              className="mt-6 w-full glow-primary-subtle"
              onClick={() => setCheckinOpen(true)}
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Fazer Check-in Diário
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="card-premium card-depth p-6 animate-slide-up card-interactive" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 glow-primary-subtle">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Streak Atual</p>
              <p className="text-2xl font-bold text-primary">{progress?.current_streak || 0} dias</p>
            </div>
          </div>
        </Card>

        <Card className="card-premium card-depth p-6 animate-slide-up card-interactive" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 glow-primary-subtle">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">RespiCoins</p>
              <p className="text-2xl font-bold text-primary">{progress?.respi_coins || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="card-premium card-depth p-6 animate-slide-up card-interactive" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 glow-primary-subtle">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">XP Total</p>
              <p className="text-2xl font-bold text-primary">{progress?.xp || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="card-premium card-depth p-6 animate-slide-up card-interactive" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 glow-primary-subtle">
              <Cigarette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cigarros Evitados</p>
              <p className="text-2xl font-bold text-primary">{progress?.cigarettes_avoided || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="card-premium card-depth p-6 animate-slide-up card-interactive" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 glow-primary-subtle">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Economia</p>
              <p className="text-2xl font-bold text-primary">
                R$ {(progress?.money_saved || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="card-premium card-depth p-6 animate-slide-up card-interactive" style={{ animationDelay: "0.6s" }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 glow-primary-subtle">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saúde</p>
              <p className="text-2xl font-bold text-primary">{progress?.health_score || 0}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Section */}
      <Card className="card-premium card-depth p-6 animate-slide-up" style={{ animationDelay: "0.7s" }}>
        <h2 className="text-xl font-bold mb-4 text-primary">Seu Progresso</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Nível Atual</span>
              <span className="text-primary font-bold">Nível {progress?.level || 1}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary glow-primary-subtle transition-all duration-500"
                style={{ width: `${((progress?.xp || 0) % 100)}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{(progress?.xp || 0) % 100} / 100 XP</span>
            <span>Liga: {progress?.league || "iniciante"}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
