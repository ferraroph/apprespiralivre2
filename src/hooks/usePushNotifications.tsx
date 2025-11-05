import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// Web Push Subscription
interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function usePushNotifications() {
  console.log('[NOTIFICATIONS] Hook inicializado');
  
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('[NOTIFICATIONS] Estados iniciais:', { 
    hasUser: !!user, 
    permission, 
    hasPushSubscription: !!pushSubscription, 
    loading, 
    error 
  });

  // Check current notification permission
  useEffect(() => {
    console.log('[NOTIFICATIONS] Verificando permissão atual');
    if ("Notification" in window) {
      const currentPermission = Notification.permission;
      console.log('[NOTIFICATIONS] Permissão atual:', currentPermission);
      setPermission(currentPermission);
    } else {
      console.warn('[NOTIFICATIONS] Notificações não suportadas neste navegador');
    }
  }, []);

  // Request notification permission and subscribe to Web Push
  const requestPermission = async () => {
    console.log('[NOTIFICATIONS] Iniciando solicitação de permissão');
    
    if (!("Notification" in window)) {
      console.error('[NOTIFICATIONS] Notificações não suportadas no navegador');
      setError("Este navegador não suporta notificações");
      toast.error("Notificações não são suportadas neste navegador");
      return false;
    }

    if (!("serviceWorker" in navigator)) {
      console.error('[NOTIFICATIONS] Service Worker não suportado');
      setError("Service Worker não suportado");
      toast.error("Seu navegador não suporta notificações push");
      return false;
    }

    if (!user) {
      console.error('[NOTIFICATIONS] Usuário não autenticado');
      setError("Usuário precisa estar autenticado");
      toast.error("Você precisa estar autenticado");
      return false;
    }

    console.log('[NOTIFICATIONS] Todas as verificações passaram, iniciando processo');
    setLoading(true);
    setError(null);

    try {
      // Check if permission was previously denied
      if (Notification.permission === "denied") {
        console.warn('[NOTIFICATIONS] Permissão foi negada anteriormente');
        setError("Notificações bloqueadas");
        toast.error("Notificações foram bloqueadas. Habilite nas configurações do navegador.", {
          duration: 8000,
        });
        setLoading(false);
        return false;
      }

      // Request permission
      console.log('[NOTIFICATIONS] Solicitando permissão ao usuário');
      const permission = await Notification.requestPermission();
      console.log('[NOTIFICATIONS] Resposta da permissão:', permission);
      setPermission(permission);

      if (permission !== "granted") {
        console.warn('[NOTIFICATIONS] Permissão negada pelo usuário');
        setError("Permissão negada");
        toast.error("Permissão de notificação negada");
        setLoading(false);
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      await navigator.serviceWorker.ready;
      console.log('[Push] Service Worker registered:', registration);

      // Subscribe to push notifications with VAPID key
      const vapidKey = urlBase64ToUint8Array(
        'BHZqbAVO7OeAZpwo-IbUZFmW5JpfxIluJOH-s3eZKEGvd5t9hE3uMA5FyVW_NtfplM7al7hwoTCFfo4WikVBRj8'
      );
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey as BufferSource
      });

      console.log('[Push] Push subscription created:', subscription);
      setPushSubscription(subscription);

      // Register subscription with backend
      await registerSubscriptionWithBackend(subscription);

      toast.success("✅ Notificações ativadas! Funciona em iOS, Android, Windows e Mac!");
      setLoading(false);
      return true;

    } catch (err) {
      console.error('[Push] Error:', err);
      const errorMessage = err instanceof Error ? err.message : "Erro ao ativar notificações";
      setError(errorMessage);
      toast.error("Erro: " + errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Convert VAPID key from base64 to Uint8Array
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Register push subscription with backend
  const registerSubscriptionWithBackend = async (subscription: PushSubscription) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    const subscriptionJSON = subscription.toJSON() as PushSubscriptionJSON;
    const subscriptionString = JSON.stringify(subscriptionJSON);

    // Check if subscription already exists
    const { data: existingTokens, error: fetchError } = await supabase
      .from("user_tokens" as any)
      .select("id")
      .eq("push_subscription", subscriptionString)
      .eq("user_id", user.id);

    if (fetchError) {
      console.error("Error checking existing subscription:", fetchError);
      throw fetchError;
    }

    // If subscription doesn't exist, insert it
    if (!existingTokens || existingTokens.length === 0) {
      const { error: insertError } = await supabase
        .from("user_tokens" as any)
        .insert({
          user_id: user.id,
          push_subscription: subscriptionString,
          device_type: getDeviceType(),
        });

      if (insertError) {
        console.error("Error registering subscription:", insertError);
        throw insertError;
      }

      console.log('[Push] Subscription registered with backend');
    } else {
      // Update last_used_at for existing subscription
      const { error: updateError } = await supabase
        .from("user_tokens" as any)
        .update({ last_used_at: new Date().toISOString() })
        .eq("push_subscription", subscriptionString)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating subscription:", updateError);
      }

      console.log('[Push] Subscription updated');
    }
  };

  // Unregister push subscription
  const unregisterToken = async () => {
    if (!user || !pushSubscription) {
      return;
    }

    try {
      const subscriptionJSON = pushSubscription.toJSON() as PushSubscriptionJSON;
      const subscriptionString = JSON.stringify(subscriptionJSON);

      // Unsubscribe from push
      await pushSubscription.unsubscribe();

      // Delete from database
      const { error } = await supabase
        .from("user_tokens" as any)
        .delete()
        .eq("push_subscription", subscriptionString)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error unregistering subscription:", error);
        throw error;
      }

      setPushSubscription(null);
      toast.success("Notificações desativadas");

    } catch (err) {
      console.error("Error unregistering subscription:", err);
      toast.error("Erro ao desativar notificações");
    }
  };

  // Get device type
  const getDeviceType = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/android/.test(userAgent)) {
      return "android";
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      return "ios";
    } else if (/windows/.test(userAgent)) {
      return "windows";
    } else if (/mac/.test(userAgent)) {
      return "mac";
    } else if (/linux/.test(userAgent)) {
      return "linux";
    }
    
    return "unknown";
  };

  return {
    permission,
    pushSubscription,
    loading,
    error,
    requestPermission,
    unregisterToken,
    isSupported: "Notification" in window && "serviceWorker" in navigator,
  };
}
