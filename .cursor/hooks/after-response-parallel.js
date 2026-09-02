const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function emit(message = '') {
  const obj = {};
  if (message) obj.user_message = message;
  process.stdout.write(JSON.stringify(obj) + '\n');
}

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
  });
  return {
    code: result.status == null ? 1 : result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    error: result.error,
  };
}

function cleanup(sessionPath) {
  try {
    if (fs.existsSync(sessionPath)) fs.unlinkSync(sessionPath);
  } catch {}
}

try {
  fs.readFileSync(0, 'utf8');

  const root = path.resolve(__dirname, '..', '..');
  const gitDir = path.join(root, '.git');
  const machinePath = path.join(gitDir, 'cursor-machine-id.json');
  const sessionPath = path.join(gitDir, 'cursor-parallel-session.json');

  if (!fs.existsSync(machinePath)) {
    emit('PARALLEL WORK AUTO-SYNC STOPPED: machine config is missing.');
    process.exit(0);
  }

  const cfg = JSON.parse(fs.readFileSync(machinePath, 'utf8').replace(/^\uFEFF/, ''));
  const expected = cfg.machine_name === 'PC1' ? 'work/pc1' : cfg.machine_name === 'PC2' ? 'work/pc2' : null;
  if (!expected || !cfg.machine_id) {
    cleanup(sessionPath);
    emit('PARALLEL WORK AUTO-SYNC STOPPED: invalid machine config.');
    process.exit(0);
  }

  const current = run('git', ['-C', root, 'branch', '--show-current'], root);
  if (current.code !== 0 || current.stdout !== expected) {
    cleanup(sessionPath);
    emit(`PARALLEL WORK AUTO-SYNC STOPPED: expected branch ${expected}, current branch ${current.stdout || '(detached)'}.`);
    process.exit(0);
  }

  // SINGLE USER: session marker optional — do not skip auto-sync only because marker is missing/stale.
  if (fs.existsSync(sessionPath)) {
    try {
      const marker = JSON.parse(fs.readFileSync(sessionPath, 'utf8').replace(/^\uFEFF/, ''));
      if (marker.machine_id && marker.machine_id !== cfg.machine_id) {
        // stale marker from another identity — ignore, continue
      }
    } catch {
      // unreadable marker — ignore
    }
  }

  const status = run('git', ['-C', root, 'status', '--porcelain'], root);
  if (status.code !== 0) {
    emit('SINGLE USER AUTO-SYNC STOPPED: could not read working tree status.');
    process.exit(0);
  }

  if (!status.stdout) {
    cleanup(sessionPath);
    emit('SINGLE USER: no changes.');
    process.exit(0);
  }

  const quality = run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'quality:all'], root);
  if (quality.code !== 0) {
    const detail = (quality.stderr || quality.stdout || '').split(/\r?\n/).slice(-8).join(' | ');
    emit(`SINGLE USER: quality:all failed. Changes remain local; automatic commit/push stopped.${detail ? ' ' + detail : ''}`);
    process.exit(0);
  }

  const add = run('git', ['-C', root, 'add', '-A'], root);
  if (add.code !== 0) throw new Error(`git add failed: ${add.stderr || add.stdout}`);

  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const message = `auto(${cfg.machine_name}): Cursor task ${stamp}`;

  const commit = run('git', ['-C', root, 'commit', '-m', message], root);
  if (commit.code !== 0) throw new Error(`git commit failed: ${commit.stderr || commit.stdout}`);

  const push = run('git', ['-C', root, 'push', 'origin', expected], root);
  if (push.code !== 0) throw new Error(`git push failed: ${push.stderr || push.stdout}`);

  cleanup(sessionPath);
  emit(`SINGLE USER: changes passed quality checks, were committed, and pushed to ${expected}.`);
} catch (err) {
  try {
    const root = path.resolve(__dirname, '..', '..');
    // Do not wipe unknown work; only clear optional session marker.
    const sessionPath = path.join(root, '.git', 'cursor-parallel-session.json');
    if (fs.existsSync(sessionPath)) fs.unlinkSync(sessionPath);
  } catch {}
  const message = err && err.message ? err.message.replace(/[\r\n]+/g, ' ') : 'unknown error';
  emit(`SINGLE USER AUTO-SYNC STOPPED: ${message}. Changes were not discarded.`);
}
