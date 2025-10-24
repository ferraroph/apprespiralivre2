# 🚀 COMECE AQUI - Configuração Rápida

Este guia vai te ajudar a configurar todos os serviços externos necessários para o Respira Livre.

## 📋 O que você precisa fazer

Você precisa configurar 4 serviços:

1. ✅ **Firebase** - JÁ CRIADO (projeto: respira-livre-app)
2. **Stripe** - Pagamentos
3. **Upstash** - Cache
4. **Sentry** - Monitoramento de erros

## 🎯 Passo a Passo Simplificado

### Passo 1: Verificar o que já está configurado

Execute este comando para ver o que falta:

```powershell
.\scripts\verify-setup.ps1
```

Este script vai te mostrar exatamente o que está faltando.

### Passo 2: Configurar cada serviço

Siga o guia detalhado em português:

📖 **[Guia Completo de Configuração](./guia-configuracao-servicos-externos.md)**

O guia tem instruções passo a passo com prints e exemplos.

### Passo 3: Adicionar os secrets ao Supabase

Depois de criar as contas e obter as chaves, execute:

```powershell
.\scripts\setup-secrets.ps1
```

Este script vai te guiar interativamente para adicionar cada secret.

### Passo 4: Fazer deploy das Edge Functions

Quando todos os secrets estiverem configurados:

```powershell
.\scripts\deploy-all-functions.ps1
```

### Passo 5: Testar tudo

```powershell
.\scripts\test-functions.ps1
```

## 🆘 Precisa de Ajuda?

### Problemas Comuns

**"Supabase CLI não encontrado"**
```powershell
npm install -g supabase
```

**"Não está logado no Supabase"**
```powershell
supabase login
```

**"Projeto não está linkado"**
```powershell
supabase link --project-ref SEU_PROJECT_REF
```

### Onde encontrar as informações

- **Project Ref do Supabase**: Dashboard do Supabase → Settings → General
- **Anon Key do Supabase**: Dashboard do Supabase → Settings → API
- **Service Role Key**: Dashboard do Supabase → Settings → API

## 📚 Documentação Completa

- [Guia de Configuração Completo](./guia-configuracao-servicos-externos.md) - Instruções detalhadas
- [Resumo de Configuração de Produção](./production-configuration-summary.md) - Checklist final

## ✅ Checklist Rápido

Marque conforme for completando:

- [ ] Firebase configurado (Service Account + VAPID Key)
- [ ] Stripe configurado (3 produtos criados + webhook)
- [ ] Upstash Redis criado
- [ ] Sentry projeto criado
- [ ] Todos os secrets adicionados ao Supabase
- [ ] Todas as variáveis adicionadas ao .env
- [ ] Edge Functions deployadas
- [ ] Testes executados com sucesso

## 🎉 Pronto!

Quando tudo estiver ✅, seu app estará pronto para produção!

---

**Dúvidas?** Consulte o [Guia Completo](./guia-configuracao-servicos-externos.md) que tem todas as respostas.
