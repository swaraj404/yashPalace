// Publishes the site to Cloudflare.
//   First launch, on workers.dev:      npm run deploy
//   Once yashpalace.com is connected:  npm run deploy:domain
import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { requireLiveDatabase, runWrangler } from './wrangler.js';

const DOMAINS = ['yashpalace.com', 'admin.yashpalace.com'];

requireLiveDatabase();
const build = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);

await runWrangler(['d1', 'migrations', 'apply', 'yash-palace', '--remote']);
const videoBytes = statSync('dist/assets/venue-tour.mp4').size;
const domainArgs = process.argv.includes('--with-domains')
  ? DOMAINS.flatMap((domain) => ['--domain', domain])
  : [];
await runWrangler(['deploy', '--var', `HERO_VIDEO_BYTES:${videoBytes}`, ...domainArgs]);
