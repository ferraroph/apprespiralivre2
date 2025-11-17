# Despia Local Push Notifications

## Overview

This app uses the **Despia SDK** to send native local push notifications directly to users' devices. These notifications work even when the app is closed and are scheduled through the device's native notification system.

## Installation

The Despia SDK is already installed in this project:

```bash
npm install despia-native
```

## Usage

### Basic Hook

Use the `useLocalNotifications` hook in any component:

```typescript
import { useLocalNotifications } from '@/hooks/useLocalNotifications';

function MyComponent() {
  const { sendLocalNotification, scheduleReminder, sendInstantNotification } = useLocalNotifications();

  // Send instant notification
  const handleNotify = () => {
    sendInstantNotification(
      'Título',
      'Mensagem da notificação',
      'https://optional-url.com'
    );
  };

  // Schedule a delayed notification
  const handleSchedule = () => {
    scheduleReminder('Lembrete', 'Esta notificação aparecerá em 60 segundos', 60);
  };

  return (
    <button onClick={handleNotify}>Enviar Notificação</button>
  );
}
```

### Gamification Notifications

Pre-built notification functions for game events:

```typescript
import { gamificationNotifications } from '@/lib/gamification-notifications';

// Daily check-in reminder
gamificationNotifications.dailyCheckInReminder();

// Achievement unlocked
gamificationNotifications.achievementUnlocked('Primeira Semana Livre');

// Boss available
gamificationNotifications.bossAvailable('Boss do Cigarro');

// Chest ready
gamificationNotifications.chestReady();

// Duel challenge
gamificationNotifications.duelChallenge('João Silva');

// Streak warning
gamificationNotifications.streakWarning(3);

// Mission completed
gamificationNotifications.missionCompleted('Completar 7 Check-ins');

// Level up
gamificationNotifications.levelUp(5);

// League promotion
gamificationNotifications.leaguePromotion('Ouro');

// Random motivation
gamificationNotifications.motivation();
```

### Direct Despia API

For more control, use the Despia API directly:

```typescript
import despia from 'despia-native';

const title = "Meu Título";
const message = "Minha mensagem";
const delaySeconds = 10; // Send after 10 seconds
const url = "https://myapp.com/page"; // Optional URL to open

despia(`sendlocalpushmsg://push.send?s=${delaySeconds}=msg!${message}&!#${title}&!#${url}`);
```

## API Format

The Despia notification URL follows this format:

```
sendlocalpushmsg://push.send?s=${seconds}=msg!${message}&!#${title}&!#${url}
```

**Parameters:**
- `s=${seconds}` - Delay in seconds before sending (0 = instant)
- `=msg!${message}` - The notification message body
- `&!#${title}` - The notification title
- `&!#${url}` - Optional URL to open when tapped (can be empty)

## Testing

Visit the **Settings page** (`/settings`) to test local notifications with a visual interface. You can customize:
- Title
- Message
- Delay (seconds)
- URL (optional)

## How It Works

1. **Bridge to Native**: Despia acts as a bridge between your React web app and native mobile notification systems
2. **Native Scheduling**: Notifications are scheduled through the device's OS (iOS or Android)
3. **Works Offline**: Notifications fire even when the app is closed or the device is offline
4. **No Server Required**: These are local notifications (not push notifications from a server)

## Integration Examples

### Daily Check-in Reminder
```typescript
// Schedule at 9 AM every day
const now = new Date();
const tomorrow9AM = new Date(now);
tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
tomorrow9AM.setHours(9, 0, 0, 0);

const secondsUntil9AM = Math.floor((tomorrow9AM.getTime() - now.getTime()) / 1000);

gamificationNotifications.scheduleReminder(
  "Check-in Diário",
  "Não esqueça seu check-in de hoje!",
  secondsUntil9AM
);
```

### Achievement Unlock
```typescript
// When user completes an achievement
const handleAchievement = async (achievementName: string) => {
  await claimAchievement();
  gamificationNotifications.achievementUnlocked(achievementName);
};
```

### Boss Battle Start
```typescript
// Notify when boss becomes available
useEffect(() => {
  if (newBossAvailable) {
    gamificationNotifications.bossAvailable(bossName);
  }
}, [newBossAvailable]);
```

## Remote Push Notifications

For server-sent notifications (marketing, real-time updates, backend triggers), use the **OneSignal integration** instead:
- [OneSignal Documentation](https://lovable.despia.com/default-guide/native-features/onesignal)

## Resources

- [NPM Package](https://www.npmjs.com/package/despia-native)
- [Despia Documentation](https://lovable.despia.com)
- [Local Push Guide](https://lovable.despia.com/default-guide/native-features/local-push)

## Troubleshooting

**Notifications not appearing?**
1. Check if the app is running on a real device (not just browser)
2. Ensure notification permissions are granted
3. Verify Despia SDK is properly installed
4. Test with the Settings page notification test interface

**Need Help?**
Contact Despia support: support@despia.com
