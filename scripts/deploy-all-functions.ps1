# Script para fazer deploy de todas as Edge Functions do Supabase
# Execute: .\scripts\deploy-all-functions.ps1

Write-Host "🚀 Iniciando deploy de todas as Edge Functions..." -ForegroundColor Cyan
Write-Host ""

# Lista de todas as functions
$functions = @(
    "ai-coach",
    "send-notification",
    "create-payment",
    "webhook-stripe",
    "track-event",
    "checkin",
    "create-squad",
    "join-squad",
    "leave-squad"
)

$successCount = 0
$failCount = 0
$failedFunctions = @()

foreach ($func in $functions) {
    Write-Host "📦 Fazendo deploy de: $func" -ForegroundColor Yellow
    
    try {
        supabase functions deploy $func
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $func - Deploy concluído com sucesso!" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "❌ $func - Falha no deploy" -ForegroundColor Red
            $failCount++
            $failedFunctions += $func
        }
    } catch {
        Write-Host "❌ $func - Erro: $_" -ForegroundColor Red
        $failCount++
        $failedFunctions += $func
    }
    
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Resumo do Deploy:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Sucesso: $successCount" -ForegroundColor Green
Write-Host "❌ Falhas: $failCount" -ForegroundColor Red

if ($failCount -gt 0) {
    Write-Host ""
    Write-Host "Functions que falharam:" -ForegroundColor Red
    foreach ($func in $failedFunctions) {
        Write-Host "  - $func" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Deploy finalizado!" -ForegroundColor Cyan
