import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function NotificationTestButton() {
  const [testing, setTesting] = useState(false);
  const { user } = useAuth();
  const { permission, requestPermission, fcmToken, loading: permissionLoading } = usePushNotifications();

  // Teste completo de notificação push real
  const testPushNotification = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    setTesting(true);
    try {
      // 1. Verificar se tem permissão
      if (permission !== "granted") {
        toast.info("Solicitando permissão para notificações...");
        const granted = await requestPermission();
        if (!granted) {
          toast.error("Permissão negada. Ative as notificações nas configurações do navegador.");
          setTesting(false);
          return;
        }
        // Aguardar um pouco para o token ser registrado
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // 2. Verificar se tem token FCM registrado
      const { data: tokens, error: tokenError } = await supabase
        .from("user_tokens" as any)
        .select("fcm_token")
        .eq("user_id", user.id);

      if (tokenError) {
        console.error("Erro ao verificar tokens:", tokenError);
        toast.error("Erro ao verificar tokens FCM");
        setTesting(false);
        return;
      }

      if (!tokens || tokens.length === 0) {
        toast.error("Nenhum token FCM registrado. Tente ativar as notificações nas configurações.");
        setTesting(false);
        return;
      }

      toast.info(`Token FCM encontrado! Enviando notificação push...`);

      // 3. Enviar notificação via Edge Function
      const { data, error } = await supabase.functions.invoke("send-notification", {
        body: {
          type: "custom",
          payload: {
            title: "🔥 Notificação Push REAL!",
            body: "Se você está vendo isso na barra de notificações do seu celular, o sistema está funcionando perfeitamente!",
            data: {
              type: "test",
              timestamp: new Date().toISOString()
            }
          }
        }
      });

      if (error) {
        console.error("Erro na Edge Function:", error);
        toast.error(`Erro ao enviar: ${error.message}`);
      } else {
        toast.success("✅ Notificação enviada! Verifique a barra de notificações do seu dispositivo.");
        console.log("Resposta da Edge Function:", data);
      }
    } catch (error) {
      console.error("Erro ao testar notificação:", error);
      toast.error("Erro ao enviar notificação");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-card">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Teste de Notificações Push
        </h3>
        <p className="text-sm text-muted-foreground">
          Este teste envia uma notificação REAL que aparece na barra de notificações do seu dispositivo.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Status da permissão:</span>
          <span className={`text-sm font-semibold ${
            permission === "granted" ? "text-green-600" : 
            permission === "denied" ? "text-red-600" : 
            "text-yellow-600"
          }`}>
            {permission === "granted" ? "✅ Concedida" : 
             permission === "denied" ? "❌ Negada" : 
             "⚠️ Não solicitada"}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Token FCM:</span>
          <span className={`text-sm font-semibold ${fcmToken ? "text-green-600" : "text-yellow-600"}`}>
            {fcmToken ? "✅ Registrado" : "⚠️ Não registrado"}
          </span>
        </div>
      </div>

      <Button 
        onClick={testPushNotification} 
        disabled={testing || permissionLoading || !user}
        className="w-full"
        size="lg"
      >
        <Bell className="w-4 h-4 mr-2" />
        {testing ? "Enviando..." : 
         permissionLoading ? "Configurando..." :
         "Testar Notificação Push Real"}
      </Button>

      <div className="space-y-2 text-xs text-muted-foreground">
        <p><strong>Como funciona:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Solicita permissão para notificações (se necessário)</li>
          <li>Registra token FCM no Firebase</li>
          <li>Envia notificação via Firebase Cloud Messaging</li>
          <li>Notificação aparece na barra de notificações do dispositivo</li>
          <li>Funciona mesmo com o app fechado</li>
        </ul>
      </div>
    </div>
  );
}
