const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

function emit(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

function block(message) {
  emit({ continue: false, user_message: message });
}

function allow(message) {
  emit({ continue: true, user_message: message });
}

function runGit(root, args, options = {}) {
  const result = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    windowsHide: true,
    ...options,
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
    block('PARALLEL WORK BLOCKED: Git repository was not found.');
    process.exit(0);
  }
  if (!fs.existsSync(machinePath)) {
    block('PARALLEL WORK BLOCKED: machine config is missing. Run setup-parallel-work.cmd.');
    process.exit(0);
  }

  const cfg = JSON.parse(fs.readFileSync(machinePath, 'utf8').replace(/^\uFEFF/, ''));
  const expected = cfg.machine_name === 'PC1' ? 'work/pc1' : cfg.machine_name === 'PC2' ? 'work/pc2' : null;
  if (!expected || !cfg.machine_id) {
    block('PARALLEL WORK BLOCKED: invalid machine config.');
    process.exit(0);
  }

  const remote = runGit(root, ['remote', 'get-url', 'origin']);
  if (remote.code !== 0 || !remote.stdout.toLowerCase().includes('raskrutovstudio-collab/raskrutov-kz-2026')) {
    block(`PARALLEL WORK BLOCKED: unexpected origin: ${remote.stdout || remote.stderr || '(missing)'}`);
    process.exit(0);
  }

  const current = runGit(root, ['branch', '--show-current']);
  if (current.code !== 0 || current.stdout !== expected) {
    block(`PARALLEL WORK BLOCKED: expected branch ${expected}, current branch ${current.stdout || '(detached)'}.`);
    process.exit(0);
  }

  const status = runGit(root, ['status', '--porcelain']);
  if (status.code !== 0) {
    block('PARALLEL WORK BLOCKED: could not read working tree status.');
    process.exit(0);
  }
  if (status.stdout) {
    block('PARALLEL WORK BLOCKED: working tree has unfinished changes. Finish or save the previous task first.');
    process.exit(0);
  }

  const fetch = runGit(root, ['fetch', 'origin', '--prune']);
  if (fetch.code !== 0) {
    block(`PARALLEL WORK BLOCKED: git fetch failed: ${fetch.stderr || fetch.stdout}`);
    process.exit(0);
  }

  const headIsAncestor = runGit(root, ['merge-base', '--is-ancestor', 'HEAD', 'origin/main']);
  if (headIsAncestor.code === 0) {
    const ff = runGit(root, ['merge', '--ff-only', 'origin/main']);
    if (ff.code !== 0) {
      block(`PARALLEL WORK BLOCKED: fast-forward to origin/main failed: ${ff.stderr || ff.stdout}`);
      process.exit(0);
    }
  } else {
    const ahead = runGit(root, ['rev-list', '--count', 'origin/main..HEAD']);
    if (ahead.code !== 0) {
      block('PARALLEL WORK BLOCKED: could not calculate branch state.');
      process.exit(0);
    }
    if (Number(ahead.stdout || '0') > 0) {
      block(`PARALLEL WORK BLOCKED: previous work from ${expected} is not in main yet. Wait for GitHub Actions integration and resubmit.`);
      process.exit(0);
    }

    const remoteContainsHead = runGit(root, ['merge-base', '--is-ancestor', 'HEAD', `origin/${expected}`]);
    if (remoteContainsHead.code !== 0) {
      block('PARALLEL WORK BLOCKED: local and remote work branches diverged. Manual review is required.');
      process.exit(0);
    }

    block('PARALLEL WORK BLOCKED: work branch cannot be synchronized safely with main automatically.');
    process.exit(0);
  }

  const startHead = runGit(root, ['rev-parse', 'HEAD']);
  if (startHead.code !== 0) {
    block('PARALLEL WORK BLOCKED: could not resolve HEAD.');
    process.exit(0);
  }

  fs.writeFileSync(sessionPath, JSON.stringify({
    machine_name: cfg.machine_name,
    machine_id: cfg.machine_id,
    branch: expected,
    start_head: startHead.stdout,
    started_at: new Date().toISOString(),
  }, null, 2), 'utf8');

  allow(`PARALLEL WORK: ${cfg.machine_name} / ${expected} synced with main.`);
} catch (err) {
  const message = err && err.message ? err.message.replace(/[\r\n]+/g, ' ') : 'unknown error';
  block(`PARALLEL WORK BLOCKED: before-submit safety check failed: ${message}`);
}
