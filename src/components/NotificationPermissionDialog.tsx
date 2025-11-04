import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Bell, Chrome, Info } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NotificationPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestPermission: () => void;
}

export function NotificationPermissionDialog({
  open,
  onOpenChange,
  onRequestPermission,
}: NotificationPermissionDialogProps) {
  const [userAgent, setUserAgent] = useState("");
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setUserAgent(ua);
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));
  }, []);

  const handleEnable = () => {
    onRequestPermission();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card text-card-foreground border-border"
>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl flex items-center gap-2 text-primary">
            <Bell className="h-6 w-6" />
            Ative as Notificações
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            As notificações estão bloqueadas. Ative-as para receber lembretes diários e não perder sua sequência!
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 my-4">
          {/* Benefícios */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Por que ativar?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Lembretes diários para não esquecer seu check-in</li>
              <li>✓ Alertas quando sua sequência estiver em risco</li>
              <li>✓ Notificações de conquistas desbloqueadas</li>
              <li>✓ Mensagens de motivação e apoio</li>
            </ul>
          </Card>

          {/* Instruções baseadas no dispositivo */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Como ativar:</h3>
            
            {isIOS ? (
              <Card className="p-4 space-y-2 bg-muted/50">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Chrome className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold">iPhone / iPad (Safari):</p>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Abra <strong>Ajustes</strong> no seu iPhone/iPad</li>
                      <li>Role até <strong>Safari</strong></li>
                      <li>Toque em <strong>Configurações para Sites</strong></li>
                      <li>Selecione <strong>Notificações</strong></li>
                      <li>Encontre <strong>apprespira.lovable.app</strong> e permita</li>
                      <li>Volte ao app e clique no botão abaixo</li>
                    </ol>
                    <p className="text-xs text-muted-foreground mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                      💡 <strong>Dica:</strong> Se não encontrar, pode ser necessário usar o Safari e adicionar à tela inicial primeiro.
                    </p>
                  </div>
                </div>
              </Card>
            ) : isAndroid ? (
              <Card className="p-4 space-y-2 bg-muted/50">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Chrome className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold">Android (Chrome):</p>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Toque nos <strong>três pontos</strong> (⋮) no canto superior direito</li>
                      <li>Vá em <strong>Configurações</strong></li>
                      <li>Selecione <strong>Configurações do site</strong></li>
                      <li>Toque em <strong>Notificações</strong></li>
                      <li>Encontre <strong>apprespira.lovable.app</strong></li>
                      <li>Altere para <strong>"Permitir"</strong></li>
                      <li>Volte ao app e clique no botão abaixo</li>
                    </ol>
                    <p className="text-xs text-muted-foreground mt-3 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                      💡 <strong>Dica:</strong> Em alguns Androids, as notificações aparecem automaticamente ao clicar no botão.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-4 space-y-2 bg-muted/50">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Chrome className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold">Desktop (Chrome/Edge/Firefox):</p>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Clique no <strong>ícone de cadeado</strong> 🔒 na barra de endereço</li>
                      <li>Procure por <strong>"Notificações"</strong></li>
                      <li>Altere para <strong>"Permitir"</strong></li>
                      <li>Recarregue a página</li>
                      <li>Clique no botão abaixo para ativar</li>
                    </ol>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Agora Não
          </Button>
          <Button
            onClick={handleEnable}
            className="glow-primary-subtle w-full sm:w-auto"
          >
            <Bell className="mr-2 h-4 w-4" />
            Tentar Ativar Agora
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
