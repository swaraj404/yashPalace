import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const packageFile = require.resolve('wrangler/package.json');
export const wranglerBin = join(dirname(packageFile), 'bin', 'wrangler.js');

export const runWrangler = (args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [wranglerBin, ...args], {
      stdio: 'inherit',
      ...options,
      env: { ...process.env, CI: '1', ...options.env },
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`wrangler ${args[0]} failed with code ${code}`))
    );
  });

export function requireLiveDatabase() {
  if (readFileSync('wrangler.jsonc', 'utf8').includes('00000000-0000-0000-0000-000000000000')) {
    console.error(
      'Create the database first: run "npx wrangler d1 create yash-palace", then paste its ' +
        'database_id into wrangler.jsonc.'
    );
    process.exit(1);
  }
}
