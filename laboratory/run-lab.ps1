param(
  [switch]$SkipBuild,
  [switch]$NoCache
)

Set-Location $PSScriptRoot

docker compose version 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
  $LabDc = { param([string[]]$a) & docker (@('compose') + $a) }
} else {
  docker-compose version 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Need Docker with 'docker compose' plugin or 'docker-compose' on PATH."
    exit 1
  }
  $LabDc = { param([string[]]$a) & docker-compose @a }
}

$services = @(
  'victim-backend-limited', 'victim-backend-unlimited', 'victim-backend-syncookies',
  'victim-backend-large-backlog', 'victim-backend-hardened', 'attacker-baseline',
  'attacker-mitigations', 'user-simulator'
)

Write-Host "=== SYN Flood Lab - Restart ===" -ForegroundColor Cyan
Write-Host "Working directory: $PWD" -ForegroundColor DarkGray
if ($SkipBuild) { Write-Host "Mode: SkipBuild (no image build)" -ForegroundColor Green }
elseif ($NoCache) { Write-Host "Mode: NoCache (full rebuild, slow)" -ForegroundColor Yellow }
else { Write-Host "Mode: incremental build (fast)" -ForegroundColor Green }
Write-Host ""

Write-Host "1. Stopping and removing containers..." -ForegroundColor Yellow
& $LabDc @('--profile', 'tools', 'down', '--remove-orphans')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not $SkipBuild) {
  Write-Host "2. Building images..." -ForegroundColor Yellow
  $buildArgs = [System.Collections.ArrayList]@('build')
  if ($NoCache) { [void]$buildArgs.Add('--no-cache') }
  foreach ($s in $services) { [void]$buildArgs.Add($s) }
  & $LabDc @($buildArgs.ToArray())
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
  Write-Host "2. Skipping build (use after code change: .\run-lab.ps1 or .\run-lab.ps1 -NoCache)" -ForegroundColor DarkGray
}

Write-Host "3. Starting victims + DB..." -ForegroundColor Yellow
& $LabDc @(
  'up', '-d',
  'victim-db', 'victim-backend-limited', 'victim-backend-unlimited',
  'victim-backend-syncookies', 'victim-backend-large-backlog', 'victim-backend-hardened'
)
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "4. Waiting 10s for victims to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "5. Starting attackers (baseline + mitigations)..." -ForegroundColor Yellow
& $LabDc @('--profile', 'tools', 'up', '-d', 'attacker-baseline', 'attacker-mitigations')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "6. Waiting 60s for attackers to fill backlog..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host "7. Starting user-simulator (10 min test)..." -ForegroundColor Yellow
& $LabDc @('--profile', 'tools', 'up', '-d', 'user-simulator')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Done! Logs: docker logs -f user_simulator" -ForegroundColor Green
