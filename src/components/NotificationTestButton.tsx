import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Send } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function NotificationTestButton() {
  const [testing, setTesting] = useState(false);
  const { user } = useAuth();

  // Teste 1: Notificação local do browser (sempre funciona)
  const testLocalNotification = () => {
    if (!("Notification" in window)) {
      toast.error("Este browser não suporta notificações");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification("🔥 TESTE LOCAL - FUNCIONOU!", {
        body: "Esta é uma notificação local que sempre funciona!",
        icon: "/favicon.ico",
      });
      toast.success("Notificação local enviada!");
    } else if (Notification.permission === "denied") {
      toast.error("Notificações bloqueadas pelo browser");
    } else {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("🔥 TESTE LOCAL - FUNCIONOU!", {
            body: "Permissão concedida! Esta notificação funciona em qualquer lugar!",
            icon: "/favicon.ico",
          });
          toast.success("Permissão concedida e notificação enviada!");
        }
      });
    }
  };

  // Teste 2: Notificação via Edge Function (Firebase FCM)
  const testFirebaseNotification = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-notification", {
        body: {
          type: "custom",
          payload: {
            user_id: user.id,
            title: "🚀 TESTE FIREBASE FCM v1",
            body: "Se você recebeu esta notificação, o Firebase v1 API está funcionando perfeitamente!"
          }
        }
      });

      if (error) {
        console.error("Erro na Edge Function:", error);
        toast.error(`Erro: ${error.message}`);
      } else {
        toast.success("Notificação Firebase enviada!");
        console.log("Resposta da Edge Function:", data);
      }
    } catch (error) {
      console.error("Erro ao testar Firebase:", error);
      toast.error("Erro ao enviar notificação Firebase");
    } finally {
      setTesting(false);
    }
  };

  // Teste 3: Toast visual (sempre funciona)
  const testToastNotification = () => {
    toast("🎉 TESTE DE TOAST", {
      description: "Esta é uma notificação visual que sempre funciona em qualquer ambiente!",
      duration: 5000,
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Bell className="w-5 h-5" />
        🧪 TESTES DE NOTIFICAÇÃO
      </h3>
      
      <div className="grid gap-2">
        <Button 
          onClick={testLocalNotification} 
          variant="outline" 
          className="justify-start"
        >
          <Bell className="w-4 h-4 mr-2" />
          Teste 1: Notificação Local (Browser)
        </Button>
        
        <Button 
          onClick={testFirebaseNotification} 
          disabled={testing || !user}
          variant="outline" 
          className="justify-start"
        >
          <Send className="w-4 h-4 mr-2" />
          Teste 2: Firebase FCM v1 API {testing && "(Enviando...)"}
        </Button>
        
        <Button 
          onClick={testToastNotification} 
          variant="outline" 
          className="justify-start"
        >
          🍞 Teste 3: Toast Visual
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p><strong>Teste 1:</strong> Funciona em qualquer ambiente</p>
        <p><strong>Teste 2:</strong> Precisa estar logado + Firebase configurado</p>
        <p><strong>Teste 3:</strong> Toast visual sempre funciona</p>
      </div>
    </div>
  );
}