const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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
    error: result.error ? String(result.error.message || result.error) : '',
  };
}

function runNpm(root, args) {
  if (process.platform === 'win32') {
    // .cmd files cannot be spawned reliably with shell:false on Windows.
    // Route npm.cmd through cmd.exe to avoid spawnSync EINVAL while keeping
    // the hook independent from PowerShell execution policy.
    const comspec = process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe';
    return run(comspec, ['/d', '/s', '/c', 'npm.cmd', ...args], root);
  }
  return run('npm', args, root);
}

function appendLog(logPath, message) {
  try {
    fs.appendFileSync(logPath, `${new Date().toISOString()} ${message}\n`, 'utf8');
  } catch {}
}

function emitEmpty() {
  process.stdout.write('{}\n');
}

try {
  fs.readFileSync(0, 'utf8');

  const root = path.resolve(__dirname, '..', '..');
  const gitDir = path.join(root, '.git');
  const machinePath = path.join(gitDir, 'cursor-machine-id.json');
  const sessionPath = path.join(gitDir, 'cursor-parallel-session.json');
  const logPath = path.join(gitDir, 'cursor-parallel-finalize.log');

  appendLog(logPath, 'FINALIZER START');

  if (!fs.existsSync(machinePath)) {
    appendLog(logPath, 'STOP: machine config missing');
    emitEmpty();
    process.exit(0);
  }

  const cfg = JSON.parse(fs.readFileSync(machinePath, 'utf8').replace(/^\uFEFF/, ''));
  const expected = cfg.machine_name === 'PC1' ? 'work/pc1' : cfg.machine_name === 'PC2' ? 'work/pc2' : null;
  if (!expected || !cfg.machine_id) {
    appendLog(logPath, 'STOP: invalid machine config');
    emitEmpty();
    process.exit(0);
  }

  const current = run('git', ['-C', root, 'branch', '--show-current'], root);
  appendLog(logPath, `branch=${current.stdout} code=${current.code}`);
  if (current.code !== 0 || current.stdout !== expected) {
    appendLog(logPath, `STOP: expected ${expected}`);
    emitEmpty();
    process.exit(0);
  }

  if (!fs.existsSync(sessionPath)) {
    appendLog(logPath, 'STOP: no active session marker');
    emitEmpty();
    process.exit(0);
  }

  const marker = JSON.parse(fs.readFileSync(sessionPath, 'utf8').replace(/^\uFEFF/, ''));
  if (marker.machine_id !== cfg.machine_id || marker.branch !== expected) {
    appendLog(logPath, 'STOP: session marker mismatch');
    try { fs.unlinkSync(sessionPath); } catch {}
    emitEmpty();
    process.exit(0);
  }

  const status = run('git', ['-C', root, 'status', '--porcelain'], root);
  appendLog(logPath, `status code=${status.code} changes=${status.stdout ? 'yes' : 'no'}`);
  if (status.code !== 0) {
    appendLog(logPath, `STOP: git status failed ${status.stderr || status.error}`);
    emitEmpty();
    process.exit(0);
  }

  if (!status.stdout) {
    try { fs.unlinkSync(sessionPath); } catch {}
    appendLog(logPath, 'DONE: no changes');
    emitEmpty();
    process.exit(0);
  }

  const quality = runNpm(root, ['run', 'quality:all']);
  appendLog(logPath, `quality code=${quality.code}`);
  if (quality.code !== 0) {
    appendLog(logPath, `STOP: quality failed ${quality.stderr || quality.stdout || quality.error}`);
    emitEmpty();
    process.exit(0);
  }

  const add = run('git', ['-C', root, 'add', '-A'], root);
  appendLog(logPath, `add code=${add.code}`);
  if (add.code !== 0) {
    appendLog(logPath, `STOP: git add failed ${add.stderr || add.stdout || add.error}`);
    emitEmpty();
    process.exit(0);
  }

  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const message = `auto(${cfg.machine_name}): Cursor task ${stamp}`;

  const commit = run('git', ['-C', root, 'commit', '-m', message], root);
  appendLog(logPath, `commit code=${commit.code}`);
  if (commit.code !== 0) {
    appendLog(logPath, `STOP: commit failed ${commit.stderr || commit.stdout || commit.error}`);
    emitEmpty();
    process.exit(0);
  }

  const push = run('git', ['-C', root, 'push', 'origin', expected], root);
  appendLog(logPath, `push code=${push.code}`);
  if (push.code !== 0) {
    appendLog(logPath, `STOP: push failed ${push.stderr || push.stdout || push.error}`);
    emitEmpty();
    process.exit(0);
  }

  try { fs.unlinkSync(sessionPath); } catch {}
  appendLog(logPath, `DONE: committed and pushed ${expected}`);
  emitEmpty();
} catch (err) {
  try {
    const root = path.resolve(__dirname, '..', '..');
    appendLog(path.join(root, '.git', 'cursor-parallel-finalize.log'), `FATAL: ${String(err && err.stack || err)}`);
  } catch {}
  emitEmpty();
}
