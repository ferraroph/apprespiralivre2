# ⚡ Comandos Rápidos - Cheat Sheet

## 🔍 Verificação

```powershell
# Ver o que está faltando
.\scripts\verify-setup.ps1

# Listar secrets configurados
supabase secrets list

# Ver status do projeto
supabase status
```

## 🔐 Configuração de Secrets

```powershell
# Script interativo (RECOMENDADO)
.\scripts\setup-secrets.ps1

# Ou manualmente, um por um:
supabase secrets set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
supabase secrets set STRIPE_SECRET_KEY="sk_test_..."
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..."
supabase secrets set STRIPE_PRICE_STREAK_FREEZE="price_..."
supabase secrets set STRIPE_PRICE_PREMIUM="price_..."
supabase secrets set STRIPE_PRICE_REMOVE_ADS="price_..."
supabase secrets set UPSTASH_REDIS_REST_URL="https://..."
supabase secrets set UPSTASH_REDIS_REST_TOKEN="..."
supabase secrets set SENTRY_DSN="https://...@sentry.io/..."
supabase secrets set OPENAI_API_KEY="sk-..."
```

## 🚀 Deploy

```powershell
# Deploy de todas as functions (RECOMENDADO)
.\scripts\deploy-all-functions.ps1

# Ou uma por uma:
supabase functions deploy ai-coach
supabase functions deploy send-notification
supabase functions deploy create-payment
supabase functions deploy webhook-stripe
supabase functions deploy track-event
supabase functions deploy checkin
supabase functions deploy create-squad
supabase functions deploy join-squad
supabase functions deploy leave-squad
```

## 🧪 Testes

```powershell
# Testar functions automaticamente
.\scripts\test-functions.ps1

# Ver logs de uma function específica
supabase functions logs send-notification

# Ver logs em tempo real
supabase functions logs send-notification --follow
```

## 🔗 Links Úteis

```powershell
# Abrir Dashboard do Supabase
start https://supabase.com/dashboard

# Abrir Console do Firebase
start https://console.firebase.google.com/

# Abrir Dashboard do Stripe
start https://dashboard.stripe.com/

# Abrir Console do Upstash
start https://console.upstash.com/

# Abrir Dashboard do Sentry
start https://sentry.io/
```

## 🔧 Supabase CLI

```powershell
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref SEU_PROJECT_REF

# Ver projetos
supabase projects list

# Ver functions deployadas
supabase functions list

# Deletar um secret
supabase secrets unset NOME_DO_SECRET
```

## 📝 Variáveis de Ambiente (.env)

```env
# Copie e cole no seu .env

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

## 🧹 Limpeza

```powershell
# Deletar todas as functions (CUIDADO!)
supabase functions delete ai-coach
supabase functions delete send-notification
# ... etc

# Limpar secrets (CUIDADO!)
supabase secrets unset FIREBASE_SERVICE_ACCOUNT
# ... etc
```

## 🐛 Debug

```powershell
# Ver logs de erro
supabase functions logs send-notification --level error

# Ver logs das últimas 100 linhas
supabase functions logs send-notification --tail 100

# Invocar function manualmente
supabase functions invoke send-notification --body '{"type":"custom","payload":{"user_id":"test","title":"Teste","body":"Testando"}}'
```

## 📊 Monitoramento

```powershell
# Ver métricas no Dashboard
start https://supabase.com/dashboard/project/SEU_PROJECT_REF/functions

# Ver erros no Sentry
start https://sentry.io/organizations/SEU_ORG/issues/

# Ver pagamentos no Stripe
start https://dashboard.stripe.com/test/payments

# Ver Redis no Upstash
start https://console.upstash.com/redis/SEU_DATABASE_ID
```

## 🔄 Atualização

```powershell
# Atualizar Supabase CLI
npm update -g supabase

# Re-deploy após mudanças no código
.\scripts\deploy-all-functions.ps1

# Atualizar um secret
supabase secrets set NOME_DO_SECRET="novo_valor"
```

## 🎯 Workflow Completo

```powershell
# 1. Verificar setup
.\scripts\verify-setup.ps1

# 2. Configurar secrets
.\scripts\setup-secrets.ps1

# 3. Deploy
.\scripts\deploy-all-functions.ps1

# 4. Testar
.\scripts\test-functions.ps1

# 5. Ver logs
supabase functions logs send-notification --follow
```

## 💡 Dicas

```powershell
# Criar alias para comandos frequentes (adicione ao seu $PROFILE)
function sup { supabase functions logs $args --follow }
function sdeploy { .\scripts\deploy-all-functions.ps1 }
function stest { .\scripts\test-functions.ps1 }
function sverify { .\scripts\verify-setup.ps1 }

# Uso:
# sup send-notification  # Ver logs em tempo real
# sdeploy                # Deploy rápido
# stest                  # Testar tudo
# sverify                # Verificar setup
```

---

**Dica**: Salve este arquivo nos favoritos para acesso rápido! 🚀
