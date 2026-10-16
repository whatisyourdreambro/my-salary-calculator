// Own the deny proxy for the complete Lighthouse child-process lifetime.
// This wrapper accepts no CLI overrides that could replace its guarded config.
import { spawn } from 'node:child_process';
import qaSafety from './lib/qa-safety.cjs';
const { assertLocalQaTarget, startQaDenyProxy } = qaSafety;
if (process.argv.length !== 2) throw new Error('qa:lighthouse does not accept configuration or URL overrides.');
const base = assertLocalQaTarget(process.env.BASE_URL || 'http://127.0.0.1:3000');
if (!process.env.npm_execpath) throw new Error('Run npm run qa:lighthouse after npm run qa:build.');
const proxy = await startQaDenyProxy();
try {
  const child = spawn(process.execPath, [process.env.npm_execpath, 'exec', '--yes', '--package=@lhci/cli@0.15.1',
    '--', 'lhci', 'autorun', '--config=lighthouserc.cjs'], {
    stdio: 'inherit', env: { ...process.env, BASE_URL: base, NEXT_PUBLIC_ADS_DISABLED: '1', MSY_QA_MODE: '1',
      MSY_QA_PROXY_PORT: String(proxy.port) },
  });
  const stop = () => child.kill('SIGTERM');
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  try {
    process.exitCode = await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', code => resolve(code ?? 1));
    });
  } finally {
    process.removeListener('SIGINT', stop);
    process.removeListener('SIGTERM', stop);
  }
} finally { await proxy.close(); }
