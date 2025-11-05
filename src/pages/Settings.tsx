import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Moon, Sun, Globe, Download, Smartphone, Monitor, Check, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { NotificationPermissionDialog } from "@/components/NotificationPermissionDialog";
import { NotificationTestButton } from "@/components/NotificationTestButton";
import { NotificationSetupFlow } from "@/components/NotificationSetupFlow";
import { PWATestSuite } from "@/components/PWATestSuite";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  
  const { permission, requestPermission, unregisterToken, isSupported } = usePushNotifications();
  const { 
    isInstalled, 
    isInstallable, 
    platform, 
    showInstallPrompt, 
    canShowPrompt 
  } = usePWAInstall();
  
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [setupFlowOpen, setSetupFlowOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const notifications = permission === "granted";

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleNotificationToggle = async (checked: boolean) => {
    if (checked) {
      if (permission === "denied") {
        setNotificationDialogOpen(true);
        return;
      }
      try {
        await requestPermission();
      } catch (error) {
        console.error("Error requesting permission:", error);
      }
    } else {
      try {
        await unregisterToken();
      } catch (error) {
        console.error("Error unregistering token:", error);
      }
    }
  };

  const handleInstallApp = async () => {
    setIsInstalling(true);
    try {
      await showInstallPrompt();
    } catch (error) {
      console.error("Install error:", error);
    } finally {
      setIsInstalling(false);
    }
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'ios':
      case 'android':
        return <Smartphone className="h-5 w-5" />;
      case 'windows':
      case 'mac':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Download className="h-5 w-5" />;
    }
  };

  const getPlatformName = () => {
    switch (platform) {
      case 'ios':
        return 'iOS';
      case 'android':
        return 'Android';
      case 'windows':
        return 'Windows';
      case 'mac':
        return 'macOS';
      default:
        return 'Desktop';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-primary">Configurações</h1>
      </div>

      {/* PWA Installation Section */}
      <Card className="card-premium p-6 animate-slide-up">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          {getPlatformIcon()}
          Instalação do App
        </h2>
        
        <div className="space-y-4">
          {/* Installation Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              {isInstalled ? (
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <Check className="h-4 w-4" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Download className="h-4 w-4" />
                </div>
              )}
              <div>
                <p className="font-medium">
                  {isInstalled ? 'App Instalado' : 'Instalar App'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Plataforma: {getPlatformName()}
                </p>
              </div>
            </div>
            <Badge variant={isInstalled ? 'default' : 'secondary'}>
              {isInstalled ? 'Instalado' : 'Disponível'}
            </Badge>
          </div>

          {/* Installation Actions */}
          {!isInstalled && (
            <div className="space-y-3">
              {isInstallable && canShowPrompt ? (
                <Button 
                  onClick={handleInstallApp}
                  disabled={isInstalling}
                  className="w-full"
                >
                  {isInstalling ? 'Instalando...' : `Instalar no ${getPlatformName()}`}
                </Button>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {platform === 'ios' 
                      ? 'Para instalar no iOS, use Safari e toque em Compartilhar > Adicionar à Tela Inicial'
                      : 'Instalação automática não disponível. Procure pela opção "Instalar" no menu do navegador.'
                    }
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setSetupFlowOpen(true)}
                className="w-full"
              >
                Configuração Completa (App + Notificações)
              </Button>
            </div>
          )}

          {/* Benefits list */}
          <div className="grid gap-2 text-sm">
            <h4 className="font-medium">Benefícios da instalação:</h4>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Acesso offline completo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Notificações mais confiáveis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Performance otimizada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Ícone na tela inicial</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="card-premium p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notificações
        </h2>
        {isSupported ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notificações Push</Label>
                <p className="text-sm text-muted-foreground">
                  Receba lembretes e atualizações
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Notificações não são suportadas neste navegador
          </p>
        )}
      </Card>

      <NotificationPermissionDialog
        open={notificationDialogOpen}
        onOpenChange={setNotificationDialogOpen}
        onRequestPermission={requestPermission}
      />

      <Card className="card-premium p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sun className="h-5 w-5 text-primary" />
          Aparência
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode">Modo Escuro</Label>
              <p className="text-sm text-muted-foreground">
                Tema escuro para o aplicativo
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </div>
      </Card>

      {/* BOTÃO DE TESTE DE NOTIFICAÇÕES */}
      <Card className="card-premium p-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <NotificationTestButton />
      </Card>

      {/* PWA Test Suite - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
          <PWATestSuite />
        </div>
      )}

      <Card className="card-premium p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Sobre
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Respira Livre v1.0.0</p>
          <p>© 2024 Respira Livre. Todos os direitos reservados.</p>
        </div>
      </Card>

      {/* Setup Flow Dialog */}
      {setupFlowOpen && (
        <NotificationSetupFlow
          onComplete={() => setSetupFlowOpen(false)}
          onSkip={() => setSetupFlowOpen(false)}
        />
      )}
    </div>
  );
}
