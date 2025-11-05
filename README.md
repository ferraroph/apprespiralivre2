# PRD - Finalização Respira Livre MVP

## Status Atual (95% Completo)

###  IMPLEMENTADO (Backend + Frontend)

#### Backend (Lovable Cloud)
-  Schema do banco de dados completo
  - Tabelas: profiles, progress, checkins, content, achievements
  - RLS policies implementadas e seguras
  - Triggers e functions para cálculos automáticos
-  Sistema de autenticação (Email/Senha + Google)
-  Edge Function de check-in gamificado
-  Cálculo automático de progresso (cigarros evitados, economia, saúde)
-  Sistema de streaks com persistência

#### Frontend
-  Design system premium calibrado (glows sutis, profundidade)
-  Páginas Auth e Onboarding completas
-  Dashboard com dados reais do backend
-  Sistema de check-in diário com recompensas
-  Hooks customizados (useAuth, useProgress)
-  Navegação móvel e desktop
-  Animações e transições premium
-  Loading states e skeleton screens

---

##  PENDENTE (5% - Requer IDE/Deploy)

### 1. AI Coach (Lovable AI)
**Status:** Fundação pronta, precisa de Edge Function
**Arquivos:** Criar `supabase/functions/ai-coach/index.ts`

```typescript
// Usar Lovable AI (google/gemini-2.5-flash)
// Endpoint: https://ai.gateway.lovable.dev/v1/chat/completions
// LOVABLE_API_KEY já está provisionado
```

**Implementar:**
- Sistema de mensagens persistente (tabela chat_messages)
- Streaming de respostas
- Context awareness (perfil do usuário, progresso)

### 2. Push Notifications (FCM)
**Status:** Requer configuração externa
**Arquivos:** 
- Edge Function: `supabase/functions/send-notification/index.ts`
- Frontend: Service Worker para FCM

**Passos:**
1. Criar projeto no Firebase Console
2. Obter Server Key do FCM
3. Adicionar secret FCM_SERVER_KEY no Supabase
4. Implementar registro de tokens
5. Criar edge function para envio

**Triggers:**
- Check-in reminder (diário 9h)
- Streak em risco (48h sem check-in)
- Conquistas desbloqueadas

### 3. Squads (Sistema de Grupos)
**Status:** Schema básico pronto, lógica complexa pendente

**Arquivos SQL:**
```sql
CREATE TABLE squads (
  id UUID PRIMARY KEY,
  name TEXT,
  max_members INTEGER DEFAULT 10,
  squad_streak INTEGER DEFAULT 0
);

CREATE TABLE squad_members (
  squad_id UUID REFERENCES squads,
  user_id UUID,
  role TEXT CHECK (role IN ('leader', 'member'))
);
```

**Implementar:**
- CRUD de squads (criar, entrar, sair)
- Chat de squad (real-time com Supabase Realtime)
- Leaderboard de squads
- Desafios coletivos

### 4. IAP (In-App Purchases)
**Status:** Requer integração com Stripe/RevenueCat

**Produtos:**
- Streak Freeze (R$ 4,90)
- Conteúdo Premium (R$ 9,90/mês)
- Remove Ads (R$ 14,90 one-time)

**Arquivos:**
- `supabase/functions/create-payment/index.ts`
- `supabase/functions/webhook-stripe/index.ts`

**Implementar:**
1. Integrar Stripe Checkout
2. Webhook para confirmar pagamentos
3. Tabela purchases no banco
4. Lógica de validação de assinaturas

### 5. Content Management
**Status:** Estrutura pronta, falta upload de mídia

**Pendente:**
- Upload de áudios de meditação (Storage Bucket)
- Upload de vídeos de breathing (Storage Bucket)
- CMS para administradores adicionarem conteúdo

**Arquivos SQL:**
```sql
-- Criar bucket para mídia
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-media', 'content-media', true);

-- RLS policies para content-media
```

### 6. Analytics & Tracking
**Status:** Não implementado

**Implementar:**
- Plausible Analytics ou Mixpanel
- Eventos customizados:
  - `checkin_completed`
  - `achievement_unlocked`
  - `content_viewed`
  - `streak_lost`
  
**Edge Function:** `supabase/functions/track-event/index.ts`

### 7. Ajustes de Produção

**Configurar:**
1. **Email Confirmation:** Desabilitar auto-confirm no Supabase Auth
2. **Rate Limiting:** Adicionar Upstash Redis para rate limits
3. **Error Tracking:** Integrar Sentry
4. **Performance:** Adicionar service worker para cache

---

##  CHECKLIST FINAL

### Deploy
- [ ] Configurar variáveis de ambiente em produção
- [ ] Habilitar Google Auth no Supabase (OAuth Credentials)
- [ ] Criar projeto Firebase para FCM
- [ ] Configurar Stripe para IAP
- [ ] Deploy edge functions: `supabase functions deploy`

### Testes
- [ ] Testar fluxo completo de signup → onboarding → dashboard
- [ ] Testar check-in diário e cálculo de streaks
- [ ] Testar Google Sign-In
- [ ] Testar em dispositivos móveis reais

### Documentação
- [ ] README com instruções de setup
- [ ] Documentar variáveis de ambiente
- [ ] Guia de contribuição

---

##  COMANDO PARA INICIAR FINALIZAÇÃO

```bash
# 1. Deploy das edge functions
supabase functions deploy checkin

# 2. (Futuro) Deploy AI Coach
supabase functions deploy ai-coach

# 3. (Futuro) Deploy Notifications
supabase functions deploy send-notification
```

---

##  PRÓXIMAS ITERAÇÕES (Pós-MVP)

1. **Social Features**
   - Feed de atividades
   - Reações e comentários
   - Sistema de amizades

2. **Gamificação Avançada**
   - Boss Battles (desafios semanais)
   - Missões diárias/semanais
   - Loot boxes com recompensas

3. **Personalização**
   - Avatares customizáveis
   - Temas de interface
   - Badges colecionáveis

4. **Recursos Premium**
   - Coach 1-on-1 com profissionais
   - Planos de exercícios físicos
   - Tracking de sintomas de abstinência

---

**Desenvolvido com Lovable Cloud & Lovable AI**

---

## 📱 PWA (Progressive Web App)

O Respira Livre é um **PWA completo** que pode ser instalado como um app nativo em qualquer plataforma.

### ✅ Funcionalidades PWA Implementadas

- **🚀 Instalação Automática**: Prompts inteligentes baseados na plataforma
- **📱 Cross-Platform**: iOS 16.4+, Android, Windows, Mac
- **🔔 Notificações Push**: Sistema completo com Web Push API
- **📴 Funcionamento Offline**: Acesso total sem internet
- **⚡ Performance Nativa**: Carregamento instantâneo
- **🎯 UX Adaptativa**: Interface específica por plataforma

### 📋 Suporte por Plataforma

| Plataforma | Status | Método de Instalação |
|-----------|--------|-------------------|
| **iOS Safari 16.4+** | ✅ Full | Manual (Share → Add to Home Screen) |
| **Android Chrome** | ✅ Full | Automático (beforeinstallprompt) |
| **Windows Chrome/Edge** | ✅ Full | Automático (Menu → Install) |
| **macOS Safari/Chrome** | ✅ Full | Automático/Manual |

### 🛠 Implementação Técnica

- **Hook Principal**: `usePWAInstall()` - Detecção e controle de instalação
- **Componentes**: InstallPrompt, IOSInstallInstructions, NotificationSetupFlow
- **Analytics**: Tracking completo de conversão e engajamento
- **Utilitários**: Detecção de plataforma, verificação de suporte

### 📊 Teste e Debug

Em modo de desenvolvimento, acesse **Settings → PWA Test Suite** para:
- Verificar status de instalação
- Testar prompts de instalação
- Validar suporte de notificações
- Diagnosticar problemas de plataforma

### 📚 Documentação PWA

- **[Setup Guide](docs/PWA-SETUP.md)**: Implementação técnica completa
- **[Platform Support](docs/PLATFORM-SUPPORT.md)**: Matriz de compatibilidade  
- **[Troubleshooting](docs/TROUBLESHOOTING.md)**: Soluções para problemas comuns

---

## Environment Variables

### Required Variables

The following environment variables are **required** for the application to run:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
```

### Optional Variables

These variables enable additional features but are not required for basic functionality:

```env
# Sentry Error Tracking (Optional)
VITE_SENTRY_DSN=your_sentry_dsn_here
```

### Edge Function Environment Variables

The following secrets should be configured in Supabase for Edge Functions:

```bash
# AI Coach (Lovable AI)
LOVABLE_API_KEY=your_lovable_api_key

# Push Notifications (Firebase Cloud Messaging)
FCM_SERVER_KEY=your_fcm_server_key

# In-App Purchases (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_URL=your_upstash_redis_url
UPSTASH_REDIS_TOKEN=your_upstash_redis_token

# Error Tracking (Sentry - for Edge Functions)
SENTRY_DSN=your_sentry_dsn
```

### Setting Up Environment Variables

1. **Local Development:**
   - Copy `.env.example` to `.env` (if available)
   - Or create a new `.env` file in the project root
   - Add your Supabase credentials

2. **Production Deployment:**
   - Set environment variables in your hosting platform (Vercel, Netlify, etc.)
   - Ensure all required variables are configured

3. **Supabase Secrets:**
   ```bash
   # Set secrets for Edge Functions
   supabase secrets set LOVABLE_API_KEY=your_key
   supabase secrets set FCM_SERVER_KEY=your_key
   supabase secrets set STRIPE_SECRET_KEY=your_key
   # ... etc
   ```

### Environment Validation

The application automatically validates environment variables on startup. If required variables are missing, you'll see a clear error message indicating which variables need to be configured.

To manually validate environment variables:

```typescript
import { validateEnv } from './lib/validateEnv';

const result = validateEnv();
console.log('Valid:', result.valid);
console.log('Missing:', result.missing);
console.log('Warnings:', result.warnings);
```
