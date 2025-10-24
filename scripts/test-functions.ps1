# Script para testar as Edge Functions
# Execute: .\scripts\test-functions.ps1

Write-Host "🧪 Testando Edge Functions..." -ForegroundColor Cyan
Write-Host ""

# Solicitar informações necessárias
Write-Host "Para testar as functions, precisamos de algumas informações:" -ForegroundColor Yellow
Write-Host ""

$projectRef = Read-Host "Project Ref do Supabase (ex: abcdefghijklmnop)"
$anonKey = Read-Host "Anon Key do Supabase"

if (-not $projectRef -or -not $anonKey) {
    Write-Host "❌ Project Ref e Anon Key são obrigatórios!" -ForegroundColor Red
    exit 1
}

$baseUrl = "https://$projectRef.supabase.co/functions/v1"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🧪 Iniciando testes..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Track Event
Write-Host "1️⃣  Testando track-event..." -ForegroundColor Yellow
try {
    $body = @{
        event_type = "test_event"
        event_data = @{
            test = "true"
        }
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/track-event" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $anonKey"
            "Content-Type" = "application/json"
        } `
        -Body $body

    Write-Host "✅ track-event funcionando!" -ForegroundColor Green
    Write-Host "   Resposta: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erro em track-event: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Teste 2: Send Notification (requer autenticação de usuário)
Write-Host "2️⃣  Testando send-notification..." -ForegroundColor Yellow
Write-Host "   ⚠️  Este teste requer um token de usuário válido" -ForegroundColor Yellow
Write-Host "   Pulando teste automático..." -ForegroundColor Gray
Write-Host ""

# Teste 3: Create Payment (requer autenticação de usuário)
Write-Host "3️⃣  Testando create-payment..." -ForegroundColor Yellow
Write-Host "   ⚠️  Este teste requer um token de usuário válido" -ForegroundColor Yellow
Write-Host "   Pulando teste automático..." -ForegroundColor Gray
Write-Host ""

# Teste 4: Webhook Stripe (requer assinatura válida)
Write-Host "4️⃣  Testando webhook-stripe..." -ForegroundColor Yellow
Write-Host "   ⚠️  Este teste requer uma assinatura válida do Stripe" -ForegroundColor Yellow
Write-Host "   Teste este endpoint através do Dashboard do Stripe" -ForegroundColor Gray
Write-Host ""

# Teste 5: AI Coach (requer autenticação de usuário)
Write-Host "5️⃣  Testando ai-coach..." -ForegroundColor Yellow
Write-Host "   ⚠️  Este teste requer um token de usuário válido" -ForegroundColor Yellow
Write-Host "   Pulando teste automático..." -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Resumo dos Testes" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para testar as functions que requerem autenticação:" -ForegroundColor Yellow
Write-Host "  1. Faça login no app" -ForegroundColor White
Write-Host "  2. Use as features normalmente" -ForegroundColor White
Write-Host "  3. Monitore os logs no Dashboard do Supabase" -ForegroundColor White
Write-Host ""
Write-Host "Para ver os logs das functions:" -ForegroundColor Yellow
Write-Host "  supabase functions logs <function-name>" -ForegroundColor White
Write-Host ""
