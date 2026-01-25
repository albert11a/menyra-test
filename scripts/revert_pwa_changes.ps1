# Revert PWA changes script (PowerShell)
# Restores backups from backups/pwa to original locations.
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path "$root\.."
$backupDir = Join-Path $repoRoot 'backups\pwa'

Write-Host "Reverting PWA files from $backupDir"

$items = @(
  @{ src = 'pwa.js.bak'; dst = 'apps\menyra-social\pwa.js' },
  @{ src = 'manifest.webmanifest.bak'; dst = 'apps\menyra-social\manifest.webmanifest' },
  @{ src = 'sw.js.bak'; dst = 'sw.js' }
)

foreach ($it in $items) {
  $src = Join-Path $backupDir $it.src
  $dst = Join-Path $repoRoot $it.dst
  if (Test-Path $src) {
    Copy-Item -Path $src -Destination $dst -Force
    Write-Host "Restored: $($it.dst)"
  } else {
    Write-Host "Backup not found: $src" -ForegroundColor Yellow
  }
}

Write-Host "Done. Please reload/clear app cache if necessary."