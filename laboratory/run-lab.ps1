Write-Host "=== SYN Flood Lab - Full Restart ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Stopping and removing all containers..." -ForegroundColor Yellow
docker-compose --profile tools down

Write-Host "2. Rebuilding images (no cache)..." -ForegroundColor Yellow
docker-compose build --no-cache victim-backend-limited victim-backend-unlimited attacker user-simulator

Write-Host "3. Starting victims + DB..." -ForegroundColor Yellow
docker-compose up -d victim-db victim-backend-limited victim-backend-unlimited

Write-Host "4. Waiting 10s for victims to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "5. Starting attacker (flood begins)..." -ForegroundColor Yellow
docker-compose --profile tools up -d attacker

Write-Host "6. Waiting 60s for attacker to fill backlog..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host "7. Starting user-simulator (10 min test)..." -ForegroundColor Yellow
docker-compose --profile tools up -d user-simulator

Write-Host ""
Write-Host "Done! Monitor: docker logs -f user_simulator" -ForegroundColor Green
