const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const mode = process.argv[2] || 'commit';
const root = path.resolve(__dirname, '..');
const gitDir = path.join(root, '.git');
const machinePath = path.join(gitDir, 'cursor-machine-id.json');

function fail(message) {
  process.stderr.write(`BLOCKED: parallel-work ${mode} safety check failed: ${message}\n`);
  process.exit(12);
}

function git(args) {
  const r = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
  });
  if (r.status !== 0) {
    fail((r.stderr || r.stdout || `git ${args.join(' ')} failed`).trim());
  }
  return (r.stdout || '').trim();
}

try {
  if (!fs.existsSync(machinePath)) fail('machine config is missing; run setup-parallel-work.cmd.');
  const cfg = JSON.parse(fs.readFileSync(machinePath, 'utf8').replace(/^\uFEFF/, ''));
  const expected = cfg.machine_name === 'PC1' ? 'work/pc1' : cfg.machine_name === 'PC2' ? 'work/pc2' : null;
  if (!expected) fail('invalid machine_name in machine config.');

  const origin = git(['remote', 'get-url', 'origin']).toLowerCase();
  if (!origin.includes('raskrutovstudio-collab/raskrutov-kz-2026')) fail(`unexpected origin: ${origin}`);

  const current = git(['branch', '--show-current']);
  if (current !== expected) fail(`expected branch ${expected}, current branch ${current || '(detached)'}.`);

  process.stdout.write(`Parallel work OK: ${cfg.machine_name} / ${expected}\n`);
  process.exit(0);
} catch (err) {
  fail(err && err.message ? err.message : String(err));
}
