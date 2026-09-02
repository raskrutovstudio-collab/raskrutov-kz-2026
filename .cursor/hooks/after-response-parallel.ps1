$ErrorActionPreference = "SilentlyContinue"

# SINGLE USER MODE — afterAgentResponse counterpart
# Session marker is optional; missing/stale marker must not skip auto-sync.

function Emit([string]$Message) {
    $obj = [ordered]@{}
    if ($Message) { $obj["user_message"] = $Message }
    [Console]::Out.WriteLine(($obj | ConvertTo-Json -Compress))
    [Console]::Out.Flush()
}

try {
    $null = [Console]::In.ReadToEnd()

    $root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
    $gitDir = Join-Path $root ".git"
    $machinePath = Join-Path $gitDir "cursor-machine-id.json"
    $sessionPath = Join-Path $gitDir "cursor-parallel-session.json"

    if (-not (Test-Path -LiteralPath $machinePath)) {
        Emit "SINGLE USER AUTO-SYNC STOPPED: machine config is missing."
        exit 0
    }

    $cfg = Get-Content -LiteralPath $machinePath -Raw -Encoding UTF8 | ConvertFrom-Json
    $expected = $null
    if ($cfg.machine_name -eq "PC1") { $expected = "work/pc1" }
    elseif ($cfg.machine_name -eq "PC2") { $expected = "work/pc2" }

    if (-not $expected) {
        Emit "SINGLE USER AUTO-SYNC STOPPED: invalid machine config."
        exit 0
    }

    $branch = (git -C $root branch --show-current 2>$null | Out-String).Trim()
    if ($branch -ne $expected) {
        Emit "SINGLE USER AUTO-SYNC STOPPED: expected branch $expected, current branch $branch."
        exit 0
    }

    $changes = @(& git -C $root status --porcelain)
    $dirty = $changes.Count -gt 0 -and -not [string]::IsNullOrWhiteSpace(($changes -join ""))

    if (-not $dirty) {
        if (Test-Path -LiteralPath $sessionPath) { Remove-Item -LiteralPath $sessionPath -Force -ErrorAction SilentlyContinue }
        Emit "SINGLE USER: изменений нет."
        exit 0
    }

    Push-Location $root
    try {
        & npm run quality:all
        $qualityCode = $LASTEXITCODE
    } finally {
        Pop-Location
    }

    if ($qualityCode -ne 0) {
        Emit "SINGLE USER: quality:all не пройден. Изменения сохранены локально. Исправьте эту же задачу и повторите проверку."
        exit 0
    }

    & git -C $root add -A
    if ($LASTEXITCODE -ne 0) { throw "git add завершился ошибкой." }

    $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $message = "auto($($cfg.machine_name)): Cursor task $stamp"
    & git -C $root commit -m $message
    if ($LASTEXITCODE -ne 0) { throw "git commit завершился ошибкой." }

    & git -C $root push origin $expected
    if ($LASTEXITCODE -ne 0) { throw "git push завершился ошибкой." }

    if (Test-Path -LiteralPath $sessionPath) { Remove-Item -LiteralPath $sessionPath -Force -ErrorAction SilentlyContinue }
    Emit "SINGLE USER: изменения проверены, закоммичены и отправлены в $expected."
    exit 0
}
catch {
    Emit "SINGLE USER AUTO-SYNC STOPPED: $($_.Exception.Message). Изменения не потеряны."
    exit 0
}
