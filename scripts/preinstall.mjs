import { unlinkSync } from 'node:fs';

for (const file of ['package-lock.json', 'yarn.lock']) {
  try {
    unlinkSync(file);
  } catch {
    // ignore if missing
  }
}

const agent = process.env.npm_config_user_agent || '';
const execPath = process.env.npm_execpath || '';
const isPnpm =
  agent.includes('pnpm') ||
  execPath.includes('pnpm') ||
  Boolean(process.env.PNPM_HOME);

// Only reject when another package manager is clearly in use (pnpm on Windows may omit user-agent).
if (agent && !isPnpm && (agent.includes('npm/') || agent.includes('yarn/'))) {
  console.error('Use pnpm instead of npm/yarn for this workspace.');
  process.exit(1);
}
