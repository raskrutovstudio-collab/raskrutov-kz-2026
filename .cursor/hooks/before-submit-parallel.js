/**
 * SINGLE USER MODE — beforeSubmitPrompt
 *
 * SESSION LOCK = DISABLED
 * GIT SAFETY = ENABLED
 *
 * Never block for missing/stale Cursor session, dirty tree alone,
 * or "wait for main integration / resubmit prompt".
 * Soft-refresh optional session marker for finalize convenience.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function emit(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

function allow(message) {
  emit({ continue: true, user_message: message });
}

function block(message) {
  emit({ continue: false, user_message: message });
}

function runGit(root, args) {
  const result = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    windowsHide: true,
  });
  return {
    code: result.status == null ? 1 : result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

try {
  fs.readFileSync(0, 'utf8');

  const root = path.resolve(__dirname, '..', '..');
  const gitDir = path.join(root, '.git');
  const machinePath = path.join(gitDir, 'cursor-machine-id.json');
  const sessionPath = path.join(gitDir, 'cursor-parallel-session.json');

  if (!fs.existsSync(gitDir)) {
    block('GIT SAFETY: Git repository was not found.');
    process.exit(0);
  }

  let machineName = 'PC1';
  let machineId = 'single-user';
  let expected = 'work/pc1';

  if (fs.existsSync(machinePath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(machinePath, 'utf8').replace(/^\uFEFF/, ''));
      if (cfg.machine_name === 'PC1' || cfg.machine_name === 'PC2') {
        machineName = cfg.machine_name;
        expected = cfg.machine_name === 'PC1' ? 'work/pc1' : 'work/pc2';
      }
      if (cfg.machine_id) machineId = cfg.machine_id;
    } catch {
      // Machine config optional in single-user mode.
    }
  }

  const current = runGit(root, ['branch', '--show-current']);
  const branch = current.stdout || '(detached)';

  if (current.code === 0 && branch && branch !== expected && branch !== 'plesk') {
    // Unexpected branch is a real safety risk — stop only then.
    block(`GIT SAFETY: unexpected branch '${branch}'. Expected '${expected}' (or explicit production work on plesk).`);
    process.exit(0);
  }

  const status = runGit(root, ['status', '--porcelain']);
  const dirty = status.code === 0 && Boolean(status.stdout);

  // Best-effort fetch; failure must not block single-user work.
  runGit(root, ['fetch', 'origin', '--prune']);

  const startHead = runGit(root, ['rev-parse', 'HEAD']);
  const head = startHead.code === 0 ? startHead.stdout : '';

  // Soft session marker for finalize convenience — never required to continue.
  try {
    fs.writeFileSync(sessionPath, JSON.stringify({
      mode: 'single-user',
      machine_name: machineName,
      machine_id: machineId,
      branch: branch === expected ? expected : branch,
      start_head: head,
      started_at: new Date().toISOString(),
      session_lock: 'disabled',
    }, null, 2), 'utf8');
  } catch {
    // Marker write failure is non-blocking.
  }

  if (dirty) {
    allow(`SINGLE USER: dirty working tree detected on ${branch}. Investigate, do not auto-block. CONTINUE.`);
  } else {
    allow(`SINGLE USER: ${machineName} / ${branch} — working tree clean. CONTINUE (session lock disabled).`);
  }
} catch (err) {
  const message = err && err.message ? err.message.replace(/[\r\n]+/g, ' ') : 'unknown error';
  // Prefer continue on unexpected hook errors in single-user mode,
  // unless we already emitted a real GIT SAFETY block above.
  allow(`SINGLE USER: before-submit soft-check warning: ${message}. CONTINUE.`);
}
