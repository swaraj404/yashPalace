// Calendar dates are plain 'YYYY-MM-DD' strings everywhere, so a booking can
// never shift by a day because of a device or server time zone.
const DAY_MS = 86_400_000;
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const toUTC = (iso) => {
  const [, y, m, d] = ISO_RE.exec(iso);
  return Date.UTC(+y, +m - 1, +d);
};
const fromUTC = (ms) => new Date(ms).toISOString().slice(0, 10);

export function isISODate(value) {
  if (typeof value !== 'string' || !ISO_RE.test(value)) return false;
  return fromUTC(toUTC(value)) === value;
}

export const addDays = (iso, n) => fromUTC(toUTC(iso) + n * DAY_MS);
export const daysBetween = (from, to) => Math.round((toUTC(to) - toUTC(from)) / DAY_MS);
export const startOfMonth = (iso) => `${iso.slice(0, 7)}-01`;

export function addMonths(iso, n) {
  const d = new Date(toUTC(startOfMonth(iso)));
  d.setUTCMonth(d.getUTCMonth() + n);
  return fromUTC(d.getTime());
}

export const endOfMonth = (iso) => addDays(addMonths(iso, 1), -1);
export const weekday = (iso) => new Date(toUTC(iso)).getUTCDay();

export function todayInIndia(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function eachDay(start, end) {
  const days = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  return days;
}

/** Sunday-first weeks for a month; days outside the month are null. */
export function monthCells(monthIso) {
  const first = startOfMonth(monthIso);
  const cells = Array(weekday(first)).fill(null).concat(eachDay(first, endOfMonth(first)));
  while (cells.length % 7) cells.push(null);
  return cells;
}

const fmt = (options) => new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', ...options });
const longFmt = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const shortFmt = fmt({ day: 'numeric', month: 'short', year: 'numeric' });
const dayMonthFmt = fmt({ day: 'numeric', month: 'short' });
const monthFmt = fmt({ month: 'long', year: 'numeric' });

export const formatLong = (iso) => longFmt.format(toUTC(iso));
export const formatShort = (iso) => shortFmt.format(toUTC(iso));
export const formatMonth = (iso) => monthFmt.format(toUTC(iso));

export function formatRange(start, end) {
  if (start === end) return formatShort(start);
  if (start.slice(0, 4) === end.slice(0, 4)) {
    return `${dayMonthFmt.format(toUTC(start))} – ${formatShort(end)}`;
  }
  return `${formatShort(start)} – ${formatShort(end)}`;
}
