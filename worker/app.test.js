import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { before, beforeEach, test } from 'node:test';
import { handleRequest } from './index.js';
import { createVerifier, deriveLoginKey } from '../shared/password.js';

const TODAY = '2026-11-18';
const PASSWORD = 'correct horse battery';
const VIDEO = Uint8Array.from({ length: 1000 }, (_, i) => i % 256);

// Runs the same SQL as Cloudflare D1, on Node's built-in SQLite.
function fakeD1() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../migrations/0001_init.sql', import.meta.url), 'utf8'));
  const plain = (row) => (row ? { ...row } : null);
  const statement = (sql, values = []) => ({
    sql,
    values,
    bind: (...next) => statement(sql, next),
    first: async () => plain(sqlite.prepare(sql).get(...values)),
    all: async () => ({ results: sqlite.prepare(sql).all(...values).map(plain) }),
    run: async () => ({ meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } }),
  });
  return {
    sqlite,
    prepare: (sql) => statement(sql),
    batch: async (statements) => {
      sqlite.exec('BEGIN');
      try {
        const results = [];
        for (const s of statements) {
          results.push(/^\s*SELECT/i.test(s.sql) ? await s.all() : await s.run());
        }
        sqlite.exec('COMMIT');
        return results;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
}

const assets = {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname === '/assets/venue-tour.mp4') {
      return new Response(VIDEO, { headers: { ETag: '"video-1"' } });
    }
    return new Response(`<title>${pathname}</title>`);
  },
};

let env;
let cookie;
let loginKey;

function call(path, { method = 'GET', body, host = 'admin.test', auth = true, origin, headers = {} } = {}) {
  const all = new Headers(headers);
  if (body !== undefined) all.set('Content-Type', 'application/json');
  if (method !== 'GET' && method !== 'HEAD') all.set('Origin', origin ?? `https://${host}`);
  if (auth && cookie) all.set('Cookie', cookie);
  const request = new Request(`https://${host}${path}`, {
    method, headers: all, body: body === undefined ? undefined : JSON.stringify(body),
  });
  return handleRequest(request, env, { today: TODAY });
}
const data = async (res) => ({ status: res.status, json: await res.json() });
const post = (path, body, options) => call(path, { method: 'POST', body, ...options });
const login = (key = loginKey, username = 'owner') =>
  post('/api/admin/login', { username, loginKey: key }, { auth: false });
const cookieFrom = (res) => res.headers.get('Set-Cookie').split(';')[0];

const booking = (over = {}) => ({
  clientName: 'Asha Kulkarni', phone: '9876543210', eventType: 'Wedding',
  startDate: '2026-12-10', endDate: '2026-12-12', finalAmount: 250000, amountReceived: 50000,
  notes: 'Private note', ...over,
});

before(async () => {
  loginKey = await deriveLoginKey('owner', PASSWORD);
});

beforeEach(async () => {
  env = { DB: fakeD1(), ASSETS: assets, ADMIN_HOST: 'admin.test' };
  env.DB.sqlite.prepare('INSERT INTO owner (id, username, password_verifier) VALUES (1, ?, ?)')
    .run('owner', await createVerifier(loginKey));
  cookie = null;
  cookie = cookieFrom(await login());
});

test('session cookie is locked down and the password never leaves the browser', async () => {
  const value = (await login()).headers.get('Set-Cookie');
  assert.match(value, /^__Host-yp_session=/);
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/']) {
    assert.ok(value.includes(flag), flag);
  }
  const { password_verifier: stored } = env.DB.sqlite.prepare('SELECT password_verifier FROM owner').get();
  assert.ok(!stored.includes(loginKey));
  assert.equal((await post('/api/admin/login', { username: 'owner', password: PASSWORD }, { auth: false })).status, 401);
});

test('owner data requires a session', async () => {
  for (const path of ['/api/admin/data', '/api/admin/me']) {
    assert.equal((await call(path, { auth: false })).status, 401);
  }
  assert.equal((await post('/api/admin/bookings', booking(), { auth: false })).status, 401);
});

test('owner API does not exist on the public site', async () => {
  assert.equal((await call('/api/admin/data', { host: 'yashpalace.test' })).status, 404);
  assert.equal((await post('/api/admin/login', {}, { host: 'yashpalace.test', auth: false })).status, 404);
});

test('cross-site writes are rejected', async () => {
  const res = await post('/api/admin/bookings', booking(), { origin: 'https://evil.test' });
  assert.equal(res.status, 403);
  assert.equal((await data(await call('/api/admin/data'))).json.bookings.length, 0);
});

test('booking dates are inclusive and cannot overlap', async () => {
  assert.equal((await post('/api/admin/bookings', booking())).status, 201);
  for (const [startDate, endDate] of [
    ['2026-12-12', '2026-12-13'], ['2026-12-08', '2026-12-10'], ['2026-12-11', '2026-12-11'],
    ['2026-12-01', '2026-12-31'],
  ]) {
    const res = await data(await post('/api/admin/bookings', booking({ startDate, endDate })));
    assert.equal(res.status, 409, `${startDate}..${endDate}`);
    assert.match(res.json.error, /Asha Kulkarni/);
  }
  const next = await post('/api/admin/bookings', booking({ startDate: '2026-12-13', endDate: '2026-12-13' }));
  assert.equal(next.status, 201);
});

test('two simultaneous bookings cannot both take a date', async () => {
  const results = await Promise.all([
    post('/api/admin/bookings', booking()), post('/api/admin/bookings', booking()),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
});

test('a booking can be edited without clashing with itself', async () => {
  const { json } = await data(await post('/api/admin/bookings', booking()));
  const res = await data(await call(`/api/admin/bookings/${json.id}`, {
    method: 'PUT', body: booking({ endDate: '2026-12-14', amountReceived: 100000 }),
  }));
  assert.equal(res.status, 200);
  assert.equal(res.json.endDate, '2026-12-14');
  await post('/api/admin/bookings', booking({ startDate: '2026-12-20', endDate: '2026-12-20' }));
  const clash = await call(`/api/admin/bookings/${json.id}`, {
    method: 'PUT', body: booking({ endDate: '2026-12-20' }),
  });
  assert.equal(clash.status, 409);
  const missing = await call('/api/admin/bookings/999', { method: 'PUT', body: booking() });
  assert.equal(missing.status, 404);
});

test('bad booking values are rejected', async () => {
  const cases = [
    [{ clientName: ' ' }, 'clientName'], [{ startDate: '2026-02-30' }, 'startDate'],
    [{ endDate: '2026-12-01' }, 'endDate'], [{ finalAmount: -1 }, 'finalAmount'],
    [{ finalAmount: 10.5 }, 'finalAmount'], [{ amountReceived: 300000 }, 'amountReceived'],
    [{ phone: 'call me' }, 'phone'],
  ];
  for (const [change, field] of cases) {
    const res = await data(await post('/api/admin/bookings', booking(change)));
    assert.equal(res.status, 422, field);
    assert.equal(res.json.field, field);
  }
});

test('closed dates block bookings and reopen when removed', async () => {
  const block = await data(await post('/api/admin/blocks', {
    startDate: '2026-12-20', endDate: '2026-12-21', reason: 'Maintenance',
  }));
  assert.equal(block.status, 201);
  const clash = booking({ startDate: '2026-12-21', endDate: '2026-12-22' });
  assert.equal((await post('/api/admin/bookings', clash)).status, 409);
  await call(`/api/admin/blocks/${block.json.id}`, { method: 'DELETE' });
  assert.equal((await post('/api/admin/bookings', clash)).status, 201);
});

test('public availability shows dates only, from today onward', async () => {
  await post('/api/admin/bookings', booking({ startDate: '2026-11-17', endDate: '2026-11-19' }));
  await post('/api/admin/blocks', { startDate: '2026-11-25', endDate: '2026-11-25', reason: 'Family function' });
  const res = await call('/api/availability?from=2026-11-01&to=2026-11-30', { host: 'yashpalace.test', auth: false });
  const text = await res.text();
  assert.deepEqual(JSON.parse(text), { today: TODAY, unavailable: ['2026-11-18', '2026-11-19', '2026-11-25'] });
  for (const secret of ['Asha', '9876543210', '250000', 'Private', 'Family']) {
    assert.ok(!text.includes(secret), secret);
  }
});

test('public enquiries reach the owner and respect availability', async () => {
  await post('/api/admin/bookings', booking());
  const send = (over) => post('/api/enquiries', {
    name: 'Rahul', phone: '+91 98765 43210', eventType: 'Reception', eventDate: '2026-12-15', ...over,
  }, { host: 'yashpalace.test', auth: false });
  assert.equal((await send({ eventDate: '2026-12-11' })).status, 409);
  assert.equal((await send({ eventDate: '2026-11-01' })).status, 422);
  assert.equal((await send({ phone: '123' })).status, 422);
  assert.equal((await send({ website: 'spam' })).status, 201);
  assert.equal((await send()).status, 201);
  const { enquiries } = (await data(await call('/api/admin/data'))).json;
  assert.equal(enquiries.length, 1);
  const created = await post('/api/admin/bookings', booking({
    startDate: '2026-12-15', endDate: '2026-12-15', enquiryId: enquiries[0].id,
  }));
  assert.equal(created.status, 201);
  assert.equal((await data(await call('/api/admin/data'))).json.enquiries[0].status, 'booked');
});

test('enquiries from one visitor are rate limited', async () => {
  const send = () => post('/api/enquiries', { name: 'Spam', phone: '9876543210', eventType: 'Other' }, {
    host: 'yashpalace.test', auth: false, headers: { 'CF-Connecting-IP': '203.0.113.9' },
  });
  for (let i = 0; i < 5; i += 1) assert.equal((await send()).status, 201);
  const blocked = await send();
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get('Retry-After')) > 0);
});

test('changing the password signs out other devices', async () => {
  const other = cookieFrom(await login());
  const newKey = await deriveLoginKey('owner', 'a brand new password');
  assert.equal((await post('/api/admin/password', { currentKey: newKey, newKey })).status, 422);
  const res = await post('/api/admin/password', { currentKey: loginKey, newKey });
  assert.equal(res.status, 200);
  const fresh = cookieFrom(res);
  cookie = other;
  assert.equal((await call('/api/admin/me')).status, 401);
  cookie = fresh;
  assert.equal((await call('/api/admin/me')).status, 200);
  assert.equal((await login(loginKey)).status, 401);
  assert.equal((await login(newKey)).status, 200);
});

test('repeated wrong passwords are locked out', async () => {
  const wrong = await deriveLoginKey('owner', 'not the password');
  let last;
  for (let i = 0; i < 9; i += 1) last = await login(wrong);
  assert.equal(last.status, 429);
  assert.equal((await login()).status, 429);
});

test('pages are chosen by address', async () => {
  const page = async (host, path) => {
    const res = await call(path, { host, auth: false });
    return [res.status, await res.text()];
  };
  assert.deepEqual(await page('yashpalace.test', '/'), [200, '<title>/index.html</title>']);
  assert.deepEqual(await page('admin.test', '/'), [200, '<title>/admin.html</title>']);
  assert.deepEqual(await page('yashpalace.test', '/admin.html'), [404, '<title>/404.html</title>']);
  assert.deepEqual(await page('yashpalace.test', '/admin'), [404, '<title>/404.html</title>']);
  assert.deepEqual(await page('yash.example.workers.dev', '/admin'), [200, '<title>/admin.html</title>']);
  assert.equal((await call('/api/admin/me', { host: 'yash.example.workers.dev', auth: false })).status, 401);
  const admin = await call('/', { auth: false });
  assert.match(admin.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
  assert.equal(admin.headers.get('X-Robots-Tag'), 'noindex, nofollow');
});

test('hero video supports byte ranges', async () => {
  const get = (range) => call('/assets/venue-tour.mp4', {
    host: 'yashpalace.test', auth: false, headers: range ? { Range: range } : {},
  });
  const full = await get();
  assert.equal(full.status, 200);
  assert.equal(full.headers.get('Accept-Ranges'), 'bytes');
  assert.equal((await full.arrayBuffer()).byteLength, 1000);

  const first = await get('bytes=0-1'); // what Safari asks for first
  assert.equal(first.status, 206);
  assert.equal(first.headers.get('Content-Range'), 'bytes 0-1/1000');
  assert.deepEqual([...new Uint8Array(await first.arrayBuffer())], [0, 1]);

  const middle = await get('bytes=500-');
  assert.equal(middle.headers.get('Content-Range'), 'bytes 500-999/1000');
  assert.equal(new Uint8Array(await middle.arrayBuffer())[0], VIDEO[500]);

  assert.equal((await get('bytes=-10')).headers.get('Content-Range'), 'bytes 990-999/1000');
  assert.equal((await get('bytes=900-5000')).headers.get('Content-Range'), 'bytes 900-999/1000');
  const outside = await get('bytes=1000-');
  assert.equal(outside.status, 416);
  assert.equal(outside.headers.get('Content-Range'), 'bytes */1000');
  assert.equal((await get('bytes=0-1,5-6')).status, 200);
});

test('hero video ranges stream without loading the whole file', async () => {
  let cancelled = false;
  env.HERO_VIDEO_BYTES = '1000';
  env.ASSETS = {
    async fetch() {
      let offset = 0;
      const body = new ReadableStream({
        pull(controller) {
          if (offset >= VIDEO.length) return controller.close();
          controller.enqueue(VIDEO.slice(offset, offset + 64));
          offset += 64;
          return undefined;
        },
        cancel() {
          cancelled = true;
        },
      });
      return new Response(body, { headers: { ETag: '"video-1"' } });
    },
  };
  const get = (range, method = 'GET') => call('/assets/venue-tour.mp4', {
    method, host: 'yashpalace.test', auth: false, headers: { Range: range },
  });
  const part = await get('bytes=70-199');
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('Content-Length'), '130');
  assert.deepEqual([...new Uint8Array(await part.arrayBuffer())], [...VIDEO.slice(70, 200)]);
  const whole = await get('bytes=0-');
  assert.deepEqual([...new Uint8Array(await whole.arrayBuffer())], [...VIDEO]);
  assert.equal((await get('bytes=1000-')).status, 416);
  assert.equal(cancelled, true);
});
