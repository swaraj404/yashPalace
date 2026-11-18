import { daysBetween, isISODate } from '../shared/dates.js';

export const MAX_RANGE_DAYS = 366;
export const ENQUIRY_STATUSES = ['new', 'contacted', 'booked', 'closed'];

export class HttpError extends Error {
  constructor(status, message, field) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

const invalid = (message, field) => new HttpError(422, message, field);

export function cleanText(value, { field, label, max, required = false }) {
  if (value !== undefined && value !== null && typeof value !== 'string') {
    throw invalid(`${label} is not valid.`, field);
  }
  // Keep line breaks and tabs; drop other control characters.
  const text = (value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
  if (required && !text) throw invalid(`Please enter ${label.toLowerCase()}.`, field);
  if (text.length > max) throw invalid(`${label} must be ${max} characters or fewer.`, field);
  return text;
}

export function cleanPhone(value, { field = 'phone', required = false } = {}) {
  const phone = cleanText(value, { field, label: 'Phone number', max: 20, required });
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!/^[+\d][\d\s()-]*$/.test(phone) || digits.length < 10 || digits.length > 13) {
    throw invalid('Please enter a valid phone number.', field);
  }
  return phone;
}

function cleanAmount(value, { field, label }) {
  if (value === null || value === undefined || value === '') return null;
  const amount = typeof value === 'string' ? Number(value) : value;
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > 100_000_000_000) {
    throw invalid(`${label} must be a whole rupee amount.`, field);
  }
  return amount;
}

export function cleanRange(body) {
  const { startDate, endDate } = body;
  if (!isISODate(startDate)) throw invalid('Please choose a valid start date.', 'startDate');
  if (!isISODate(endDate)) throw invalid('Please choose a valid end date.', 'endDate');
  if (endDate < startDate) throw invalid('The end date cannot be before the start date.', 'endDate');
  if (daysBetween(startDate, endDate) >= MAX_RANGE_DAYS) {
    throw invalid(`A single entry can cover at most ${MAX_RANGE_DAYS} days.`, 'endDate');
  }
  return { startDate, endDate };
}

export function cleanBooking(body) {
  const finalAmount = cleanAmount(body.finalAmount, { field: 'finalAmount', label: 'Final amount' });
  const amountReceived =
    cleanAmount(body.amountReceived, { field: 'amountReceived', label: 'Amount received' }) ?? 0;
  if (finalAmount !== null && amountReceived > finalAmount) {
    throw invalid('Amount received cannot be more than the final amount.', 'amountReceived');
  }
  return {
    clientName: cleanText(body.clientName, {
      field: 'clientName', label: 'Client name', max: 120, required: true,
    }),
    phone: cleanPhone(body.phone),
    eventType: cleanText(body.eventType, { field: 'eventType', label: 'Event type', max: 60 }),
    ...cleanRange(body),
    finalAmount,
    amountReceived,
    notes: cleanText(body.notes, { field: 'notes', label: 'Notes', max: 2000 }),
  };
}

export function cleanBlock(body) {
  return {
    ...cleanRange(body),
    reason: cleanText(body.reason, { field: 'reason', label: 'Reason', max: 200 }),
  };
}

export function cleanEnquiry(body) {
  const eventDate = body.eventDate || null;
  if (eventDate !== null && !isISODate(eventDate)) {
    throw invalid('Please choose a valid event date.', 'eventDate');
  }
  return {
    name: cleanText(body.name, { field: 'name', label: 'Your name', max: 120, required: true }),
    phone: cleanPhone(body.phone, { required: true }),
    eventDate,
    eventType: cleanText(body.eventType, {
      field: 'eventType', label: 'Type of event', max: 60, required: true,
    }),
    message: cleanText(body.message, { field: 'message', label: 'Message', max: 2000 }),
  };
}

export function parseId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw new HttpError(404, 'Not found.');
  return id;
}
