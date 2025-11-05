# Push Notifications Setup Guide - ATUALIZADO 2024/2025

**⚠️ IMPORTANTE**: Este guia foi completamente atualizado para Firebase Cloud Messaging API v1. A API Legacy (Server Key) foi descontinuada em julho de 2024.

## Overview

O sistema de notificações push usa Firebase Cloud Messaging (FCM) v1 API para entregar notificações aos usuários. Inclui:

- **Edge Function**: `send-notification` - Envia notificações via FCM v1 API
- **Service Worker**: `firebase-messaging-sw.js` - Gerencia notificações em background  
- **React Hook**: `usePushNotifications` - Gerencia registro de tokens FCM
- **Cron Jobs**: Notificações agendadas para lembretes diários e alertas de sequência

## Prerequisites - ATUALIZADOS 2024/2025

1. ✅ Firebase project com Cloud Messaging API v1 **ENABLED**
2. ❌ ~~FCM Server Key~~ **DESCONTINUADO** - Use Service Account JSON
3. ✅ VAPID Key (Web Push certificates)  
4. ✅ Service Account JSON do Firebase
5. ✅ Supabase project com pg_cron extension enabled

## Configuration Steps - FIREBASE v1 API (2024/2025)

### 1. Firebase Setup - NOVA API v1

1. Vá para [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: **respira-livre-app**
3. **CRÍTICO**: Verificar se Firebase Cloud Messaging API v1 está **ENABLED**:
   - Vá em Project Settings > Cloud Messaging  
   - Deve mostrar: "Firebase Cloud Messaging API (V1) ✅ Enabled"
   - Se mostrar Legacy API Disabled, está correto!

### 2. Baixar Service Account JSON (OBRIGATÓRIO)

**❌ NÃO EXISTE MAIS SERVER KEY! Use Service Account:**

1. No Firebase Console: **⚙️ Settings** > **Service Accounts**
2. Clique em **"Generate New Private Key"**  
3. Confirme clicando em **"Generate Key"**
4. **BAIXE o arquivo JSON** - GUARDE COM SEGURANÇA!

### 3. Copiar VAPID Key (Web Push)

1. No Firebase Console: Project Settings > **Cloud Messaging**
2. Na seção **"Web configuration"** > **"Web Push certificates"**
3. **COPIE a Key Pair** (começa com "B...")

### 4. Environment Variables - ATUALIZADAS 2024/2025

Adicione no seu arquivo `.env`:

```env
# Firebase Configuration - USE DADOS DO SEU PROJETO
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=respira-livre-app.firebaseapp.com  
VITE_FIREBASE_PROJECT_ID=respira-livre-app
VITE_FIREBASE_STORAGE_BUCKET=respira-livre-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=71444791873
VITE_FIREBASE_APP_ID=1:71444791873:web:...
VITE_FIREBASE_VAPID_KEY=BHZqbAV07OaZpwo-ibUZFmW5JrfxiIuJOH-e3eZKEGvd5f9hE3u...

# ❌ NÃO USE MAIS: FCM_SERVER_KEY (DESCONTINUADO)
# ✅ USE AGORA: Service Account JSON completo no Supabase
```

### 5. Configurar Service Account no Supabase (NOVO)

**Adicione o JSON COMPLETO como secret:**

```bash
# Cole TODO o conteúdo do arquivo service-account.json
supabase secrets set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"respira-livre-app","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@respira-livre-app.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-...%40respira-livre-app.iam.gserviceaccount.com"}'
```

### 6. Atualizar Service Worker

Edite `public/firebase-messaging-sw.js` com os dados REAIS do seu projeto:

```javascript
// USE OS DADOS REAIS DO SEU PROJETO respira-livre-app
const firebaseConfig = {
  apiKey: "AIzaSy...", // Seu API Key real
  authDomain: "respira-livre-app.firebaseapp.com",
  projectId: "respira-livre-app", 
  storageBucket: "respira-livre-app.appspot.com",
  messagingSenderId: "71444791873", // Seu Sender ID
  appId: "1:71444791873:web:..." // Seu App ID real
};
```

### 7. Deploy Edge Function - ATUALIZADA PARA v1 API

**IMPORTANTE**: A Edge Function já está atualizada para FCM v1 API.

```bash
# Deploy da função (já configurada para v1 API)
supabase functions deploy send-notification

# ❌ NÃO USE MAIS: FCM_SERVER_KEY
# ✅ JÁ CONFIGUROU: FIREBASE_SERVICE_ACCOUNT no passo 5
```

### 8. Verificar se Service Account está configurado

```bash
# Verificar se o secret foi adicionado corretamente
supabase secrets list

# Deve aparecer: FIREBASE_SERVICE_ACCOUNT
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

### Test Edge Function - FCM v1 API

```bash
# TESTE ATUALIZADO para Firebase v1 API
curl -X POST https://pyfgepdbxhbofrgainou.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer SEU_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "custom",
    "payload": {
      "user_id": "user-uuid",
      "title": "🔥 Teste FCM v1 API",
      "body": "Se você recebeu essa notificação, o Firebase v1 está funcionando!"
    }
  }'
```

**Novo payload para FCM v1 API** (a função já converte automaticamente):
- ✅ Endpoint: `https://fcm.googleapis.com/v1/projects/respira-livre-app/messages:send`
- ✅ Auth: `Bearer <OAuth2_access_token>` (gerado do Service Account)  
- ✅ Estrutura: `{"message": {"token": "...", "notification": {...}}}`

### Test Cron Jobs - Firebase v1 API

Teste manual dos cron jobs (já configurados para v1 API):

```sql
-- Teste daily reminder (FCM v1 API)
SELECT net.http_post(
  url := 'https://pyfgepdbxhbofrgainou.supabase.co/functions/v1/send-notification',
  headers := '{"Authorization": "Bearer SEU_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
  body := '{"type": "daily_reminder"}'::jsonb
);

-- Teste streak at risk (FCM v1 API)  
SELECT net.http_post(
  url := 'https://pyfgepdbxhbofrgainou.supabase.co/functions/v1/send-notification',
  headers := '{"Authorization": "Bearer SEU_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
  body := '{"type": "streak_at_risk"}'::jsonb
);
```

**✅ Vantagens da Firebase v1 API:**
- **Segurança**: Tokens OAuth2 expiram em 1 hora 
- **Performance**: Melhor entrega e relatórios
- **Suporte**: Novas funcionalidades só na v1

## Troubleshooting - FIREBASE v1 API (2024/2025)

### Notificações não recebidas

1. **Verificar permissão** do browser (Settings > Notifications)
2. **Verificar token FCM** na tabela `user_tokens` do Supabase  
3. **Logs da Edge Function**: `supabase functions logs send-notification`
4. **❌ NÃO PROCURAR**: FCM_SERVER_KEY (descontinuado)
5. **✅ VERIFICAR**: FIREBASE_SERVICE_ACCOUNT está configurado
6. **Firebase Console**: Project Settings > Cloud Messaging > v1 API enabled

### Erro: "Legacy API disabled"  

**✅ ISSO É NORMAL!** A Legacy API foi descontinuada. Se você vê:
- "Cloud Messaging API (Legacy) ❌ Disabled" = **CORRETO**
- "Firebase Cloud Messaging API (V1) ✅ Enabled" = **CORRETO**

### Erro: "Invalid credentials" ou "Unauthorized"

```bash
# 1. Verificar se Service Account foi adicionado
supabase secrets list | grep FIREBASE_SERVICE_ACCOUNT

# 2. Testar se o JSON está válido  
echo $FIREBASE_SERVICE_ACCOUNT | jq .

# 3. Verificar se tem as permissions corretas
# O Service Account precisa da role "Firebase Cloud Messaging API Admin"
```

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

