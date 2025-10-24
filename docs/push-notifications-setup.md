# Push Notifications Setup Guide

This guide covers the setup and configuration of the Push Notifications system for Respira Livre.

## Overview

The push notifications system uses Firebase Cloud Messaging (FCM) to deliver notifications to users. It includes:

- **Edge Function**: `send-notification` - Handles sending notifications via FCM
- **Service Worker**: `firebase-messaging-sw.js` - Handles background notifications
- **React Hook**: `usePushNotifications` - Manages FCM token registration
- **Cron Jobs**: Scheduled notifications for daily reminders and streak alerts

## Prerequisites

1. Firebase project with Cloud Messaging enabled
2. FCM Server Key (from Firebase Console)
3. VAPID Key (from Firebase Console)
4. Supabase project with pg_cron extension enabled

## Configuration Steps

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Cloud Messaging:
   - Go to Project Settings > Cloud Messaging
   - Copy the Server Key
   - Generate Web Push certificates (VAPID key)

### 2. Environment Variables

Add the following to your `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key

# Supabase Secrets (add via Supabase CLI or Dashboard)
FCM_SERVER_KEY=your_fcm_server_key
```

### 3. Update Service Worker

Edit `public/firebase-messaging-sw.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Deploy Edge Function

Deploy the send-notification Edge Function:

```bash
supabase functions deploy send-notification
```

Add the FCM_SERVER_KEY secret:

```bash
supabase secrets set FCM_SERVER_KEY=your_fcm_server_key
```

### 5. Run Database Migrations

Apply the migrations to create the user_tokens table and set up cron jobs:

```bash
supabase db push
```

### 6. Configure Cron Jobs

The cron jobs require runtime configuration. Connect to your Supabase database and run:

```sql
-- Set Supabase URL
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';

-- Set Service Role Key
ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
```

Verify cron jobs are scheduled:

```sql
SELECT * FROM cron.job;
```

## Usage

### Request Notification Permission

Use the `usePushNotifications` hook in your components:

```typescript
import { usePushNotifications } from "@/hooks/usePushNotifications";

function MyComponent() {
  const { requestPermission, permission, loading } = usePushNotifications();

  const handleEnableNotifications = async () => {
    const success = await requestPermission();
    if (success) {
      console.log("Notifications enabled!");
    }
  };

  return (
    <button onClick={handleEnableNotifications} disabled={loading}>
      {permission === "granted" ? "Notifications Enabled" : "Enable Notifications"}
    </button>
  );
}
```

### Send Custom Notifications

Call the Edge Function directly:

```typescript
const { data, error } = await supabase.functions.invoke("send-notification", {
  body: {
    type: "custom",
    payload: {
      user_id: "user-uuid",
      title: "Custom Title",
      body: "Custom message",
      data: {
        type: "custom",
        custom_field: "value"
      }
    }
  }
});
```

### Send Achievement Notifications

```typescript
const { data, error } = await supabase.functions.invoke("send-notification", {
  body: {
    type: "achievement",
    payload: {
      user_id: "user-uuid"
    },
    achievement_id: "achievement-uuid"
  }
});
```

## Notification Types

### 1. Daily Reminder
- **Trigger**: Cron job at 9:00 AM daily
- **Target**: Users who haven't checked in today
- **Message**: "Hora do Check-in! 🌟"

### 2. Streak at Risk
- **Trigger**: Cron job every 6 hours
- **Target**: Users who haven't checked in for 48 hours
- **Message**: "⚠️ Sua sequência está em risco!"

### 3. Achievement Unlocked
- **Trigger**: Manual (when achievement is unlocked)
- **Target**: Specific user
- **Message**: "🏆 Conquista Desbloqueada!"

### 4. Custom
- **Trigger**: Manual
- **Target**: Specific user
- **Message**: Custom title and body

## Testing

### Test Notification Permission

1. Open the app in a browser
2. Click "Enable Notifications" button
3. Grant permission when prompted
4. Check browser console for FCM token

### Test Edge Function

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "custom",
    "payload": {
      "user_id": "user-uuid",
      "title": "Test Notification",
      "body": "This is a test"
    }
  }'
```

### Test Cron Jobs

Manually trigger the cron jobs:

```sql
-- Test daily reminder
SELECT net.http_post(
  url := 'https://your-project.supabase.co/functions/v1/send-notification',
  headers := '{"Authorization": "Bearer your-service-role-key", "Content-Type": "application/json"}'::jsonb,
  body := '{"type": "daily_reminder"}'::jsonb
);

-- Test streak at risk
SELECT net.http_post(
  url := 'https://your-project.supabase.co/functions/v1/send-notification',
  headers := '{"Authorization": "Bearer your-service-role-key", "Content-Type": "application/json"}'::jsonb,
  body := '{"type": "streak_at_risk"}'::jsonb
);
```

## Troubleshooting

### Notifications Not Received

1. Check notification permission in browser settings
2. Verify FCM token is registered in `user_tokens` table
3. Check Edge Function logs: `supabase functions logs send-notification`
4. Verify FCM_SERVER_KEY is set correctly
5. Check Firebase Console for delivery status

### Service Worker Not Registered

1. Check browser console for errors
2. Verify `firebase-messaging-sw.js` is in the `public` folder
3. Ensure HTTPS is enabled (required for service workers)
4. Clear browser cache and reload

### Cron Jobs Not Running

1. Verify pg_cron extension is enabled: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
2. Check cron job status: `SELECT * FROM cron.job;`
3. Verify runtime settings are configured
4. Check cron job logs: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`

### Token Cleanup

Expired or invalid tokens are automatically cleaned up when notifications fail to send. You can also manually clean up old tokens:

```sql
-- Delete tokens not used in 30 days
DELETE FROM user_tokens
WHERE last_used_at < NOW() - INTERVAL '30 days';
```

## Security Considerations

1. **FCM Server Key**: Keep this secret! Never expose it in client-side code
2. **Service Role Key**: Only use in Edge Functions and cron jobs
3. **RLS Policies**: Ensure users can only manage their own tokens
4. **Token Validation**: Invalid tokens are automatically removed

## Performance

- Notifications are sent asynchronously
- Failed deliveries are logged but don't block execution
- Token cleanup happens automatically during send operations
- Cron jobs run independently and don't affect app performance

## Next Steps

1. Customize notification messages and styling
2. Add more notification types (squad invites, content updates, etc.)
3. Implement notification preferences (allow users to opt-out of specific types)
4. Add analytics tracking for notification delivery and engagement
5. Implement notification history in the app

