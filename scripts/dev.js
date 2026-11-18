// Runs the Cloudflare Worker and the Vite dev server together.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { runWrangler, wranglerBin } from './wrangler.js';

mkdirSync('dist', { recursive: true }); // Wrangler requires the assets folder to exist.
await runWrangler(['d1', 'migrations', 'apply', 'yash-palace', '--local']);

const children = [
  spawn(process.execPath, [wranglerBin, 'dev', '--port', '8787', '--ip', '127.0.0.1'], { stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { stdio: 'inherit' }),
];
const stop = () => children.forEach((child) => child.kill());
children.forEach((child) => child.on('exit', stop));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
