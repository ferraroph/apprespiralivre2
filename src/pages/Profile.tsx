import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Settings, LogOut, User as UserIcon, Crown, Zap, EyeOff, ShoppingBag, Bell, BellOff } from "lucide-react";
import { PurchaseDialog } from "@/components/PurchaseDialog";
import { usePremium } from "@/hooks/usePremium";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const achievements = [
  { title: "Primeiro Dia", unlocked: true },
  { title: "Uma Semana Forte", unlocked: true },
  { title: "Mestre do Streak", unlocked: false },
  { title: "Guardião da Saúde", unlocked: false },
];

export default function Profile() {
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const { isPremium, premiumUntil, streakFreezeCount, adsRemoved, loading } = usePremium();
  const { 
    permission, 
    loading: notificationLoading, 
    requestPermission, 
    unregisterToken,
    isSupported 
  } = usePushNotifications();

  const formatPremiumDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="card-premium p-8 text-center animate-slide-up">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 glow-primary mb-4">
          <UserIcon className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Usuário Demo</h1>
        <p className="text-muted-foreground mb-4">usuario@email.com</p>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-2xl font-bold text-primary">Nível 5</p>
            <p className="text-sm text-muted-foreground">Nível</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">23</p>
            <p className="text-sm text-muted-foreground">Dias Livre</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">4.532</p>
            <p className="text-sm text-muted-foreground">XP Total</p>
          </div>
        </div>
      </Card>

      {/* Premium Status Card */}
      <Card className="card-premium p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Status Premium
          </h2>
          <Button
            onClick={() => setPurchaseDialogOpen(true)}
            className="glow-primary-subtle"
            size="sm"
          >
            Melhorar
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-4">Carregando...</p>
        ) : (
          <div className="space-y-4">
            {/* Premium Subscription */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Crown className={`h-5 w-5 ${isPremium ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="font-semibold">Premium</p>
                  {isPremium && premiumUntil ? (
                    <p className="text-xs text-muted-foreground">
                      Ativo até {formatPremiumDate(premiumUntil)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Não ativo</p>
                  )}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isPremium
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {isPremium ? "Ativo" : "Inativo"}
              </div>
            </div>

            {/* Streak Freeze Count */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Congelamentos de Sequência</p>
                  <p className="text-xs text-muted-foreground">
                    Use para proteger sua sequência
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">
                {streakFreezeCount}
              </div>
            </div>

            {/* Ads Removed */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <EyeOff className={`h-5 w-5 ${adsRemoved ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="font-semibold">Anúncios Removidos</p>
                  <p className="text-xs text-muted-foreground">
                    Experiência sem interrupções
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                adsRemoved
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {adsRemoved ? "Ativo" : "Inativo"}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Notifications Card */}
      {isSupported && (
        <Card className="card-premium p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Bell className="h-6 w-6 text-primary" />
            Notificações Push
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {permission === "granted" ? (
                  <Bell className="h-5 w-5 text-primary" />
                ) : (
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-semibold">Notificações Push</p>
                  <p className="text-xs text-muted-foreground">
                    {permission === "granted" 
                      ? "Receba lembretes e atualizações importantes"
                      : "Ative para receber notificações"}
                  </p>
                </div>
              </div>
              <Button
                onClick={permission === "granted" ? unregisterToken : requestPermission}
                disabled={notificationLoading}
                variant={permission === "granted" ? "outline" : "default"}
                size="sm"
              >
                {notificationLoading ? "..." : permission === "granted" ? "Desativar" : "Ativar"}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Lembretes diários de check-in</p>
              <p>• Alertas quando sua sequência estiver em risco</p>
              <p>• Notificações de conquistas desbloqueadas</p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          Conquistas
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <Card
              key={achievement.title}
              className={`card-premium p-6 text-center animate-scale-in ${
                achievement.unlocked ? "glow-primary" : "opacity-50"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Award
                className={`h-12 w-12 mx-auto mb-3 ${
                  achievement.unlocked ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <p className="font-semibold">{achievement.title}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 border-primary/30 hover:bg-primary/10 hover:border-primary"
        >
          <Settings className="h-5 w-5" />
          Configurações
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start gap-3 border-destructive/30 hover:bg-destructive/10 hover:border-destructive text-destructive"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>

      <PurchaseDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
      />
    </div>
  );
}
