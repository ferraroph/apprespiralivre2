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
    if (!("Notification" in window)) {
      setError("This browser does not support notifications");
      toast.error("Notificações não são suportadas neste navegador");
      return false;
    }

    if (!user) {
      setError("User must be authenticated");
      toast.error("Você precisa estar autenticado");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== "granted") {
        setError("Notification permission denied");
        toast.error("Permissão de notificação negada");
        setLoading(false);
        return false;
      }

      // Initialize Firebase and get FCM token
      const token = await initializeFirebaseAndGetToken();
      
      if (!token) {
        throw new Error("Failed to get FCM token");
      }

      setFcmToken(token);

      // Register token with backend
      await registerTokenWithBackend(token);

      toast.success("Notificações ativadas com sucesso!");
      setLoading(false);
      return true;

    } catch (err) {
      console.error("Error requesting notification permission:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to enable notifications";
      setError(errorMessage);
      toast.error("Erro ao ativar notificações");
      setLoading(false);
      return false;
    }
  };

  // Initialize Firebase and get FCM token
  const initializeFirebaseAndGetToken = async (): Promise<string | null> => {
    try {
      // Check if Firebase is loaded
      if (!window.firebase) {
        // Dynamically load Firebase scripts
        await loadFirebaseScripts();
      }

      // Firebase config for Respira Livre project
      const firebaseConfig: FirebaseConfig = {
        apiKey: "AIzaSyDKxT8vQnLZs6_jX4oP5tMfFyH3R1zYeQk", // You'll need to get this from Firebase Console
        authDomain: "respira-livre-app.firebaseapp.com",
        projectId: "respira-livre-app",
        storageBucket: "respira-livre-app.firebasestorage.app",
        messagingSenderId: "112970640777189995893",
        appId: "1:112970640777189995893:web:YOUR_APP_ID", // You'll need to get this from Firebase Console
      };

      // Initialize Firebase if not already initialized
      if (!window.firebase.apps?.length) {
        window.firebase.initializeApp(firebaseConfig);
      }

      // Get messaging instance
      const messaging = window.firebase.messaging();

      // Get FCM token with VAPID key
      const token = await messaging.getToken({
        vapidKey: "BBZECELz5cEi4RagXJH6p6L2Mpp0kGNzm5hYpvtXz7t_-rcJIGshxfirZ6GjuzMwP-p1YRHOvLmBUjC9ZClWDHo",
      });

      // Handle foreground messages
      messaging.onMessage((payload: any) => {
        console.log("Foreground message received:", payload);
        
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
      console.error("Error initializing Firebase:", err);
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
