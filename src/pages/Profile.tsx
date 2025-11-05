import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Settings, LogOut, Crown, Zap, EyeOff, ShoppingBag, Bell, BellOff } from "lucide-react";
import { PurchaseDialog } from "@/components/PurchaseDialog";
import { NotificationPermissionDialog } from "@/components/NotificationPermissionDialog";
import { NotificationTestButton } from "@/components/NotificationTestButton";
import { AvatarUpload } from "@/components/AvatarUpload";
import { usePremium } from "@/hooks/usePremium";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { profile, progress, loading: progressLoading } = useProgress();
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const { isPremium, premiumUntil, streakFreezeCount, adsRemoved, loading } = usePremium();
  const { 
    permission, 
    loading: notificationLoading, 
    requestPermission, 
    unregisterToken,
    isSupported 
  } = usePushNotifications();

  // Fetch achievements from database
  useEffect(() => {
    if (!user) return;

    const fetchAchievements = async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) {
        console.error('Error fetching achievements:', error);
        return;
      }

      setAchievements(data || []);
    };

    fetchAchievements();
  }, [user]);

  // Set avatar URL from profile
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleNotificationRequest = async () => {
    if (permission === "denied") {
      setNotificationDialogOpen(true);
      return;
    }
    
    try {
      await requestPermission();
    } catch (error) {
      console.error("Error requesting permission:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Desconectado",
        description: "Você saiu da sua conta com sucesso",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível sair da conta",
        variant: "destructive",
      });
    }
  };

  const formatPremiumDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (progressLoading || !user || !profile) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="card-premium p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-24 h-24 rounded-full bg-muted mx-auto" />
            <div className="h-6 w-48 bg-muted rounded mx-auto" />
            <div className="h-4 w-64 bg-muted rounded mx-auto" />
          </div>
        </Card>
      </div>
    );
  }

  const displayName = profile.nickname || user.email?.split('@')[0] || 'Usuário';
  const displayEmail = user.email || '';

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="card-premium p-8 text-center animate-slide-up">
        <div className="flex justify-center mb-4">
          <AvatarUpload
            userId={user.id}
            currentAvatarUrl={avatarUrl}
            userName={displayName}
            onAvatarUpdate={setAvatarUrl}
          />
        </div>
        <h1 className="text-2xl font-bold mb-2">{displayName}</h1>
        <p className="text-muted-foreground mb-4">{displayEmail}</p>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-2xl font-bold text-primary">Nível {progress?.level || 1}</p>
            <p className="text-sm text-muted-foreground">Nível</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{progress?.current_streak || 0}</p>
            <p className="text-sm text-muted-foreground">Dias Livre</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{progress?.xp?.toLocaleString('pt-BR') || 0}</p>
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
                onClick={permission === "granted" ? unregisterToken : handleNotificationRequest}
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

            {/* Botão de Teste de Notificações */}
            <div className="mt-4 pt-4 border-t">
              <NotificationTestButton />
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          Conquistas
        </h2>
        
        {achievements.length === 0 ? (
          <Card className="card-premium p-6 text-center">
            <p className="text-muted-foreground">Nenhuma conquista desbloqueada ainda</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <Card
                key={achievement.id}
                className="card-premium p-6 text-center animate-scale-in glow-primary"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Award className="h-12 w-12 mx-auto mb-3 text-primary" />
                <p className="font-semibold">{achievement.title}</p>
                {achievement.description && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {achievement.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 border-primary/30 hover:bg-primary/10 hover:border-primary"
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-5 w-5" />
          Configurações
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start gap-3 border-destructive/30 hover:bg-destructive/10 hover:border-destructive text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>

      <PurchaseDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
      />

      <NotificationPermissionDialog
        open={notificationDialogOpen}
        onOpenChange={setNotificationDialogOpen}
        onRequestPermission={requestPermission}
      />
    </div>
  );
}
