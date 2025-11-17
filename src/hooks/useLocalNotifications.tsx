import { useCallback } from 'react';
import despia from 'despia-native';
import { toast } from 'sonner';

export interface LocalNotificationOptions {
  title: string;
  message: string;
  delaySeconds?: number;
  url?: string;
}

/**
 * Hook for managing local push notifications using Despia SDK
 * Sends notifications through the device's native notification system
 */
export const useLocalNotifications = () => {
  /**
   * Check if Despia is available in the current environment
   */
  const isDespiaAvailable = useCallback(() => {
    try {
      return typeof despia === 'function';
    } catch {
      return false;
    }
  }, []);

  /**
   * Send a local push notification
   * @param options - Notification configuration
   */
  const sendLocalNotification = useCallback(async (options: LocalNotificationOptions) => {
    try {
      console.log('[DESPIA] Tentando enviar notificação:', options);
      
      if (!isDespiaAvailable()) {
        console.error('[DESPIA] SDK não disponível no ambiente atual');
        toast.error('Notificações locais não disponíveis neste ambiente. Use o app instalado.');
        return false;
      }

      const { title, message, delaySeconds = 0, url = '' } = options;
      
      // Encode special characters to prevent URL issues
      const encodedMessage = encodeURIComponent(message);
      const encodedTitle = encodeURIComponent(title);
      const encodedUrl = url ? encodeURIComponent(url) : '';
      
      const despiaUrl = `sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${encodedMessage}&!#${encodedTitle}&!#${encodedUrl}`;
      
      console.log('[DESPIA] Enviando com URL:', despiaUrl);
      
      // Use Despia SDK to send local push notification
      despia(despiaUrl);
      
      console.log('[DESPIA] Notificação enviada com sucesso');
      
      toast.success(
        delaySeconds > 0
          ? `Notificação agendada para ${delaySeconds} segundos`
          : 'Notificação enviada!'
      );
      
      return true;
    } catch (error) {
      console.error('[DESPIA] Erro ao enviar notificação local:', error);
      toast.error('Erro ao enviar notificação: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
      return false;
    }
  }, [isDespiaAvailable]);

  /**
   * Schedule a reminder notification
   */
  const scheduleReminder = useCallback((title: string, message: string, delaySeconds: number) => {
    return sendLocalNotification({ title, message, delaySeconds });
  }, [sendLocalNotification]);

  /**
   * Send instant notification
   */
  const sendInstantNotification = useCallback((title: string, message: string, url?: string) => {
    return sendLocalNotification({ title, message, delaySeconds: 0, url });
  }, [sendLocalNotification]);

  return {
    sendLocalNotification,
    scheduleReminder,
    sendInstantNotification,
    isDespiaAvailable: isDespiaAvailable(),
  };
};
