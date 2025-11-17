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
   * Send a local push notification
   * @param options - Notification configuration
   */
  const sendLocalNotification = useCallback(async (options: LocalNotificationOptions) => {
    try {
      const { title, message, delaySeconds = 0, url = '' } = options;
      
      // Use Despia SDK to send local push notification
      // Format: sendlocalpushmsg://push.send?s=${seconds}=msg!${message}&!#${title}&!#${url}
      despia(`sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${message}&!#${title}&!#${url}`);
      
      toast.success(
        delaySeconds > 0
          ? `Notificação agendada para ${delaySeconds} segundos`
          : 'Notificação enviada!'
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação local:', error);
      toast.error('Erro ao enviar notificação');
      return false;
    }
  }, []);

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
  };
};
