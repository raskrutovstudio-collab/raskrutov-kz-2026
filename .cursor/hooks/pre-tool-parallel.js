/**
 * SINGLE USER MODE — preToolUse
 *
 * SESSION LOCK = DISABLED
 * Never deny for missing/stale session marker or session owner mismatch.
 * Soft branch safety only when machine config is present.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function emit(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

function deny(message) {
  emit({ permission: 'deny', user_message: message, agent_message: message });
}

function allow() {
  emit({ permission: 'allow' });
}

try {
  fs.readFileSync(0, 'utf8');

  const root = path.resolve(__dirname, '..', '..');
  const gitDir = path.join(root, '.git');
  const machinePath = path.join(gitDir, 'cursor-machine-id.json');

  // No machine config → allow (single-user, session lock disabled).
  if (!fs.existsSync(machinePath)) {
    allow();
    process.exit(0);
  }

  let expected = null;
  try {
    const cfg = JSON.parse(fs.readFileSync(machinePath, 'utf8').replace(/^\uFEFF/, ''));
    expected = cfg.machine_name === 'PC1' ? 'work/pc1' : cfg.machine_name === 'PC2' ? 'work/pc2' : null;
  } catch {
    allow();
    process.exit(0);
  }

  if (!expected) {
    allow();
    process.exit(0);
  }

  let current = '';
  try {
    current = execFileSync('git', ['-C', root, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
  } catch {
    allow();
    process.exit(0);
  }

  // Real risk: writing on an unexpected branch.
  if (current && current !== expected && current !== 'plesk') {
    deny(`GIT SAFETY: unexpected branch '${current}'. Expected '${expected}'.`);
    process.exit(0);
  }

  // Stale/missing session marker must NEVER block in single-user mode.
  allow();
} catch (err) {
  // Prefer allow on hook errors — protect files via agent policy, not hard session deny.
  allow();
}
