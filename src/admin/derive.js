import { addDays, eachDay } from '../../shared/dates';

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

export const inr = (amount) => (amount === null || amount === undefined ? '—' : rupees.format(amount));
export const balanceOf = (b) => (b.finalAmount === null ? null : b.finalAmount - b.amountReceived);

export function buildDayMap(bookings, blocks) {
  const days = new Map();
  bookings.forEach((item) =>
    eachDay(item.startDate, item.endDate).forEach((d) => days.set(d, { kind: 'booking', item }))
  );
  blocks.forEach((item) =>
    eachDay(item.startDate, item.endDate).forEach((d) => days.set(d, { kind: 'block', item }))
  );
  return days;
}

export function nextFreeDates(dayMap, today, count) {
  const free = [];
  for (let i = 0; i < 730 && free.length < count; i += 1) {
    const day = addDays(today, i);
    if (!dayMap.has(day)) free.push(day);
  }
  return free;
}

export function countFree(dayMap, from, days) {
  let free = 0;
  for (let i = 0; i < days; i += 1) if (!dayMap.has(addDays(from, i))) free += 1;
  return free;
}

export function whatsappLink(phone) {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
}
