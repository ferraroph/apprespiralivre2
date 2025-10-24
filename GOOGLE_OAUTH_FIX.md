# Como corrigir o Google OAuth

## O problema
O erro "Unable to exchange external code" acontece porque o Redirect URI não está configurado corretamente.

## Solução

### 1. Google Cloud Console
Acesse: https://console.cloud.google.com/apis/credentials

1. Encontre suas credenciais OAuth 2.0
2. Clique para editar
3. Em **Authorized redirect URIs**, adicione EXATAMENTE:
   ```
   https://pyfgepdbxhbofrgainou.supabase.co/auth/v1/callback
   ```
4. Salve

### 2. Supabase Dashboard
Acesse: https://supabase.com/dashboard/project/pyfgepdbxhbofrgainou/auth/providers

1. Clique em **Google**
2. Verifique se está **Enabled**
3. Cole o **Client ID** e **Client Secret** do Google Cloud Console
4. Salve

### 3. Verificar variáveis no Vercel
✅ Já configurado:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

### 4. Testar
Após configurar, teste em: https://respiralivre.vercel.app/auth

## Redirect URIs que devem estar no Google Cloud Console:
- https://pyfgepdbxhbofrgainou.supabase.co/auth/v1/callback (PRODUÇÃO)
- http://localhost:8080/auth/v1/callback (DESENVOLVIMENTO - opcional)

## Se ainda não funcionar:
1. Verifique se o projeto Google OAuth está em "Testing" ou "Production"
2. Se estiver em Testing, adicione seu email como Test User
3. Aguarde alguns minutos após salvar as configurações
