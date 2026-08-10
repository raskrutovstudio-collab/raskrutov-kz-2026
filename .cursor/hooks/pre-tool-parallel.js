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
  // Drain stdin so Cursor can finish writing the hook payload.
  fs.readFileSync(0, 'utf8');

  const root = path.resolve(__dirname, '..', '..');
  const gitDir = path.join(root, '.git');
  const machinePath = path.join(gitDir, 'cursor-machine-id.json');
  const sessionPath = path.join(gitDir, 'cursor-parallel-session.json');

  if (!fs.existsSync(machinePath)) {
    deny('PARALLEL WORK BLOCKED: machine config is missing. Run setup-parallel-work.cmd.');
    process.exit(0);
  }

  const cfg = JSON.parse(fs.readFileSync(machinePath, 'utf8').replace(/^\uFEFF/, ''));
  const expected = cfg.machine_name === 'PC1' ? 'work/pc1' : cfg.machine_name === 'PC2' ? 'work/pc2' : null;
  if (!expected) {
    deny('PARALLEL WORK BLOCKED: invalid machine_name in machine config.');
    process.exit(0);
  }

  const current = execFileSync('git', ['-C', root, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
  if (current !== expected) {
    deny(`PARALLEL WORK BLOCKED: expected branch ${expected}, current branch ${current || '(detached)'}.`);
    process.exit(0);
  }

  if (!fs.existsSync(sessionPath)) {
    deny(`PARALLEL WORK BLOCKED: no active safe Cursor session for ${expected}. Resubmit the prompt.`);
    process.exit(0);
  }

  const marker = JSON.parse(fs.readFileSync(sessionPath, 'utf8').replace(/^\uFEFF/, ''));
  if (marker.machine_id !== cfg.machine_id || marker.branch !== expected) {
    deny(`PARALLEL WORK BLOCKED: Cursor session marker does not match ${expected}. Resubmit the prompt.`);
    process.exit(0);
  }

  allow();
} catch (err) {
  const message = err && err.message ? err.message.replace(/[\r\n]+/g, ' ') : 'unknown error';
  deny(`PARALLEL WORK BLOCKED: pre-tool safety check failed: ${message}`);
}
