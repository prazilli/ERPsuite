# AMDOX ERP Suite - Dev Server Startup Script
# Run this from the ERPsuite root: .\start-dev.ps1

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   AMDOX ERP Suite - Development Startup  " -ForegroundColor Cyan  
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill anything on port 3000 (frontend)
Write-Host ">> Clearing port 3000 (Frontend)..." -ForegroundColor Yellow
$port3000 = netstat -ano | Select-String ":3000 " | Select-String "LISTENING" | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
foreach ($p in $port3000) {
    taskkill /PID $p /F 2>&1 | Out-Null
    Write-Host "   Killed PID $p on port 3000" -ForegroundColor Red
}

# Step 2: Kill anything on port 5000 (backend)
Write-Host ">> Clearing port 5000 (Backend)..." -ForegroundColor Yellow
$port5000 = netstat -ano | Select-String ":5000 " | Select-String "LISTENING" | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
foreach ($p in $port5000) {
    taskkill /PID $p /F 2>&1 | Out-Null
    Write-Host "   Killed PID $p on port 5000" -ForegroundColor Red
}

# Step 3: Clean Next.js dev lock file
$lockFile = Join-Path $PSScriptRoot "frontend\.next\dev\logs\next-development.log"
if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force
    Write-Host ">> Cleaned Next.js dev lock file" -ForegroundColor Yellow
}

Start-Sleep -Seconds 1

# Step 4: Start Backend in a new window
Write-Host ">> Starting Backend (NestJS) on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'AMDOX Backend Starting...' -ForegroundColor Cyan; npm run start:dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Step 5: Start Frontend in a new window
Write-Host ">> Starting Frontend (Next.js) on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'AMDOX Frontend Starting...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host " Servers launching in separate windows!   " -ForegroundColor Green
Write-Host "   Backend  -> http://localhost:5000       " -ForegroundColor White
Write-Host "   Frontend -> http://localhost:3000       " -ForegroundColor White
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: Close the new windows to stop the servers." -ForegroundColor Yellow
