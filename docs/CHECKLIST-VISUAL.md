# ✅ Checklist Visual - Configuração Passo a Passo

## 🎯 Seu Progresso

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ✅ Projeto Firebase criado (respira-livre-app)            │
│  ⬜ Service Account do Firebase baixado                     │
│  ⬜ VAPID Key do Firebase copiada                           │
│  ⬜ Conta Stripe criada                                     │
│  ⬜ 3 Produtos Stripe criados                               │
│  ⬜ Webhook Stripe configurado                              │
│  ⬜ Conta Upstash criada                                    │
│  ⬜ Database Redis criado                                   │
│  ⬜ Conta Sentry criada                                     │
│  ⬜ Projeto Sentry criado                                   │
│  ⬜ Todos os secrets adicionados ao Supabase                │
│  ⬜ Arquivo .env configurado                                │
│  ⬜ Edge Functions deployadas                               │
│  ⬜ Testes executados com sucesso                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Passo a Passo Detalhado

### 🔥 FIREBASE (15 minutos)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Acesse: https://console.firebase.google.com/            │
│ 2. Selecione o projeto: respira-livre-app                  │
│ 3. Vá em: ⚙️ Configurações → Contas de serviço             │
│ 4. Clique: "Gerar nova chave privada"                      │
│ 5. Salve o arquivo JSON                                     │
│                                                             │
│ 6. Volte para: ⚙️ Configurações → Cloud Messaging          │
│ 7. Role até: "Certificados de push da Web"                 │
│ 8. Clique: "Gerar par de chaves"                           │
│ 9. Copie a chave pública (começa com B...)                 │
│                                                             │
│ ✅ Pronto! Você tem:                                        │
│    - firebase-service-account.json                          │
│    - VAPID Key                                              │
└─────────────────────────────────────────────────────────────┘
```

### 💳 STRIPE (20 minutos)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Acesse: https://dashboard.stripe.com/register           │
│ 2. Crie sua conta                                           │
│ 3. Ative o "Modo de teste" (canto superior direito)        │
│                                                             │
│ 4. Vá em: Produtos → + Adicionar produto                   │
│                                                             │
│    PRODUTO 1: Congelamento de Sequência                    │
│    - Nome: Congelamento de Sequência                       │
│    - Preço: R$ 4.90 (pagamento único)                      │
│    - Copie o PRICE ID                                       │
│                                                             │
│    PRODUTO 2: Premium Mensal                                │
│    - Nome: Premium Mensal                                   │
│    - Preço: R$ 9.90/mês (recorrente)                       │
│    - Copie o PRICE ID                                       │
│                                                             │
│    PRODUTO 3: Remover Anúncios                              │
│    - Nome: Remover Anúncios                                 │
│    - Preço: R$ 14.90 (pagamento único)                     │
│    - Copie o PRICE ID                                       │
│                                                             │
│ 5. Vá em: Desenvolvedores → Chaves de API                  │
│    - Copie a Chave publicável (pk_test_...)                │
│    - Copie a Chave secreta (sk_test_...)                   │
│                                                             │
│ 6. Vá em: Desenvolvedores → Webhooks                       │
│    - Clique: + Adicionar endpoint                          │
│    - URL: https://SEU_PROJECT.supabase.co/functions/v1/... │
│    - Eventos: checkout.session.completed                   │
│    - Copie o Signing secret (whsec_...)                    │
│                                                             │
│ ✅ Pronto! Você tem:                                        │
│    - 3 Price IDs                                            │
│    - Chave publicável                                       │
│    - Chave secreta                                          │
│    - Webhook secret                                         │
└─────────────────────────────────────────────────────────────┘
```

### ⚡ UPSTASH (5 minutos)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Acesse: https://console.upstash.com/                    │
│ 2. Faça login com GitHub ou Google                         │
│ 3. Clique: Create Database                                  │
│    - Nome: respira-livre-redis                              │
│    - Tipo: Regional                                         │
│    - Região: Mais próxima do seu Supabase                  │
│    - TLS: Ativado ✅                                        │
│ 4. Clique: Create                                           │
│                                                             │
│ 5. Na página do database:                                   │
│    - Role até "REST API"                                    │
│    - Copie: UPSTASH_REDIS_REST_URL                         │
│    - Copie: UPSTASH_REDIS_REST_TOKEN                       │
│                                                             │
│ ✅ Pronto! Você tem:                                        │
│    - REST URL                                               │
│    - REST Token                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🐛 SENTRY (5 minutos)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Acesse: https://sentry.io/signup/                       │
│ 2. Crie sua conta (gratuita)                               │
│ 3. Escolha plataforma: React                                │
│ 4. Nome do projeto: respira-livre                          │
│ 5. Clique: Create Project                                   │
│                                                             │
│ 6. Copie o DSN (aparece logo após criar)                   │
│    Formato: https://...@sentry.io/...                      │
│                                                             │
│ ✅ Pronto! Você tem:                                        │
│    - DSN do Sentry                                          │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Configurar Secrets (5 minutos)

```powershell
# Execute este comando e siga as instruções:
.\scripts\setup-secrets.ps1
```

```
┌─────────────────────────────────────────────────────────────┐
│ O script vai pedir cada secret, um por vez:                │
│                                                             │
│ 📝 FIREBASE_SERVICE_ACCOUNT                                 │
│    Cole TODO o conteúdo do arquivo JSON                    │
│                                                             │
│ 📝 STRIPE_SECRET_KEY                                        │
│    Cole: sk_test_...                                        │
│                                                             │
│ 📝 STRIPE_WEBHOOK_SECRET                                    │
│    Cole: whsec_...                                          │
│                                                             │
│ 📝 STRIPE_PRICE_STREAK_FREEZE                               │
│    Cole: price_...                                          │
│                                                             │
│ 📝 STRIPE_PRICE_PREMIUM                                     │
│    Cole: price_...                                          │
│                                                             │
│ 📝 STRIPE_PRICE_REMOVE_ADS                                  │
│    Cole: price_...                                          │
│                                                             │
│ 📝 UPSTASH_REDIS_REST_URL                                   │
│    Cole: https://...upstash.io                              │
│                                                             │
│ 📝 UPSTASH_REDIS_REST_TOKEN                                 │
│    Cole: o token                                            │
│                                                             │
│ 📝 SENTRY_DSN                                               │
│    Cole: https://...@sentry.io/...                         │
│                                                             │
│ 📝 OPENAI_API_KEY (opcional)                                │
│    Cole: sk-... (ou pule)                                   │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Configurar .env (2 minutos)

Edite o arquivo `.env` na raiz do projeto:

```env
# Supabase (você já tem isso)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# Stripe (adicione)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Firebase (adicione)
VITE_FIREBASE_VAPID_KEY=B...

# Sentry (adicione)
VITE_SENTRY_DSN=https://...@sentry.io/...
```

## 🚀 Deploy (3 minutos)

```powershell
# Execute este comando:
.\scripts\deploy-all-functions.ps1
```

```
┌─────────────────────────────────────────────────────────────┐
│ O script vai fazer deploy de todas as 9 functions:         │
│                                                             │
│ 📦 ai-coach                                                 │
│ 📦 send-notification                                        │
│ 📦 create-payment                                           │
│ 📦 webhook-stripe                                           │
│ 📦 track-event                                              │
│ 📦 checkin                                                  │
│ 📦 create-squad                                             │
│ 📦 join-squad                                               │
│ 📦 leave-squad                                              │
│                                                             │
│ Aguarde... isso pode levar alguns minutos.                 │
└─────────────────────────────────────────────────────────────┘
```

## 🧪 Testar (2 minutos)

```powershell
# Execute este comando:
.\scripts\test-functions.ps1
```

```
┌─────────────────────────────────────────────────────────────┐
│ O script vai testar as functions automaticamente           │
│                                                             │
│ ✅ track-event: OK                                          │
│ ⚠️  send-notification: Requer autenticação                 │
│ ⚠️  create-payment: Requer autenticação                    │
│ ⚠️  webhook-stripe: Requer Stripe                          │
│ ⚠️  ai-coach: Requer autenticação                          │
│                                                             │
│ Para testar as outras, use o app normalmente!              │
└─────────────────────────────────────────────────────────────┘
```

## 🎉 Pronto!

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              🎊 PARABÉNS! TUDO CONFIGURADO! 🎊              │
│                                                             │
│  Seu app agora tem:                                         │
│  ✅ Notificações Push (Firebase)                            │
│  ✅ Pagamentos (Stripe)                                     │
│  ✅ Cache e Rate Limiting (Upstash)                         │
│  ✅ Monitoramento de Erros (Sentry)                         │
│  ✅ 9 Edge Functions deployadas                             │
│                                                             │
│  Próximos passos:                                           │
│  1. Teste o app localmente: npm run dev                    │
│  2. Faça um check-in de teste                              │
│  3. Tente comprar um produto (use cartão de teste)         │
│  4. Verifique se as notificações funcionam                 │
│  5. Monitore erros no Sentry                               │
│                                                             │
│  Quando estiver tudo OK:                                    │
│  - Mude o Stripe para modo de produção                     │
│  - Atualize as chaves de produção                          │
│  - Deploy! 🚀                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## ⏱️ Tempo Total Estimado

```
Firebase:  15 min  ████████████████░░░░░░░░
Stripe:    20 min  ████████████████████░░░░
Upstash:    5 min  █████░░░░░░░░░░░░░░░░░░░
Sentry:     5 min  █████░░░░░░░░░░░░░░░░░░░
Secrets:    5 min  █████░░░░░░░░░░░░░░░░░░░
.env:       2 min  ██░░░░░░░░░░░░░░░░░░░░░░
Deploy:     3 min  ███░░░░░░░░░░░░░░░░░░░░░
Testes:     2 min  ██░░░░░░░░░░░░░░░░░░░░░░
─────────────────────────────────────────────
TOTAL:     57 min  ████████████████████████
```

## 📞 Precisa de Ajuda?

```
┌─────────────────────────────────────────────────────────────┐
│ Documentação:                                               │
│ 📖 Guia Completo: docs/guia-configuracao-servicos-...md    │
│ 📖 Guia Rápido: docs/COMECE-AQUI.md                        │
│ 📖 Comandos: docs/COMANDOS-RAPIDOS.md                      │
│                                                             │
│ Scripts:                                                    │
│ 🔍 .\scripts\verify-setup.ps1                              │
│ 🔐 .\scripts\setup-secrets.ps1                             │
│ 🚀 .\scripts\deploy-all-functions.ps1                      │
│ 🧪 .\scripts\test-functions.ps1                            │
└─────────────────────────────────────────────────────────────┘
```

---

**Dica**: Imprima este checklist e vá marcando conforme completa! ✅
