<#
.SYNOPSIS
Builds the GM Groupe frontend for production deployment to IIS.
#>

param(
    [switch]$Clean,
    [switch]$SkipTests
)

$ErrorActionPreference = 'Stop'

Write-Host "=== GM Groupe Frontend Production Build ===" -ForegroundColor Cyan

# Verify Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed or not in PATH."
}
Write-Host "Node.js: $(node --version)"

# Verify npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed or not in PATH."
}
Write-Host "npm: $(npm --version)"

# Navigate to frontend directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $scriptDir ".."
Set-Location $frontendDir

if ($Clean) {
    Write-Host "`nCleaning previous build..." -ForegroundColor Yellow
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
}

Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
$installExit = 0
npm ci
$installExit = $LASTEXITCODE
if ($installExit -ne 0) {
    Write-Error "npm ci failed with exit code $installExit. Resolve dependency installation errors before building."
}

if (-not $SkipTests) {
    Write-Host "`nRunning tests..." -ForegroundColor Yellow
    $testExit = 0
    npm run test:run
    $testExit = $LASTEXITCODE
    if ($testExit -ne 0) {
        Write-Warning "Tests failed with exit code $testExit. Continuing with build..."
    }
}

Write-Host "`nBuilding production bundle..." -ForegroundColor Yellow
$buildExit = 0
npm run build
$buildExit = $LASTEXITCODE
if ($buildExit -ne 0) {
    Write-Error "npm run build failed with exit code $buildExit."
}

if (-not (Test-Path "dist")) {
    Write-Error "Build failed: dist/ directory not created."
}

Write-Host "`nVerifying build output..." -ForegroundColor Yellow
$indexHtml = Get-ChildItem -Path "dist" -Filter "index.html" -Recurse
if (-not $indexHtml) {
    Write-Error "Build verification failed: index.html not found in dist/"
}

$jsFiles = Get-ChildItem -Path "dist/assets" -Filter "*.js" -ErrorAction SilentlyContinue
if (-not $jsFiles) {
    Write-Error "Build verification failed: no JS bundles found in dist/assets/"
}

Write-Host "`nBuild complete!" -ForegroundColor Green
Write-Host "Output: $(Resolve-Path "dist")" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Copy the contents of dist/ to your IIS site directory"
Write-Host "  2. Ensure IIS URL Rewrite and ARR modules are installed"
Write-Host "  3. Configure ARR reverse proxy for /api/* to your Django backend"
Write-Host "  4. Ensure web.config is present in the deployed directory"
