#!/usr/bin/env pwsh
# ──────────────────────────────────────────────
# OryzaDetect: Build & Deploy Script
# Build frontend → Copy ke backend/static → Siap deploy
# ──────────────────────────────────────────────

Write-Host "`n[1/3] Building React frontend..." -ForegroundColor Cyan
$env:VITE_API_URL = ""
npx vite build

if ($LASTEXITCODE -ne 0) {
    Write-Host "BUILD FAILED!" -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/3] Copying build to backend/static..." -ForegroundColor Cyan
$staticDir = "backend\static"
if (Test-Path $staticDir) { Remove-Item $staticDir -Recurse -Force }
Copy-Item "dist" $staticDir -Recurse

# Copy public assets yang tidak masuk dist (images, favicons)
if (Test-Path "public\images") {
    Copy-Item "public\images" "$staticDir\images" -Recurse
}

# Copy semua icon & favicon
$icons = @("favicon.ico", "icon.svg", "apple-icon.png", "icon-dark-32x32.png", "icon-light-32x32.png")
foreach ($icon in $icons) {
    if (Test-Path "public\$icon") {
        Copy-Item "public\$icon" "$staticDir\$icon" -Force
    }
}

Write-Host "`n[3/3] Done!" -ForegroundColor Green
Write-Host "Jalankan backend:" -ForegroundColor Yellow
Write-Host "  cd backend && python main.py" -ForegroundColor White
Write-Host "Buka: http://localhost:8000`n" -ForegroundColor White
