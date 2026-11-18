// Creates the owner login or resets its password.
//   On this computer:  npm run owner:setup
//   On the live site:  npm run owner:setup -- --remote
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import {
  MIN_PASSWORD_LENGTH, createVerifier, deriveLoginKey, normalizeUsername,
} from '../shared/password.js';
import { requireLiveDatabase, runWrangler } from './wrangler.js';

function ask(question, { hidden = false } = {}) {
  return new Promise((done) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (text) => {
        if (text.includes(question)) process.stdout.write(question);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      done(answer);
    });
  });
}

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const where = process.argv.includes('--remote') ? '--remote' : '--local';
if (where === '--remote') requireLiveDatabase();
const interactive = process.stdin.isTTY;
const username = normalizeUsername(
  process.env.OWNER_USERNAME ?? (interactive ? await ask('Owner username: ') : '')
);
if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
  fail('Use 3 to 40 letters, numbers, dots, dashes or underscores for the username.');
}
const password =
  process.env.OWNER_PASSWORD ?? (interactive ? await ask('New password: ', { hidden: true }) : '');
if (password.length < MIN_PASSWORD_LENGTH) {
  fail(`The password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
}
if (interactive && !process.env.OWNER_PASSWORD) {
  if ((await ask('Repeat password: ', { hidden: true })) !== password) {
    fail('The passwords did not match. Nothing was changed.');
  }
}

const verifier = await createVerifier(await deriveLoginKey(username, password));
const folder = mkdtempSync(join(tmpdir(), 'yash-palace-'));
const file = join(folder, 'owner.sql');
try {
  writeFileSync(
    file,
    `INSERT INTO owner (id, username, password_verifier) VALUES (1, '${username}', '${verifier}')
     ON CONFLICT (id) DO UPDATE SET username = excluded.username,
       password_verifier = excluded.password_verifier, updated_at = datetime('now');
     DELETE FROM sessions;
     DELETE FROM rate_limits WHERE key LIKE 'login:%';`,
    { mode: 0o600 }
  );
  await runWrangler(['d1', 'migrations', 'apply', 'yash-palace', where]);
  await runWrangler(['d1', 'execute', 'yash-palace', where, '--file', file]);
} finally {
  rmSync(folder, { recursive: true, force: true });
}
console.log(`Owner login saved for "${username}". All devices were signed out.`);
