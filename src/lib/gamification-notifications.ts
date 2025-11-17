import despia from 'despia-native';

/**
 * Gamification notification utilities using Despia SDK
 * These functions send local push notifications for game events
 */

export const gamificationNotifications = {
  /**
   * Send notification when daily check-in is available
   */
  dailyCheckInReminder: () => {
    const title = "Check-in Diário Disponível";
    const message = "Não perca seu streak! Faça seu check-in agora.";
    const delaySeconds = 0;
    const url = "";
    
    despia(`sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${message}&!#${title}&!#${url}`);
  },

  /**
   * Send notification when a new achievement is unlocked
   */
  achievementUnlocked: (achievementName: string) => {
    const title = "🏆 Nova Conquista!";
    const message = `Você desbloqueou: ${achievementName}`;
    const delaySeconds = 0;
    const url = "";
    
    despia(`sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${message}&!#${title}&!#${url}`);
  },

  /**
   * Send notification when a new boss is available
   */
  bossAvailable: (bossName: string) => {
    const title = "⚔️ Boss Disponível!";
    const message = `${bossName} está disponível. Você tem coragem de enfrentá-lo?`;
    const delaySeconds = 0;
    const url = "";
    
    despia(`sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${message}&!#${title}&!#${url}`);
  },

  /**
   * Send notification when a chest is ready to open
   */
  chestReady: () => {
    const title = "📦 Baú Disponível!";
    const message = "Você ganhou um novo baú! Abra agora para resgatar suas recompensas.";
    const delaySeconds = 0;
    const url = "";
    
    despia(`sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${message}&!#${title}&!#${url}`);
  },

  /**
   * Send notification when a duel challenge is received
   */
  duelChallenge: (challengerName: string) => {
    const title = "⚡ Desafio Recebido!";
    const message = `${challengerName} desafiou você para um duelo. Aceite o desafio!`;
    const delaySeconds = 0;
    const url = "";
    
    despia(`sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${message}&!#${title}&!#${url}`);
  },

  /**
   * Send notification when streak is about to break
   */
  streakWarning: (hoursRemaining: number) => {
    const title = "⚠️ Seu Streak está em Risco!";
    const message = `Faltam ${hoursRemaining}h para perder seu streak. Faça seu check-in!`;
    const delaySeconds = 0;
    const url = "";
    
    despia(`sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${message}&!#${title}&!#${url}`);
  },

  /**
   * Send notification when mission is completed
   */
  missionCompleted: (missionName: string) => {
    const title = "✅ Missão Completa!";
    const message = `Você completou: ${missionName}. Resgate suas recompensas!`;
    const delaySeconds = 0;
    const url = "";
    
    despia(`sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${message}&!#${title}&!#${url}`);
  },

  /**
   * Schedule a reminder for later
   */
  scheduleReminder: (title: string, message: string, delaySeconds: number) => {
    const url = "";
    despia(`sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${message}&!#${title}&!#${url}`);
  },

  /**
   * Send notification when user levels up
   */
  levelUp: (newLevel: number) => {
    const title = "🎉 Level Up!";
    const message = `Parabéns! Você alcançou o nível ${newLevel}!`;
    const delaySeconds = 0;
    const url = "";
    
    despia(`sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${message}&!#${title}&!#${url}`);
  },

  /**
   * Send notification when league promotion occurs
   */
  leaguePromotion: (newLeague: string) => {
    const title = "📈 Promoção de Liga!";
    const message = `Você foi promovido para a liga ${newLeague}!`;
    const delaySeconds = 0;
    const url = "";
    
    despia(`sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${message}&!#${title}&!#${url}`);
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
    
    const title = "💪 Motivação Respira Livre";
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    const delaySeconds = 0;
    const url = "";
    
    despia(`sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${message}&!#${title}&!#${url}`);
  },
};
