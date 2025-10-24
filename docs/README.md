# 📚 Documentação - Respira Livre

Bem-vindo à documentação do projeto Respira Livre!

## 🚀 Começando

Se você está configurando o projeto pela primeira vez, comece aqui:

### 1. **[COMECE AQUI](./COMECE-AQUI.md)** ⭐
   - Guia rápido de início
   - Checklist simplificado
   - Links para documentação completa

### 2. **[Checklist Visual](./CHECKLIST-VISUAL.md)** 📋
   - Passo a passo visual
   - Tempo estimado para cada etapa
   - Progresso marcável

### 3. **[Guia Completo de Configuração](./guia-configuracao-servicos-externos.md)** 📖
   - Instruções detalhadas de cada serviço
   - Troubleshooting
   - Exemplos práticos

## 🛠️ Referência Rápida

### Para Desenvolvedores

- **[Comandos Rápidos](./COMANDOS-RAPIDOS.md)** - Cheat sheet de comandos
- **[O Que Foi Feito](./O-QUE-FOI-FEITO.md)** - Resumo das implementações
- **[Configuração de Produção](./production-configuration-summary.md)** - Checklist final

### Para Configuração

- **[Configuração de Auth](./supabase-auth-production-config.md)** - Setup de autenticação
- **[Tracking](./trk)** - Sistema de analytics

## 📂 Estrutura da Documentação

```
docs/
├── README.md                                    ← Você está aqui
├── COMECE-AQUI.md                              ← Comece por aqui!
├── CHECKLIST-VISUAL.md                         ← Checklist passo a passo
├── guia-configuracao-servicos-externos.md      ← Guia completo
├── COMANDOS-RAPIDOS.md                         ← Cheat sheet
├── O-QUE-FOI-FEITO.md                          ← Resumo técnico
├── production-configuration-summary.md         ← Checklist de produção
├── supabase-auth-production-config.md          ← Config de auth
└── trk                                         ← Analytics
```

## 🎯 Fluxo Recomendado

### Para Primeira Configuração

```
1. Leia: COMECE-AQUI.md
   ↓
2. Execute: .\scripts\verify-setup.ps1
   ↓
3. Siga: CHECKLIST-VISUAL.md
   ↓
4. Configure: guia-configuracao-servicos-externos.md
   ↓
5. Execute: .\scripts\setup-secrets.ps1
   ↓
6. Deploy: .\scripts\deploy-all-functions.ps1
   ↓
7. Teste: .\scripts\test-functions.ps1
   ↓
8. ✅ Pronto!
```

### Para Desenvolvimento Diário

```
1. Consulte: COMANDOS-RAPIDOS.md
2. Use os scripts em: ../scripts/
3. Monitore logs: supabase functions logs
```

### Para Deploy em Produção

```
1. Revise: production-configuration-summary.md
2. Mude Stripe para modo de produção
3. Atualize secrets de produção
4. Re-deploy: .\scripts\deploy-all-functions.ps1
5. Teste tudo novamente
```

## 🔧 Scripts Disponíveis

Todos os scripts estão em `../scripts/`:

| Script | Descrição | Quando Usar |
|--------|-----------|-------------|
| `verify-setup.ps1` | Verifica configuração | Antes de começar |
| `setup-secrets.ps1` | Configura secrets interativamente | Após criar contas |
| `deploy-all-functions.ps1` | Deploy de todas as functions | Após configurar secrets |
| `test-functions.ps1` | Testa as functions | Após deploy |

## 📖 Guias por Serviço

### Firebase (Notificações Push)
- **Tempo**: ~15 minutos
- **Seção**: Guia Completo → Seção 1
- **O que você precisa**: Conta Google
- **O que você vai obter**: Service Account JSON + VAPID Key

### Stripe (Pagamentos)
- **Tempo**: ~20 minutos
- **Seção**: Guia Completo → Seção 2
- **O que você precisa**: Email e dados bancários (para produção)
- **O que você vai obter**: 3 Price IDs + API Keys + Webhook Secret

### Upstash (Redis)
- **Tempo**: ~5 minutos
- **Seção**: Guia Completo → Seção 3
- **O que você precisa**: Conta GitHub ou Google
- **O que você vai obter**: REST URL + REST Token

### Sentry (Monitoramento)
- **Tempo**: ~5 minutos
- **Seção**: Guia Completo → Seção 4
- **O que você precisa**: Email
- **O que você vai obter**: DSN

## 🆘 Problemas Comuns

### "Supabase CLI não encontrado"
```powershell
npm install -g supabase
```

### "Não está logado no Supabase"
```powershell
supabase login
```

### "Projeto não está linkado"
```powershell
supabase link --project-ref SEU_PROJECT_REF
```

### "Secret não está configurado"
```powershell
.\scripts\setup-secrets.ps1
```

### "Function falhou no deploy"
```powershell
# Ver logs
supabase functions logs NOME_DA_FUNCTION

# Verificar secrets
supabase secrets list

# Re-deploy
supabase functions deploy NOME_DA_FUNCTION
```

## 💡 Dicas

### Para Iniciantes
1. Siga o **CHECKLIST-VISUAL.md** passo a passo
2. Não pule etapas
3. Use os scripts automatizados
4. Consulte o guia completo quando tiver dúvidas

### Para Desenvolvedores
1. Mantenha o **COMANDOS-RAPIDOS.md** aberto
2. Use aliases para comandos frequentes
3. Monitore logs em tempo real
4. Teste localmente antes de fazer deploy

### Para Produção
1. Revise **production-configuration-summary.md**
2. Use modo de teste do Stripe primeiro
3. Teste tudo antes de ir para produção
4. Configure monitoramento no Sentry

## 🔗 Links Úteis

### Dashboards
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Firebase Console](https://console.firebase.google.com/)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Upstash Console](https://console.upstash.com/)
- [Sentry Dashboard](https://sentry.io/)

### Documentação Oficial
- [Supabase Docs](https://supabase.com/docs)
- [Firebase FCM v1](https://firebase.google.com/docs/cloud-messaging/migrate-v1)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Upstash Redis](https://docs.upstash.com/redis)
- [Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/)

## 📊 Status do Projeto

### ✅ Implementado
- [x] Documentação completa em português
- [x] Scripts de automação
- [x] Firebase API v1 (atualizado)
- [x] Stripe Checkout
- [x] Upstash Redis
- [x] Sentry monitoring
- [x] 9 Edge Functions

### ⏳ Você Precisa Fazer
- [ ] Criar contas nos serviços
- [ ] Configurar secrets
- [ ] Fazer deploy
- [ ] Testar

## 🎓 Aprendizado

### Conceitos Importantes

**Edge Functions**: Funções serverless que rodam no edge (próximo ao usuário)

**Secrets**: Variáveis de ambiente seguras que não são commitadas no Git

**OAuth2**: Protocolo de autenticação usado pelo Firebase v1

**Webhook**: Endpoint que recebe notificações de eventos (ex: pagamento concluído)

**Rate Limiting**: Limitar número de requisições para prevenir abuso

## 📞 Suporte

Se você seguiu todos os guias e ainda tem problemas:

1. Execute `.\scripts\verify-setup.ps1` para diagnóstico
2. Consulte a seção de Troubleshooting no guia completo
3. Verifique os logs: `supabase functions logs NOME_DA_FUNCTION`
4. Revise os secrets: `supabase secrets list`

## 🎉 Conclusão

Com esta documentação você tem tudo que precisa para:
- ✅ Configurar todos os serviços externos
- ✅ Fazer deploy das Edge Functions
- ✅ Testar e validar tudo
- ✅ Ir para produção com confiança

**Boa sorte! 🚀**

---

**Última atualização**: Outubro 2024
**Versão da documentação**: 1.0
**Mantido por**: Kiro AI Assistant
