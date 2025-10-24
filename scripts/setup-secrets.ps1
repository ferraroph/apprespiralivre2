# Script interativo para configurar todos os secrets do Supabase
# Execute: .\scripts\setup-secrets.ps1

Write-Host "🔐 Configuração de Secrets do Supabase" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script vai te ajudar a configurar todos os secrets necessários." -ForegroundColor Yellow
Write-Host "Pressione ENTER para pular um secret (se já estiver configurado)." -ForegroundColor Yellow
Write-Host ""

# Função para adicionar secret
function Add-Secret {
    param (
        [string]$Name,
        [string]$Description,
        [bool]$IsMultiline = $false
    )
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "📝 $Name" -ForegroundColor Cyan
    Write-Host "   $Description" -ForegroundColor Gray
    Write-Host ""
    
    if ($IsMultiline) {
        Write-Host "Cole o conteúdo completo (JSON) e pressione ENTER duas vezes:" -ForegroundColor Yellow
        $lines = @()
        do {
            $line = Read-Host
            if ($line) {
                $lines += $line
            }
        } while ($line)
        $value = $lines -join ""
    } else {
        $value = Read-Host "Valor"
    }
    
    if ($value) {
        Write-Host "Configurando $Name..." -ForegroundColor Yellow
        supabase secrets set "$Name=$value"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Name configurado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erro ao configurar $Name" -ForegroundColor Red
        }
    } else {
        Write-Host "⏭️  Pulando $Name" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# Firebase
Add-Secret -Name "FIREBASE_SERVICE_ACCOUNT" `
           -Description "Cole TODO o conteúdo do arquivo firebase-service-account.json" `
           -IsMultiline $true

# Stripe
Add-Secret -Name "STRIPE_SECRET_KEY" `
           -Description "Chave secreta do Stripe (começa com sk_test_ ou sk_live_)"

Add-Secret -Name "STRIPE_WEBHOOK_SECRET" `
           -Description "Secret do webhook do Stripe (começa com whsec_)"

Add-Secret -Name "STRIPE_PRICE_STREAK_FREEZE" `
           -Description "Price ID do produto Congelamento de Sequência (começa com price_)"

Add-Secret -Name "STRIPE_PRICE_PREMIUM" `
           -Description "Price ID do produto Premium Mensal (começa com price_)"

Add-Secret -Name "STRIPE_PRICE_REMOVE_ADS" `
           -Description "Price ID do produto Remover Anúncios (começa com price_)"

# Upstash Redis
Add-Secret -Name "UPSTASH_REDIS_REST_URL" `
           -Description "URL REST do Upstash Redis (começa com https://)"

Add-Secret -Name "UPSTASH_REDIS_REST_TOKEN" `
           -Description "Token REST do Upstash Redis"

# Sentry
Add-Secret -Name "SENTRY_DSN" `
           -Description "DSN do Sentry (formato: https://...@sentry.io/...)"

# OpenAI (opcional)
Add-Secret -Name "OPENAI_API_KEY" `
           -Description "Chave da API OpenAI (opcional, para AI Coach) (começa com sk-)"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 Configuração de secrets concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Para verificar os secrets configurados, execute:" -ForegroundColor Yellow
Write-Host "  supabase secrets list" -ForegroundColor White
Write-Host ""
