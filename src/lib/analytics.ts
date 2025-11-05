import { supabase } from "@/integrations/supabase/client";

interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

class AnalyticsService {
  private eventQueue: AnalyticsEvent[] = [];
  private batchSize = 10;
  private batchInterval = 30000; // 30 seconds
  private timer: NodeJS.Timeout | null = null;
  private isOnline = true;

  constructor() {
    console.log('[ANALYTICS] Inicializando serviço de analytics');
    console.log('[ANALYTICS] Configurações:', { 
      batchSize: this.batchSize, 
      batchInterval: this.batchInterval 
    });
    
    // Monitor online/offline status
    if (typeof window !== "undefined") {
      console.log('[ANALYTICS] Configurando listeners de navegador');
      window.addEventListener("online", () => {
        console.log('[ANALYTICS] Navegador voltou online - fazendo flush dos eventos');
        this.isOnline = true;
        this.flush();
      });

      window.addEventListener("offline", () => {
        console.log('[ANALYTICS] Navegador ficou offline - pausando envio de eventos');
        this.isOnline = false;
      });

      // Start batch timer
      console.log('[ANALYTICS] Iniciando timer de batch');
      this.startBatchTimer();

      // Flush on page unload
      window.addEventListener("beforeunload", () => {
        console.log('[ANALYTICS] Página sendo descarregada - fazendo flush síncrono');
        this.flushSync();
      });

      // Flush on visibility change (when user leaves tab)
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          console.log('[ANALYTICS] Aba ficou oculta - fazendo flush síncrono');
          this.flushSync();
        }
      });
    } else {
      console.warn('[ANALYTICS] Window não disponível - listeners não configurados');
    }
  }

  /**
   * Track an analytics event
   */
  trackEvent(eventName: string, properties?: Record<string, any>) {
    console.log('[ANALYTICS] Rastreando evento:', { eventName, properties });
    
    const event: AnalyticsEvent = {
      event_name: eventName,
      properties: properties || {},
      timestamp: new Date().toISOString(),
    };

    this.eventQueue.push(event);
    console.log('[ANALYTICS] Evento adicionado à fila:', { 
      queueLength: this.eventQueue.length,
      batchSize: this.batchSize 
    });

    // Flush if batch size reached
    if (this.eventQueue.length >= this.batchSize) {
      console.log('[ANALYTICS] Tamanho do batch atingido - fazendo flush automático');
      this.flush();
    }
  }

  /**
   * Start the batch timer
   */
  private startBatchTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.batchInterval);
  }

  /**
   * Flush events asynchronously
   */
  private async flush() {
    if (this.eventQueue.length === 0 || !this.isOnline) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-event`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": session?.access_token 
              ? `Bearer ${session.access_token}` 
              : "",
          },
          body: JSON.stringify({ events: eventsToSend }),
        }
      );

      if (!response.ok) {
        console.error("Failed to send analytics events:", await response.text());
        // Re-queue events on failure
        this.eventQueue.unshift(...eventsToSend);
      }
    } catch (error) {
      console.error("Error sending analytics events:", error);
      // Re-queue events on error
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  /**
   * Flush events synchronously using sendBeacon for reliability
   */
  private flushSync() {
    if (this.eventQueue.length === 0 || !this.isOnline) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Use sendBeacon for reliable delivery during page unload
      if (navigator.sendBeacon) {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-event`;
        const blob = new Blob(
          [JSON.stringify({ events: eventsToSend })],
          { type: "application/json" }
        );
        
        navigator.sendBeacon(url, blob);
      } else {
        // Fallback to synchronous XHR
        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-event`,
          false // synchronous
        );
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ events: eventsToSend }));
      }
    } catch (error) {
      console.error("Error sending analytics events synchronously:", error);
    }
  }

  /**
   * Manually flush all pending events
   */
  public async flushAll() {
    await this.flush();
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

/**
 * Track an analytics event
 * @param eventName - Name of the event
 * @param properties - Optional event properties
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  analyticsService.trackEvent(eventName, properties);
}

/**
 * Manually flush all pending analytics events
 */
export async function flushAnalytics() {
  await analyticsService.flushAll();
}

// Export event names as constants for type safety
export const AnalyticsEvents = {
  CHECKIN_COMPLETED: "checkin_completed",
  ACHIEVEMENT_UNLOCKED: "achievement_unlocked",
  CONTENT_VIEWED: "content_viewed",
  STREAK_LOST: "streak_lost",
  SQUAD_JOINED: "squad_joined",
  PURCHASE_COMPLETED: "purchase_completed",
} as const;
