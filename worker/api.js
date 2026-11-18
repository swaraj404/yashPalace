import {
  checkLoginKey, createVerifier, isLoginKey, normalizeUsername,
} from '../shared/password.js';
import { addDays, eachDay, formatRange, isISODate, todayInIndia } from '../shared/dates.js';
import {
  ENQUIRY_STATUSES, HttpError, cleanBlock, cleanBooking, cleanEnquiry, cleanText, parseId,
} from './validate.js';

const SESSION_SECONDS = 14 * 86_400;
const MAX_PUBLIC_DAYS = 730;
const MAX_QUERY_DAYS = 92;
const MAX_BODY_CHARS = 32_000;
const LOGIN_LIMIT = { limit: 8, windowMs: 15 * 60_000 };
const ENQUIRY_LIMIT = { limit: 5, windowMs: 10 * 60_000 };

const bookingJson = (r) => ({
  id: r.id, clientName: r.client_name, phone: r.phone, eventType: r.event_type,
  startDate: r.start_date, endDate: r.end_date, finalAmount: r.final_amount,
  amountReceived: r.amount_received, notes: r.notes, createdAt: r.created_at,
});
const blockJson = (r) => ({
  id: r.id, startDate: r.start_date, endDate: r.end_date, reason: r.reason,
});
const enquiryJson = (r) => ({
  id: r.id, name: r.name, phone: r.phone, eventDate: r.event_date, eventType: r.event_type,
  message: r.message, status: r.status, createdAt: r.created_at,
});

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });

const hex = (bytes) =>
  [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
const hashToken = async (token) =>
  hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)));
const newToken = () => hex(crypto.getRandomValues(new Uint8Array(32)));

function readCookie(request, name) {
  for (const part of (request.headers.get('Cookie') ?? '').split(';')) {
    const at = part.indexOf('=');
    if (at > 0 && part.slice(0, at).trim() === name) return part.slice(at + 1).trim();
  }
  return null;
}

async function readBody(request) {
  if (!(request.headers.get('Content-Type') ?? '').startsWith('application/json')) {
    throw new HttpError(415, 'That request could not be read.');
  }
  const text = await request.text();
  if (text.length > MAX_BODY_CHARS) throw new HttpError(413, 'That request is too large.');
  try {
    const body = JSON.parse(text);
    if (body && typeof body === 'object' && !Array.isArray(body)) return body;
  } catch {
    /* handled below */
  }
  throw new HttpError(400, 'That request could not be read.');
}

async function retryAfter(db, key, { limit }) {
  const now = Date.now();
  const row = await db.prepare('SELECT count, reset_at FROM rate_limits WHERE key = ?1').bind(key).first();
  return row && row.reset_at > now && row.count >= limit ? Math.ceil((row.reset_at - now) / 1000) : 0;
}

async function recordHit(db, key, { windowMs }) {
  const now = Date.now();
  await db.batch([
    db.prepare('DELETE FROM rate_limits WHERE reset_at <= ?1').bind(now),
    db.prepare(
      `INSERT INTO rate_limits (key, count, reset_at) VALUES (?1, 1, ?2)
       ON CONFLICT (key) DO UPDATE SET count = count + 1`
    ).bind(key, now + windowMs),
  ]);
}

export async function handleApi(request, env, site, options = {}) {
  const db = env.DB;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const today = options.today ?? todayInIndia();
  const clientIp = request.headers.get('CF-Connecting-IP') ?? 'local';
  const cookieName = site.isLocal ? 'yp_session' : '__Host-yp_session';
  const cookieBase = `Path=/; HttpOnly; SameSite=Strict${site.isLocal ? '' : '; Secure'}`;

  const findConflict = async (startDate, endDate, ignoreBookingId = 0) => {
    const booking = await db
      .prepare(
        `SELECT client_name, start_date, end_date FROM bookings
         WHERE start_date <= ?1 AND end_date >= ?2 AND id <> ?3 ORDER BY start_date LIMIT 1`
      )
      .bind(endDate, startDate, ignoreBookingId)
      .first();
    if (booking) {
      return `These dates overlap the booking for ${booking.client_name} (${formatRange(
        booking.start_date, booking.end_date
      )}).`;
    }
    const block = await db
      .prepare(
        `SELECT start_date, end_date FROM blocks
         WHERE start_date <= ?1 AND end_date >= ?2 ORDER BY start_date LIMIT 1`
      )
      .bind(endDate, startDate)
      .first();
    return block
      ? `These dates overlap dates you closed (${formatRange(block.start_date, block.end_date)}).`
      : null;
  };

  const conflictError = async (startDate, endDate, ignoreBookingId) =>
    new HttpError(
      409,
      (await findConflict(startDate, endDate, ignoreBookingId)) ?? 'Those dates are not available.',
      'startDate'
    );

  const sessionCookie = async () => {
    const token = newToken();
    const now = Date.now();
    await db.batch([
      db.prepare('DELETE FROM sessions WHERE expires_at <= ?1').bind(now),
      db.prepare('INSERT INTO sessions (token_hash, expires_at) VALUES (?1, ?2)')
        .bind(await hashToken(token), now + SESSION_SECONDS * 1000),
    ]);
    return `${cookieName}=${token}; ${cookieBase}; Max-Age=${SESSION_SECONDS}`;
  };

  const limitOrThrow = async (key, rule, message) => {
    const wait = await retryAfter(db, key, rule);
    if (wait) {
      const error = new HttpError(429, message);
      error.headers = { 'Retry-After': String(wait) };
      throw error;
    }
  };

  // ---- Public: unavailable dates only, never who booked them ----
  if (path === '/api/health' && method === 'GET') return json({ ok: true });

  if (path === '/api/availability' && method === 'GET') {
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    if (!isISODate(from) || !isISODate(to)) throw new HttpError(422, 'Invalid date range.');
    const start = from < today ? today : from;
    const lastAllowed = addDays(today, MAX_PUBLIC_DAYS);
    const lastForQuery = addDays(start, MAX_QUERY_DAYS);
    let end = to > lastAllowed ? lastAllowed : to;
    if (end > lastForQuery) end = lastForQuery;
    const unavailable = new Set();
    if (start <= end) {
      const { results } = await db
        .prepare(
          `SELECT start_date, end_date FROM bookings WHERE start_date <= ?1 AND end_date >= ?2
           UNION ALL
           SELECT start_date, end_date FROM blocks WHERE start_date <= ?1 AND end_date >= ?2`
        )
        .bind(end, start)
        .all();
      for (const row of results) {
        const first = row.start_date < start ? start : row.start_date;
        const last = row.end_date > end ? end : row.end_date;
        eachDay(first, last).forEach((day) => unavailable.add(day));
      }
    }
    return json({ today, unavailable: [...unavailable].sort() });
  }

  if (path === '/api/enquiries' && method === 'POST') {
    const body = await readBody(request);
    // Hidden form field: bots fill it in, people never see it.
    if (body.website) return json({ ok: true }, 201);
    const limitKey = `enquiry:${clientIp}`;
    await limitOrThrow(limitKey, ENQUIRY_LIMIT, 'Too many requests. Please call us instead.');
    const enquiry = cleanEnquiry(body);
    if (enquiry.eventDate) {
      if (enquiry.eventDate < today) {
        throw new HttpError(422, 'Please choose a date in the future.', 'eventDate');
      }
      if (await findConflict(enquiry.eventDate, enquiry.eventDate)) {
        throw new HttpError(409, 'That date was just taken. Please choose another.', 'eventDate');
      }
    }
    await recordHit(db, limitKey, ENQUIRY_LIMIT);
    await db
      .prepare(
        'INSERT INTO enquiries (name, phone, event_date, event_type, message) VALUES (?1, ?2, ?3, ?4, ?5)'
      )
      .bind(enquiry.name, enquiry.phone, enquiry.eventDate, enquiry.eventType, enquiry.message)
      .run();
    return json({ ok: true }, 201);
  }

  if (!path.startsWith('/api/admin/')) throw new HttpError(404, 'Not found.');

  // ---- Owner API: only reachable on the dashboard address ----
  if (!site.adminAllowed) throw new HttpError(404, 'Not found.');
  const route = path.slice('/api/admin'.length);

  if (!['GET', 'HEAD'].includes(method)) {
    let originHost = null;
    try {
      originHost = new URL(request.headers.get('Origin')).hostname;
    } catch {
      /* a missing or malformed Origin is rejected below */
    }
    if (originHost !== url.hostname) throw new HttpError(403, 'Request blocked.');
  }

  const owner = () =>
    db.prepare('SELECT username, password_verifier FROM owner WHERE id = 1').first();
  const loginLimitKey = `login:${clientIp}`;

  if (route === '/login' && method === 'POST') {
    await limitOrThrow(
      loginLimitKey, LOGIN_LIMIT, 'Too many attempts. Please wait 15 minutes and try again.'
    );
    const body = await readBody(request);
    const username = typeof body.username === 'string' ? normalizeUsername(body.username) : '';
    const account = await owner();
    const keyOk =
      isLoginKey(body.loginKey) &&
      Boolean(account) &&
      account.username === username &&
      (await checkLoginKey(body.loginKey, account.password_verifier));
    if (!keyOk) {
      await recordHit(db, loginLimitKey, LOGIN_LIMIT);
      throw new HttpError(401, 'That username or password is not correct.');
    }
    await db.prepare('DELETE FROM rate_limits WHERE key = ?1').bind(loginLimitKey).run();
    return json({ username: account.username }, 200, { 'Set-Cookie': await sessionCookie() });
  }

  const token = readCookie(request, cookieName);
  const sessionHash = token ? await hashToken(token) : null;
  const session = sessionHash
    ? await db
        .prepare('SELECT token_hash FROM sessions WHERE token_hash = ?1 AND expires_at > ?2')
        .bind(sessionHash, Date.now())
        .first()
    : null;
  if (!session) throw new HttpError(401, 'Please sign in.');

  if (route === '/me' && method === 'GET') {
    return json({ username: (await owner())?.username });
  }

  if (route === '/logout' && method === 'POST') {
    await db.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(sessionHash).run();
    return json({ ok: true }, 200, { 'Set-Cookie': `${cookieName}=; ${cookieBase}; Max-Age=0` });
  }

  if (route === '/password' && method === 'POST') {
    await limitOrThrow(
      loginLimitKey, LOGIN_LIMIT, 'Too many attempts. Please wait 15 minutes and try again.'
    );
    const { currentKey, newKey } = await readBody(request);
    const account = await owner();
    if (!isLoginKey(currentKey) || !(await checkLoginKey(currentKey, account.password_verifier))) {
      await recordHit(db, loginLimitKey, LOGIN_LIMIT);
      throw new HttpError(422, 'Your current password is not correct.', 'currentPassword');
    }
    if (!isLoginKey(newKey)) throw new HttpError(422, 'Please choose a new password.', 'newPassword');
    await db.batch([
      db.prepare(
        "UPDATE owner SET password_verifier = ?1, updated_at = datetime('now') WHERE id = 1"
      ).bind(await createVerifier(newKey)),
      db.prepare('DELETE FROM sessions'), // signs out every device
    ]);
    return json({ ok: true }, 200, { 'Set-Cookie': await sessionCookie() });
  }

  if (route === '/data' && method === 'GET') {
    const [bookings, blocks, enquiries] = await db.batch([
      db.prepare('SELECT * FROM bookings ORDER BY start_date'),
      db.prepare('SELECT * FROM blocks ORDER BY start_date'),
      db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC, id DESC'),
    ]);
    return json({
      today,
      bookings: bookings.results.map(bookingJson),
      blocks: blocks.results.map(blockJson),
      enquiries: enquiries.results.map(enquiryJson),
    });
  }

  const remove = async (table, id) => {
    const { meta } = await db.prepare(`DELETE FROM ${table} WHERE id = ?1`).bind(id).run();
    if (!meta.changes) throw new HttpError(404, 'That item no longer exists.');
    return json({ ok: true });
  };

  if (route === '/bookings' && method === 'POST') {
    const body = await readBody(request);
    const b = cleanBooking(body);
    const enquiryId = body.enquiryId ? parseId(body.enquiryId) : null;
    // One statement, so two simultaneous saves can never both take a date.
    const row = await db
      .prepare(
        `INSERT INTO bookings (client_name, phone, event_type, start_date, end_date,
           final_amount, amount_received, notes)
         SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8
         WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE start_date <= ?5 AND end_date >= ?4)
           AND NOT EXISTS (SELECT 1 FROM blocks WHERE start_date <= ?5 AND end_date >= ?4)
         RETURNING *`
      )
      .bind(b.clientName, b.phone, b.eventType, b.startDate, b.endDate, b.finalAmount,
        b.amountReceived, b.notes)
      .first();
    if (!row) throw await conflictError(b.startDate, b.endDate);
    if (enquiryId) {
      await db.prepare("UPDATE enquiries SET status = 'booked' WHERE id = ?1").bind(enquiryId).run();
    }
    return json(bookingJson(row), 201);
  }

  let match = /^\/bookings\/([^/]+)$/.exec(route);
  if (match && method === 'PUT') {
    const id = parseId(match[1]);
    const b = cleanBooking(await readBody(request));
    const row = await db
      .prepare(
        `UPDATE bookings SET client_name = ?1, phone = ?2, event_type = ?3, start_date = ?4,
           end_date = ?5, final_amount = ?6, amount_received = ?7, notes = ?8,
           updated_at = datetime('now')
         WHERE id = ?9
           AND NOT EXISTS (SELECT 1 FROM bookings
             WHERE start_date <= ?5 AND end_date >= ?4 AND id <> ?9)
           AND NOT EXISTS (SELECT 1 FROM blocks WHERE start_date <= ?5 AND end_date >= ?4)
         RETURNING *`
      )
      .bind(b.clientName, b.phone, b.eventType, b.startDate, b.endDate, b.finalAmount,
        b.amountReceived, b.notes, id)
      .first();
    if (row) return json(bookingJson(row));
    const exists = await db.prepare('SELECT 1 AS found FROM bookings WHERE id = ?1').bind(id).first();
    if (!exists) throw new HttpError(404, 'That booking no longer exists.');
    throw await conflictError(b.startDate, b.endDate, id);
  }
  if (match && method === 'DELETE') return remove('bookings', parseId(match[1]));

  if (route === '/blocks' && method === 'POST') {
    const b = cleanBlock(await readBody(request));
    const row = await db
      .prepare(
        `INSERT INTO blocks (start_date, end_date, reason)
         SELECT ?1, ?2, ?3
         WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE start_date <= ?2 AND end_date >= ?1)
           AND NOT EXISTS (SELECT 1 FROM blocks WHERE start_date <= ?2 AND end_date >= ?1)
         RETURNING *`
      )
      .bind(b.startDate, b.endDate, b.reason)
      .first();
    if (!row) throw await conflictError(b.startDate, b.endDate);
    return json(blockJson(row), 201);
  }

  match = /^\/blocks\/([^/]+)$/.exec(route);
  if (match && method === 'DELETE') return remove('blocks', parseId(match[1]));

  match = /^\/enquiries\/([^/]+)$/.exec(route);
  if (match && method === 'PATCH') {
    const id = parseId(match[1]);
    const body = await readBody(request);
    const status = cleanText(body.status, { field: 'status', label: 'Status', max: 20 });
    if (!ENQUIRY_STATUSES.includes(status)) throw new HttpError(422, 'Invalid status.', 'status');
    const row = await db
      .prepare('UPDATE enquiries SET status = ?1 WHERE id = ?2 RETURNING *')
      .bind(status, id)
      .first();
    if (!row) throw new HttpError(404, 'That enquiry no longer exists.');
    return json(enquiryJson(row));
  }
  if (match && method === 'DELETE') return remove('enquiries', parseId(match[1]));

  throw new HttpError(404, 'Not found.');
}

export function apiError(error) {
  if (error instanceof HttpError) {
    return json({ error: error.message, field: error.field }, error.status, error.headers);
  }
  console.error(error);
  return json({ error: 'Something went wrong on our side. Please try again.' }, 500);
}
