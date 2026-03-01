#!/usr/bin/env pwsh

Write-Host "Running security checks..." -ForegroundColor Cyan

$foundIssues = $false

# Check for hardcoded passwords in source code only
$dirs = @("src", "app", "pages", "components", "lib", "utils")
$existingDirs = $dirs | Where-Object { Test-Path $_ }

if ($existingDirs.Count -gt 0) {
    $passwordMatches = Get-ChildItem -Path $existingDirs -Recurse -Include *.ts,*.tsx,*.js -ErrorAction SilentlyContinue | 
        Select-String -Pattern "password\s*=\s*[`"`']" -ErrorAction SilentlyContinue

    if ($passwordMatches) {
        Write-Host "ERROR: Hardcoded passwords found in source code!" -ForegroundColor Red
        $passwordMatches | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" -ForegroundColor Yellow }
        $foundIssues = $true
    }

    # Check for API keys - look for long strings assigned to apikey variables
    $apiKeyMatches = Get-ChildItem -Path $existingDirs -Recurse -Include *.ts,*.tsx,*.js -ErrorAction SilentlyContinue | 
        Select-String -Pattern "apikey.*=.*[`"`'][a-zA-Z0-9]{20}" -ErrorAction SilentlyContinue

    if ($apiKeyMatches) {
        Write-Host "ERROR: Hardcoded API keys found in source code!" -ForegroundColor Red
        $apiKeyMatches | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" -ForegroundColor Yellow }
        $foundIssues = $true
    }
}

if ($foundIssues) {
    exit 1
}

Write-Host "SUCCESS: Security check passed - no hardcoded secrets found" -ForegroundColor Green
exit 0
