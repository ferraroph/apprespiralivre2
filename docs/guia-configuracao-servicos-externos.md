# Guia de Configuração de Serviços Externos - Respira Livre

**IMPORTANTE**: Este guia está atualizado com as APIs mais recentes de cada serviço (Outubro 2024).

## 📋 Visão Geral

Você precisa configurar 4 serviços externos:

1. ✅ **Firebase** (Notificações Push) - JÁ CRIADO
2. **Stripe** (Pagamentos)
3. **Upstash Redis** (Cache e Rate Limiting)
4. **Sentry** (Monitoramento de Erros)

---

## 1. 🔥 Firebase Cloud Messaging (FCM)

### ✅ Status: Projeto Criado

Você já criou:
- Conta: **Phyrion**
- Projeto: **respira-livre-app**

### Próximos Passos

#### Passo 1.1: Ativar a API do Firebase Cloud Messaging

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione o projeto **respira-livre-app**
3. Clique no ícone de engrenagem ⚙️ → **Configurações do projeto**
4. Vá na aba **Cloud Messaging**

#### Passo 1.2: Obter as Credenciais

**IMPORTANTE**: O Firebase migrou da API Legacy para a API v1. Você precisa de:

1. **Service Account (Conta de Serviço)**:
   - No Console do Firebase, vá em **Configurações do projeto** → **Contas de serviço**
   - Clique em **Gerar nova chave privada**
   - Salve o arquivo JSON (ex: `firebase-service-account.json`)
   - **GUARDE ESTE ARQUIVO COM SEGURANÇA!**

2. **VAPID Key (para Web Push)**:
   - Ainda na aba **Cloud Messaging**
   - Role até **Certificados de push da Web**
   - Clique em **Gerar par de chaves**
   - Copie a chave pública (começa com `B...`)

#### Passo 1.3: Configurar no Projeto

O arquivo `firebase-service-account.json` contém todas as credenciais necessárias. Você vai precisar dele para gerar tokens OAuth2.

**Adicione ao Supabase**:
```bash
# Copie TODO o conteúdo do arquivo JSON
supabase secrets set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"respira-livre-app",...}'
```

**Adicione ao .env local**:
```env
VITE_FIREBASE_VAPID_KEY=SUA_CHAVE_VAPID_AQUI
```

---

## 2. 💳 Stripe (Pagamentos)

### Passo 2.1: Criar Conta Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Crie uma conta (use seu email)
3. Complete o cadastro básico
4. **Ative o modo de teste** (canto superior direito)

### Passo 2.2: Criar os Produtos

Você precisa criar 3 produtos. Vou te dar os comandos exatos:

#### Produto 1: Congelamento de Sequência (R$ 4,90)

1. No Dashboard do Stripe, vá em **Produtos** → **+ Adicionar produto**
2. Preencha:
   - **Nome**: Congelamento de Sequência
   - **Descrição**: Proteja sua sequência por 1 dia
   - **Modelo de preço**: Pagamento único
   - **Preço**: 4.90 BRL
3. Clique em **Salvar produto**
4. **COPIE O PRICE ID** (começa com `price_...`)

#### Produto 2: Premium Mensal (R$ 9,90/mês)

1. **+ Adicionar produto**
2. Preencha:
   - **Nome**: Premium Mensal
   - **Descrição**: Acesso a conteúdo premium
   - **Modelo de preço**: Recorrente
   - **Período de cobrança**: Mensal
   - **Preço**: 9.90 BRL
3. Clique em **Salvar produto**
4. **COPIE O PRICE ID**

#### Produto 3: Remover Anúncios (R$ 14,90)

1. **+ Adicionar produto**
2. Preencha:
   - **Nome**: Remover Anúncios
   - **Descrição**: Remova anúncios permanentemente
   - **Modelo de preço**: Pagamento único
   - **Preço**: 14.90 BRL
3. Clique em **Salvar produto**
4. **COPIE O PRICE ID**

### Passo 2.3: Obter as Chaves da API

1. No Dashboard, vá em **Desenvolvedores** → **Chaves de API**
2. Você verá:
   - **Chave publicável** (começa com `pk_test_...`)
   - **Chave secreta** (começa com `sk_test_...`) - clique em "Revelar chave de teste"
3. **COPIE AMBAS AS CHAVES**

### Passo 2.4: Configurar Webhook

1. Vá em **Desenvolvedores** → **Webhooks**
2. Clique em **+ Adicionar endpoint**
3. **URL do endpoint**: 
   ```
   https://SEU_PROJECT_REF.supabase.co/functions/v1/webhook-stripe
   ```
   (Substitua `SEU_PROJECT_REF` pelo ID do seu projeto Supabase)

4. **Selecione os eventos**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

5. Clique em **Adicionar endpoint**
6. **COPIE O SIGNING SECRET** (começa com `whsec_...`)

### Passo 2.5: Adicionar ao Projeto

**Adicione ao Supabase**:
```bash
supabase secrets set STRIPE_SECRET_KEY="sk_test_..."
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..."
supabase secrets set STRIPE_PRICE_STREAK_FREEZE="price_..."
supabase secrets set STRIPE_PRICE_PREMIUM="price_..."
supabase secrets set STRIPE_PRICE_REMOVE_ADS="price_..."
```

**Adicione ao .env local**:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 3. ⚡ Upstash Redis (Cache e Rate Limiting)

### Passo 3.1: Criar Conta Upstash

1. Acesse [Upstash Console](https://console.upstash.com/)
2. Faça login com GitHub ou Google (mais rápido)
3. Confirme seu email

### Passo 3.2: Criar Database Redis

1. Clique em **Create Database**
2. Preencha:
   - **Nome**: respira-livre-redis
   - **Tipo**: Regional (mais barato)
   - **Região**: Escolha a mais próxima do seu Supabase
     - Se seu Supabase está em São Paulo: escolha **South America (São Paulo)**
     - Se está nos EUA: escolha **US East (N. Virginia)**
   - **TLS**: Ativado ✅
3. Clique em **Create**

### Passo 3.3: Obter Credenciais

1. Clique no database que você acabou de criar
2. Role até a seção **REST API**
3. Você verá:
   - **UPSTASH_REDIS_REST_URL**: `https://...upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: Token longo
4. **COPIE AMBOS**

### Passo 3.4: Adicionar ao Projeto

**Adicione ao Supabase**:
```bash
supabase secrets set UPSTASH_REDIS_REST_URL="https://...upstash.io"
supabase secrets set UPSTASH_REDIS_REST_TOKEN="SEU_TOKEN_AQUI"
```

---

## 4. 🐛 Sentry (Monitoramento de Erros)

### Passo 4.1: Criar Conta Sentry

1. Acesse [Sentry.io](https://sentry.io/signup/)
2. Crie uma conta (gratuita)
3. Escolha **React** como plataforma

### Passo 4.2: Criar Projeto

1. Após o cadastro, você será direcionado para criar um projeto
2. Selecione **React**
3. Nome do projeto: **respira-livre**
4. Clique em **Create Project**

### Passo 4.3: Obter o DSN

1. Você verá o DSN imediatamente após criar o projeto
2. Ou vá em **Settings** → **Projects** → **respira-livre** → **Client Keys (DSN)**
3. **COPIE O DSN** (formato: `https://...@sentry.io/...`)

### Passo 4.4: Adicionar ao Projeto

**Adicione ao .env local**:
```env
VITE_SENTRY_DSN=https://...@sentry.io/...
```

**Adicione ao Supabase** (para Edge Functions):
```bash
supabase secrets set SENTRY_DSN="https://...@sentry.io/..."
```

---

## 5. 🚀 Deploy das Edge Functions

### Pré-requisitos

Certifique-se de ter:
- Supabase CLI instalado: `npm install -g supabase`
- Estar logado: `supabase login`
- Projeto linkado: `supabase link --project-ref SEU_PROJECT_REF`

### Passo 5.1: Verificar Secrets

Antes de fazer deploy, verifique se todos os secrets estão configurados:

```bash
supabase secrets list
```

Você deve ver:
- `FIREBASE_SERVICE_ACCOUNT`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STREAK_FREEZE`
- `STRIPE_PRICE_PREMIUM`
- `STRIPE_PRICE_REMOVE_ADS`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SENTRY_DSN`
- `OPENAI_API_KEY` (se você tiver)

### Passo 5.2: Deploy de Todas as Functions

Execute os comandos abaixo um por um:

```bash
# 1. AI Coach (requer OPENAI_API_KEY)
supabase functions deploy ai-coach

# 2. Send Notification (requer FIREBASE_SERVICE_ACCOUNT)
supabase functions deploy send-notification

# 3. Create Payment (requer STRIPE_SECRET_KEY)
supabase functions deploy create-payment

# 4. Webhook Stripe (requer STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET)
supabase functions deploy webhook-stripe

# 5. Track Event (analytics)
supabase functions deploy track-event

# 6. Check-in
supabase functions deploy checkin

# 7. Create Squad
supabase functions deploy create-squad

# 8. Join Squad
supabase functions deploy join-squad

# 9. Leave Squad
supabase functions deploy leave-squad
```

### Passo 5.3: Verificar Deploy

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá em **Edge Functions**
3. Verifique se todas as functions aparecem com status **Deployed** ✅

### Passo 5.4: Testar as Functions

#### Testar Notificações:
```bash
curl -X POST https://SEU_PROJECT_REF.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer SEU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type":"custom","payload":{"user_id":"test","title":"Teste","body":"Testando FCM"}}'
```

#### Testar Pagamento:
```bash
curl -X POST https://SEU_PROJECT_REF.supabase.co/functions/v1/create-payment \
  -H "Authorization: Bearer SEU_TOKEN_DE_USUARIO" \
  -H "Content-Type: application/json" \
  -d '{"product_id":"streak_freeze"}'
```

---

## 📝 Checklist Final

### Variáveis de Ambiente Locais (.env)

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Firebase
VITE_FIREBASE_VAPID_KEY=B...

# Sentry
VITE_SENTRY_DSN=https://...@sentry.io/...
```

### Secrets do Supabase (Produção)

```bash
# Firebase
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STREAK_FREEZE=price_...
STRIPE_PRICE_PREMIUM=price_...
STRIPE_PRICE_REMOVE_ADS=price_...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Sentry
SENTRY_DSN=https://...@sentry.io/...

# OpenAI (opcional, para AI Coach)
OPENAI_API_KEY=sk-...
```

---

## 🧪 Testando Tudo

### 1. Testar Firebase (Notificações)
- Abra o app
- Permita notificações
- Use a function `send-notification` para enviar uma notificação de teste

### 2. Testar Stripe (Pagamentos)
- Use o cartão de teste: `4242 4242 4242 4242`
- Qualquer data futura
- Qualquer CVV de 3 dígitos
- Tente comprar um produto no app
- Verifique no Dashboard do Stripe se o pagamento apareceu

### 3. Testar Upstash (Rate Limiting)
- Faça várias requisições rápidas para qualquer endpoint
- Deve retornar erro 429 após exceder o limite

### 4. Testar Sentry (Erros)
- Force um erro no app (ex: clique em um botão que causa erro)
- Verifique no Dashboard do Sentry se o erro apareceu

---

## ⚠️ Problemas Comuns

### Firebase

**Erro: "Invalid service account"**
- Verifique se você copiou TODO o conteúdo do arquivo JSON
- O JSON deve estar em uma única linha quando adicionar ao Supabase

**Erro: "Registration token not found"**
- O usuário não concedeu permissão para notificações
- Peça para o usuário permitir notificações no navegador

### Stripe

**Erro: "No such price"**
- Você está usando o Price ID correto? (começa com `price_...`)
- Não confunda com Product ID (começa com `prod_...`)

**Erro: "Webhook signature verification failed"**
- Verifique se o `STRIPE_WEBHOOK_SECRET` está correto
- Certifique-se de que está usando o secret do webhook correto (cada webhook tem seu próprio secret)

### Upstash

**Erro: "Connection refused"**
- Verifique se está usando a URL REST, não a URL Redis normal
- A URL deve começar com `https://`

**Erro: "Unauthorized"**
- Verifique se o token está correto
- Tokens não expiram, mas podem ser revogados

### Sentry

**Erro: "DSN not found"**
- Verifique o formato do DSN
- Deve ser: `https://[hash]@[org].ingest.sentry.io/[project-id]`

**Erros não aparecem no Sentry**
- Verifique se `VITE_SENTRY_DSN` está no `.env`
- Rebuilde o app: `npm run build`
- Certifique-se de que o Sentry está inicializado no código

---

## 🔒 Segurança

### ⚠️ NUNCA FAÇA ISSO:

- ❌ Commitar chaves de API no Git
- ❌ Compartilhar secrets em mensagens/emails
- ❌ Usar chaves de produção em desenvolvimento
- ❌ Expor secrets no código do frontend

### ✅ SEMPRE FAÇA ISSO:

- ✅ Use `.env` para desenvolvimento local
- ✅ Use Supabase Secrets para produção
- ✅ Ative 2FA em todas as contas
- ✅ Use modo de teste do Stripe até estar pronto para produção
- ✅ Rotacione chaves se forem expostas acidentalmente

---

## 🎯 Próximos Passos

Depois de configurar tudo:

1. ✅ Teste cada funcionalidade end-to-end
2. ✅ Monitore o Sentry por alguns dias
3. ✅ Verifique se os pagamentos estão funcionando
4. ✅ Teste notificações em diferentes dispositivos
5. ✅ Quando estiver pronto, mude o Stripe para modo de produção

---

## 📞 Suporte

Se tiver problemas:

1. **Firebase**: [Documentação FCM v1](https://firebase.google.com/docs/cloud-messaging/migrate-v1)
2. **Stripe**: [Documentação Checkout](https://stripe.com/docs/payments/checkout)
3. **Upstash**: [Documentação Redis](https://docs.upstash.com/redis)
4. **Sentry**: [Documentação React](https://docs.sentry.io/platforms/javascript/guides/react/)

---

**Última atualização**: Outubro 2024
**Versões das APIs**:
- Firebase Cloud Messaging: v1 (HTTP v1 API)
- Stripe: API 2023-10-16
- Upstash: REST API
- Sentry: SDK 10.x
