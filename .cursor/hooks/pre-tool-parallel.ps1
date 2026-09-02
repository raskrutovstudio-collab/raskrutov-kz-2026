$ErrorActionPreference = "Stop"

# SINGLE USER MODE — preToolUse (PowerShell counterpart)
# SESSION LOCK = DISABLED; never deny for missing/stale session marker

function Emit-Deny {
    param([string]$Message)
    $obj = [ordered]@{
        permission = "deny"
        user_message = $Message
        agent_message = $Message
    }
    [Console]::Out.WriteLine(($obj | ConvertTo-Json -Compress))
    [Console]::Out.Flush()
}

function Emit-Allow {
    $obj = [ordered]@{ permission = "allow" }
    [Console]::Out.WriteLine(($obj | ConvertTo-Json -Compress))
    [Console]::Out.Flush()
}

try {
    $null = [Console]::In.ReadToEnd()

    $root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
    $machinePath = Join-Path $root ".git\cursor-machine-id.json"

    if (-not (Test-Path -LiteralPath $machinePath)) {
        Emit-Allow
        exit 0
    }

    $expected = $null
    try {
        $cfg = Get-Content -LiteralPath $machinePath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($cfg.machine_name -eq "PC1") { $expected = "work/pc1" }
        elseif ($cfg.machine_name -eq "PC2") { $expected = "work/pc2" }
    } catch {
        Emit-Allow
        exit 0
    }

    if (-not $expected) {
        Emit-Allow
        exit 0
    }

    $current = (git -C $root branch --show-current 2>$null | Out-String).Trim()
    if ($current -and $current -ne $expected -and $current -ne "plesk") {
        Emit-Deny "GIT SAFETY: unexpected branch '$current'. Expected '$expected'."
        exit 0
    }

    Emit-Allow
    exit 0
}
catch {
    Emit-Allow
    exit 0
}
