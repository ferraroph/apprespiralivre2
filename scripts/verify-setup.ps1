# Script para verificar se tudo está configurado corretamente
# Execute: .\scripts\verify-setup.ps1

Write-Host "🔍 Verificando configuração do projeto..." -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# Verificar se Supabase CLI está instalado
Write-Host "Verificando Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version 2>&1
    Write-Host "✅ Supabase CLI instalado: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI não encontrado" -ForegroundColor Red
    $errors += "Supabase CLI não está instalado. Execute: npm install -g supabase"
}
Write-Host ""

# Verificar se está logado no Supabase
Write-Host "Verificando login no Supabase..." -ForegroundColor Yellow
try {
    $loginStatus = supabase projects list 2>&1
    if ($loginStatus -match "error" -or $loginStatus -match "not logged in") {
        Write-Host "❌ Não está logado no Supabase" -ForegroundColor Red
        $errors += "Execute: supabase login"
    } else {
        Write-Host "✅ Logado no Supabase" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erro ao verificar login" -ForegroundColor Red
    $errors += "Execute: supabase login"
}
Write-Host ""

# Verificar arquivo .env
Write-Host "Verificando arquivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
    
    $envContent = Get-Content ".env" -Raw
    
    # Verificar variáveis essenciais
    $requiredVars = @(
        "VITE_SUPABASE_URL",
        "VITE_SUPABASE_PUBLISHABLE_KEY",
        "VITE_STRIPE_PUBLISHABLE_KEY",
        "VITE_FIREBASE_VAPID_KEY",
        "VITE_SENTRY_DSN"
    )
    
    foreach ($var in $requiredVars) {
        if ($envContent -match $var) {
            Write-Host "  ✅ $var configurado" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $var não encontrado" -ForegroundColor Yellow
            $warnings += "$var não está configurado no .env"
        }
    }
} else {
    Write-Host "❌ Arquivo .env não encontrado" -ForegroundColor Red
    $errors += "Crie um arquivo .env na raiz do projeto"
}
Write-Host ""

# Verificar secrets do Supabase
Write-Host "Verificando secrets do Supabase..." -ForegroundColor Yellow
try {
    $secrets = supabase secrets list 2>&1
    
    if ($secrets -match "error" -or $secrets -match "not linked") {
        Write-Host "❌ Projeto não está linkado ao Supabase" -ForegroundColor Red
        $errors += "Execute: supabase link --project-ref SEU_PROJECT_REF"
    } else {
        Write-Host "✅ Projeto linkado ao Supabase" -ForegroundColor Green
        
        # Verificar secrets essenciais
        $requiredSecrets = @(
            "FIREBASE_SERVICE_ACCOUNT",
            "STRIPE_SECRET_KEY",
            "STRIPE_WEBHOOK_SECRET",
            "UPSTASH_REDIS_REST_URL",
            "UPSTASH_REDIS_REST_TOKEN",
            "SENTRY_DSN"
        )
        
        foreach ($secret in $requiredSecrets) {
            if ($secrets -match $secret) {
                Write-Host "  ✅ $secret configurado" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  $secret não encontrado" -ForegroundColor Yellow
                $warnings += "$secret não está configurado no Supabase"
            }
        }
    }
} catch {
    Write-Host "❌ Erro ao verificar secrets" -ForegroundColor Red
    $errors += "Não foi possível verificar os secrets do Supabase"
}
Write-Host ""

# Verificar Edge Functions
Write-Host "Verificando Edge Functions..." -ForegroundColor Yellow
$functionsDir = "supabase/functions"
if (Test-Path $functionsDir) {
    $functions = Get-ChildItem $functionsDir -Directory | Where-Object { $_.Name -ne "_shared" }
    Write-Host "✅ Encontradas $($functions.Count) Edge Functions:" -ForegroundColor Green
    foreach ($func in $functions) {
        Write-Host "  - $($func.Name)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Diretório de functions não encontrado" -ForegroundColor Red
    $errors += "Diretório supabase/functions não existe"
}
Write-Host ""

# Resumo
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Resumo da Verificação" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 Tudo configurado corretamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor Cyan
    Write-Host "  1. Execute: .\scripts\deploy-all-functions.ps1" -ForegroundColor White
    Write-Host "  2. Teste as functions no Dashboard do Supabase" -ForegroundColor White
} else {
    if ($errors.Count -gt 0) {
        Write-Host "❌ Erros encontrados ($($errors.Count)):" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "  - $error" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  Avisos ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "Consulte o guia: docs/guia-configuracao-servicos-externos.md" -ForegroundColor Cyan
}

Write-Host ""
