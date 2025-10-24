import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// Firebase configuration type
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Declare Firebase types for compatibility
declare global {
  interface Window {
    firebase?: any;
  }
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check current notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission and register FCM token
  const requestPermission = async () => {
    console.log("[Push Notifications] Starting requestPermission");
    
    if (!("Notification" in window)) {
      console.error("[Push Notifications] Browser does not support notifications");
      setError("This browser does not support notifications");
      toast.error("Notificações não são suportadas neste navegador");
      return false;
    }

    if (!user) {
      console.error("[Push Notifications] User not authenticated");
      setError("User must be authenticated");
      toast.error("Você precisa estar autenticado");
      return false;
    }

    console.log("[Push Notifications] Current permission:", Notification.permission);
    setLoading(true);
    setError(null);

    try {
      // Request permission
      console.log("[Push Notifications] Requesting permission...");
      const permission = await Notification.requestPermission();
      console.log("[Push Notifications] Permission result:", permission);
      setPermission(permission);

      if (permission !== "granted") {
        console.warn("[Push Notifications] Permission denied by user");
        setError("Notification permission denied");
        toast.error("Permissão de notificação negada");
        setLoading(false);
        return false;
      }

      // Initialize Firebase and get FCM token
      console.log("[Push Notifications] Initializing Firebase...");
      const token = await initializeFirebaseAndGetToken();
      console.log("[Push Notifications] FCM token:", token ? "obtained" : "failed");
      
      if (!token) {
        throw new Error("Failed to get FCM token");
      }

      setFcmToken(token);

      // Register token with backend
      console.log("[Push Notifications] Registering token with backend...");
      await registerTokenWithBackend(token);
      console.log("[Push Notifications] Token registered successfully");

      toast.success("Notificações ativadas com sucesso!");
      setLoading(false);
      return true;

    } catch (err) {
      console.error("[Push Notifications] Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to enable notifications";
      setError(errorMessage);
      toast.error("Erro ao ativar notificações: " + errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Initialize Firebase and get FCM token
  const initializeFirebaseAndGetToken = async (): Promise<string | null> => {
    try {
      console.log("[Firebase] Starting initialization");
      
      // Register service worker first
      if ('serviceWorker' in navigator) {
        console.log("[Firebase] Registering service worker...");
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log("[Firebase] Service worker registered:", registration);
          
          // Wait for service worker to be ready
          await navigator.serviceWorker.ready;
          console.log("[Firebase] Service worker is ready");
        } catch (swError) {
          console.error("[Firebase] Service worker registration failed:", swError);
          throw new Error("Failed to register service worker: " + swError);
        }
      } else {
        console.warn("[Firebase] Service workers not supported");
      }
      
      // Check if Firebase is loaded
      if (!window.firebase) {
        console.log("[Firebase] Scripts not loaded, loading now...");
        await loadFirebaseScripts();
      }

      // Firebase config for Respira Livre project
      const firebaseConfig: FirebaseConfig = {
        apiKey: "AIzaSyACOI010Z8GPcFqpWbTdtmpzZH8fndrjRk",
        authDomain: "respira-livre-app.firebaseapp.com",
        projectId: "respira-livre-app",
        storageBucket: "respira-livre-app.firebasestorage.app",
        messagingSenderId: "286074518251",
        appId: "1:286074518251:web:a1da10d773c5dcc1045cae",
      };

      console.log("[Firebase] Config loaded");

      // Initialize Firebase if not already initialized
      if (!window.firebase.apps?.length) {
        console.log("[Firebase] Initializing app...");
        window.firebase.initializeApp(firebaseConfig);
      } else {
        console.log("[Firebase] App already initialized");
      }

      // Get messaging instance
      console.log("[Firebase] Getting messaging instance...");
      const messaging = window.firebase.messaging();

      // Get FCM token with VAPID key
      console.log("[Firebase] Requesting FCM token with VAPID key...");
      const token = await messaging.getToken({
        vapidKey: "BBZECELz5cEi4RagXJH6p6L2Mpp0kGNzm5hYpvtXz7t_-rcJIGshxfirZ6GjuzMwP-p1YRHOvLmBUjC9ZClWDHo",
      });

      console.log("[Firebase] FCM token obtained successfully");

      // Handle foreground messages
      messaging.onMessage((payload: any) => {
        console.log("[Firebase] Foreground message received:", payload);
        
        // Show toast notification
        const title = payload.notification?.title || "Respira Livre";
        const body = payload.notification?.body || "";
        
        toast(title, {
          description: body,
          duration: 5000,
        });
      });

      return token;

    } catch (err) {
      console.error("[Firebase] Error initializing:", err);
      return null;
    }
  };

  // Load Firebase scripts dynamically
  const loadFirebaseScripts = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Load Firebase App
      const appScript = document.createElement("script");
      appScript.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js";
      appScript.async = true;

      appScript.onload = () => {
        // Load Firebase Messaging
        const messagingScript = document.createElement("script");
        messagingScript.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js";
        messagingScript.async = true;

        messagingScript.onload = () => resolve();
        messagingScript.onerror = () => reject(new Error("Failed to load Firebase Messaging"));

        document.head.appendChild(messagingScript);
      };

      appScript.onerror = () => reject(new Error("Failed to load Firebase App"));
      document.head.appendChild(appScript);
    });
  };

  // Register FCM token with backend
  const registerTokenWithBackend = async (token: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if token already exists
    const { data: existingTokens, error: fetchError } = await supabase
      .from("user_tokens" as any)
      .select("id")
      .eq("fcm_token", token)
      .eq("user_id", user.id);

    if (fetchError) {
      console.error("Error checking existing token:", fetchError);
      throw fetchError;
    }

    // If token doesn't exist, insert it
    if (!existingTokens || existingTokens.length === 0) {
      const { error: insertError } = await supabase
        .from("user_tokens" as any)
        .insert({
          user_id: user.id,
          fcm_token: token,
          device_type: getDeviceType(),
        });

      if (insertError) {
        console.error("Error registering token:", insertError);
        throw insertError;
      }
    } else {
      // Update last_used_at for existing token
      const { error: updateError } = await supabase
        .from("user_tokens" as any)
        .update({ last_used_at: new Date().toISOString() })
        .eq("fcm_token", token)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating token:", updateError);
      }
    }
  };

  // Unregister FCM token
  const unregisterToken = async () => {
    if (!user || !fcmToken) {
      return;
    }

    try {
      const { error } = await supabase
        .from("user_tokens" as any)
        .delete()
        .eq("fcm_token", fcmToken)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error unregistering token:", error);
        throw error;
      }

      setFcmToken(null);
      toast.success("Notificações desativadas");

    } catch (err) {
      console.error("Error unregistering token:", err);
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
    fcmToken,
    loading,
    error,
    requestPermission,
    unregisterToken,
    isSupported: "Notification" in window,
  };
}
