$ErrorActionPreference = "Stop"

# SINGLE USER MODE — beforeSubmitPrompt (PowerShell counterpart)
# SESSION LOCK = DISABLED; GIT SAFETY = ENABLED

function Emit-Result {
    param([bool]$Continue, [string]$Message = "")
    $obj = [ordered]@{ continue = $Continue }
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

    if (-not (Test-Path -LiteralPath $gitDir)) {
        Emit-Result -Continue $false -Message "GIT SAFETY: Git repository was not found."
        exit 0
    }

    $machineName = "PC1"
    $machineId = "single-user"
    $expected = "work/pc1"

    if (Test-Path -LiteralPath $machinePath) {
        try {
            $cfg = Get-Content -LiteralPath $machinePath -Raw -Encoding UTF8 | ConvertFrom-Json
            if ($cfg.machine_name -eq "PC1" -or $cfg.machine_name -eq "PC2") {
                $machineName = [string]$cfg.machine_name
                $expected = if ($machineName -eq "PC1") { "work/pc1" } else { "work/pc2" }
            }
            if ($cfg.machine_id) { $machineId = [string]$cfg.machine_id }
        } catch {
            # optional
        }
    }

    $branch = (git -C $root branch --show-current 2>$null | Out-String).Trim()
    if ($branch -and $branch -ne $expected -and $branch -ne "plesk") {
        Emit-Result -Continue $false -Message "GIT SAFETY: unexpected branch '$branch'. Expected '$expected' (or explicit production work on plesk)."
        exit 0
    }

    $porcelain = (git -C $root status --porcelain 2>$null | Out-String).Trim()
    $dirty = [bool]$porcelain

    try { git -C $root fetch origin --prune 2>$null | Out-Null } catch { }

    $head = (git -C $root rev-parse HEAD 2>$null | Out-String).Trim()

    try {
        $marker = [ordered]@{
            mode = "single-user"
            machine_name = $machineName
            machine_id = $machineId
            branch = $(if ($branch -eq $expected) { $expected } else { $branch })
            start_head = $head
            started_at = [DateTime]::UtcNow.ToString("o")
            session_lock = "disabled"
        }
        ($marker | ConvertTo-Json) | Set-Content -LiteralPath $sessionPath -Encoding UTF8
    } catch { }

    if ($dirty) {
        Emit-Result -Continue $true -Message "SINGLE USER: dirty working tree detected on $branch. Investigate, do not auto-block. CONTINUE."
    } else {
        Emit-Result -Continue $true -Message "SINGLE USER: $machineName / $branch — working tree clean. CONTINUE (session lock disabled)."
    }
    exit 0
}
catch {
    Emit-Result -Continue $true -Message ("SINGLE USER: before-submit soft-check warning: {0}. CONTINUE." -f $_.Exception.Message)
    exit 0
}
