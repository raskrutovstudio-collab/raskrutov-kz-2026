$ErrorActionPreference = "Stop"

$repo = (Get-Location).Path
$before = Join-Path $repo ".cursor\hooks\before-submit-parallel.ps1"
$after  = Join-Path $repo ".cursor\hooks\after-response-parallel.ps1"

if (-not (Test-Path $before)) { throw "Не найден $before. Запустите скрипт из корня raskrutov-kz-2026." }
if (-not (Test-Path $after))  { throw "Не найден $after. Запустите скрипт из корня raskrutov-kz-2026." }

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
Copy-Item $before "$before.bak-$stamp"
Copy-Item $after  "$after.bak-$stamp"

$beforeContent = @'
$ErrorActionPreference = "Stop"

function Emit-Result {
    param([bool]$Continue, [string]$Message = "")
    $obj = [ordered]@{ continue = $Continue }
    if ($Message) { $obj["user_message"] = $Message }
    [Console]::Out.WriteLine(($obj | ConvertTo-Json -Compress))
    [Console]::Out.Flush()
}

try {
    $null = [Console]::In.ReadToEnd()
    $lib = Join-Path $PSScriptRoot "..\..\scripts\parallel-work-lib.ps1"
    . (Resolve-Path $lib)

    $root = Get-ParallelRepoRoot
    Assert-ParallelRepository -RepoRoot $root
    $ctx = Assert-OwnWorkBranch -RepoRoot $root

    if (-not (Test-WorkingTreeClean -RepoRoot $root)) {
        if (Test-ParallelSessionMarker -RepoRoot $root -MachineConfig $ctx.machine -WorkBranch $ctx.branch) {
            Emit-Result -Continue $true -Message "PARALLEL WORK: обнаружены незавершённые изменения текущей безопасной сессии $($ctx.branch). Разрешено продолжить и исправить эту же задачу."
            exit 0
        }

        Emit-Result -Continue $false -Message "PARALLEL WORK BLOCKED: рабочее дерево содержит незавершённые изменения без активной безопасной сессии. Сначала завершите или сохраните предыдущую задачу."
        exit 0
    }

    $sync = Sync-WorkBranchToMain -RepoRoot $root -WorkBranch $ctx.branch
    New-ParallelSessionMarker -RepoRoot $root -MachineConfig $ctx.machine -WorkBranch $ctx.branch

    Emit-Result -Continue $true -Message "PARALLEL WORK: $($ctx.machine.machine_name) / $($ctx.branch) синхронизирован с main. Можно работать."
    exit 0
}
catch {
    Emit-Result -Continue $false -Message "PARALLEL WORK BLOCKED: $($_.Exception.Message)"
    exit 0
}
'@

$afterContent = @'
$ErrorActionPreference = "SilentlyContinue"

function Emit([string]$Message) {
    $obj = [ordered]@{}
    if ($Message) { $obj["user_message"] = $Message }
    [Console]::Out.WriteLine(($obj | ConvertTo-Json -Compress))
    [Console]::Out.Flush()
}

try {
    $null = [Console]::In.ReadToEnd()
    $lib = Join-Path $PSScriptRoot "..\..\scripts\parallel-work-lib.ps1"
    . (Resolve-Path $lib)

    $root = Get-ParallelRepoRoot
    $ctx = Assert-OwnWorkBranch -RepoRoot $root

    if (-not (Test-ParallelSessionMarker -RepoRoot $root -MachineConfig $ctx.machine -WorkBranch $ctx.branch)) {
        Emit ""
        exit 0
    }

    $changes = @(& git -C $root status --porcelain)
    $dirty = $changes.Count -gt 0 -and -not [string]::IsNullOrWhiteSpace(($changes -join ""))

    if (-not $dirty) {
        Remove-ParallelSessionMarker -RepoRoot $root
        Emit "PARALLEL WORK: изменений нет."
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
        Emit "PARALLEL WORK: quality:all не пройден. Изменения сохранены, безопасная сессия оставлена активной. Исправьте эту же задачу и повторите проверку."
        exit 0
    }

    & git -C $root add -A
    if ($LASTEXITCODE -ne 0) { throw "git add завершился ошибкой." }

    $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $message = "auto($($ctx.machine.machine_name)): Cursor task $stamp"
    & git -C $root commit -m $message
    if ($LASTEXITCODE -ne 0) { throw "git commit завершился ошибкой." }

    & git -C $root push origin $ctx.branch
    if ($LASTEXITCODE -ne 0) { throw "git push завершился ошибкой." }

    Remove-ParallelSessionMarker -RepoRoot $root
    Emit "PARALLEL WORK: изменения проверены, закоммичены и отправлены в $($ctx.branch). GitHub интегрирует их в main автоматически."
    exit 0
}
catch {
    Emit "PARALLEL WORK AUTO-SYNC STOPPED: $($_.Exception.Message). Изменения не потеряны; безопасная сессия сохранена для продолжения этой же задачи."
    exit 0
}
'@

Set-Content -LiteralPath $before -Value $beforeContent -Encoding UTF8
Set-Content -LiteralPath $after  -Value $afterContent  -Encoding UTF8

Write-Host ""
Write-Host "Готово. Хуки обновлены."
Write-Host "Резервные копии:"
Write-Host "  $before.bak-$stamp"
Write-Host "  $after.bak-$stamp"
Write-Host ""
Write-Host "Проверка git status:"
git status --short
