import despia from 'despia-native';

/**
 * Check if Despia is available
 */
const isDespiaAvailable = () => {
  try {
    return typeof despia === 'function';
  } catch {
    return false;
  }
};

/**
 * Send notification with error handling
 */
const sendNotification = (title: string, message: string, delaySeconds: number = 0, url: string = '') => {
  try {
    if (!isDespiaAvailable()) {
      console.warn('[DESPIA] SDK não disponível, notificação ignorada:', { title, message });
      return false;
    }

    const encodedMessage = encodeURIComponent(message);
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = url ? encodeURIComponent(url) : '';
    
    const despiaUrl = `sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${encodedMessage}&!#${encodedTitle}&!#${encodedUrl}`;
    
    console.log('[GAMIFICATION] Enviando notificação:', { title, message, despiaUrl });
    
    despia(despiaUrl);
    return true;
  } catch (error) {
    console.error('[GAMIFICATION] Erro ao enviar notificação:', error);
    return false;
  }
};

/**
 * Gamification notification utilities using Despia SDK
 * These functions send local push notifications for game events
 */

export const gamificationNotifications = {
  /**
   * Send notification when daily check-in is available
   */
  dailyCheckInReminder: () => {
    sendNotification("Check-in Diário Disponível", "Não perca seu streak! Faça seu check-in agora.");
  },

  /**
   * Send notification when a new achievement is unlocked
   */
  achievementUnlocked: (achievementName: string) => {
    sendNotification("🏆 Nova Conquista!", `Você desbloqueou: ${achievementName}`);
  },

  /**
   * Send notification when a new boss is available
   */
  bossAvailable: (bossName: string) => {
    sendNotification("⚔️ Boss Disponível!", `${bossName} está disponível. Você tem coragem de enfrentá-lo?`);
  },

  /**
   * Send notification when a chest is ready to open
   */
  chestReady: () => {
    sendNotification("📦 Baú Disponível!", "Você ganhou um novo baú! Abra agora para resgatar suas recompensas.");
  },

  /**
   * Send notification when a duel challenge is received
   */
  duelChallenge: (challengerName: string) => {
    sendNotification("⚡ Desafio Recebido!", `${challengerName} desafiou você para um duelo. Aceite o desafio!`);
  },

  /**
   * Send notification when streak is about to break
   */
  streakWarning: (hoursRemaining: number) => {
    sendNotification("⚠️ Seu Streak está em Risco!", `Faltam ${hoursRemaining}h para perder seu streak. Faça seu check-in!`);
  },

  /**
   * Send notification when mission is completed
   */
  missionCompleted: (missionName: string) => {
    sendNotification("✅ Missão Completa!", `Você completou: ${missionName}. Resgate suas recompensas!`);
  },

  /**
   * Schedule a reminder for later
   */
  scheduleReminder: (title: string, message: string, delaySeconds: number) => {
    sendNotification(title, message, delaySeconds);
  },

  /**
   * Send notification when user levels up
   */
  levelUp: (newLevel: number) => {
    sendNotification("🎉 Level Up!", `Parabéns! Você alcançou o nível ${newLevel}!`);
  },

  /**
   * Send notification when league promotion occurs
   */
  leaguePromotion: (newLeague: string) => {
    sendNotification("📈 Promoção de Liga!", `Você foi promovido para a liga ${newLeague}!`);
  },

  /**
   * Send motivational notification
   */
  motivation: () => {
    const motivationalMessages = [
      "Você está indo muito bem! Continue firme.",
      "Cada dia sem cigarro é uma vitória!",
      "Sua saúde agradece sua decisão.",
      "Você é mais forte do que imagina!",
      "Continue sua jornada incrível!"
    ];
    
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    sendNotification("💪 Motivação Respira Livre", message);
  },
};
