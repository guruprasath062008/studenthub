# ============================================================
# StudentHub - Local Development Multi-Service Runner (PowerShell)
# Runs Auth Service, Student Service, and Frontend concurrently
# ============================================================

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Starting StudentHub Multi-Service System       " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "[1/3] Launching Auth Service on Port 5001..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "src/index.js" -WorkingDirectory "$root\auth-service"

Write-Host "[2/3] Launching Student API Service on Port 5002..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "src/index.js" -WorkingDirectory "$root\student-service"

Write-Host "[3/3] Launching Frontend Dashboard on Port 3000..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$root\frontend"

Write-Host ""
Write-Host "All 3 services have been launched!" -ForegroundColor Green
Write-Host "Frontend Dashboard: http://localhost:3000" -ForegroundColor Green
Write-Host "Auth Service API:   http://localhost:5001" -ForegroundColor Green
Write-Host "Student Service:    http://localhost:5002" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan