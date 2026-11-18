import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from './api';
import { balanceOf, inr } from './derive';
import { Btn, Input, Sheet } from './ui';
import { eventTypes } from '../data/content';
import { formatRange } from '../../shared/dates';

const digitsOnly = (value) => value.replace(/\D/g, '');

function DeleteControl({ label, onConfirm, busy }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <Btn tone="quiet" onClick={() => setAsking(true)}>
        <Trash2 size={16} /> {label}
      </Btn>
    );
  }
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Confirm delete">
      <span className="text-sm text-ink-soft">Are you sure?</span>
      <Btn tone="danger" onClick={onConfirm} disabled={busy}>Yes, delete</Btn>
      <Btn onClick={() => setAsking(false)}>Keep</Btn>
    </div>
  );
}

export function BookingSheet({ booking, draft, onClose, onSaved }) {
  const start = booking ?? draft ?? {};
  const [form, setForm] = useState({
    clientName: start.clientName ?? '',
    phone: start.phone ?? '',
    eventType: start.eventType ?? '',
    startDate: start.startDate ?? '',
    endDate: start.endDate ?? start.startDate ?? '',
    finalAmount: start.finalAmount?.toString() ?? '',
    amountReceived: start.amountReceived ? String(start.amountReceived) : '',
    notes: start.notes ?? '',
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'startDate' && value && (!f.endDate || f.endDate < value)) next.endDate = value;
      return next;
    });
  };
  const setMoney = (key) => (e) => setForm((f) => ({ ...f, [key]: digitsOnly(e.target.value) }));
  const fieldError = (name) => (error?.field === name ? error.message : undefined);

  const preview = form.finalAmount
    ? balanceOf({ finalAmount: +form.finalAmount, amountReceived: +form.amountReceived })
    : null;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const body = {
      ...form,
      finalAmount: form.finalAmount === '' ? null : +form.finalAmount,
      amountReceived: form.amountReceived === '' ? 0 : +form.amountReceived,
      enquiryId: draft?.enquiryId,
    };
    try {
      if (booking) await api(`/bookings/${booking.id}`, { method: 'PUT', body });
      else await api('/bookings', { method: 'POST', body });
      onSaved(booking ? 'Booking updated' : 'Booking added');
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api(`/bookings/${booking.id}`, { method: 'DELETE' });
      onSaved('Booking deleted. Those dates are free again.');
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <Sheet title={booking ? 'Edit booking' : 'New booking'} onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-4">
        <Input id="clientName" label="Booked by" value={form.clientName} onChange={set('clientName')} error={fieldError('clientName')} autoComplete="off" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="bookingPhone" type="tel" label="Phone" value={form.phone} onChange={set('phone')} error={fieldError('phone')} autoComplete="off" />
          <Input id="eventType" as="select" label="Event" value={form.eventType} onChange={set('eventType')} error={fieldError('eventType')}>
            <option value="">Not set</option>
            {[...new Set([...eventTypes, ...(form.eventType ? [form.eventType] : [])])].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Input>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input id="startDate" type="date" label="From date" value={form.startDate} onChange={set('startDate')} error={fieldError('startDate')} />
          <Input id="endDate" type="date" label="To date" min={form.startDate || undefined} value={form.endDate} onChange={set('endDate')} error={fieldError('endDate')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input id="finalAmount" inputMode="numeric" prefix="₹" label="Final amount" value={form.finalAmount} onChange={setMoney('finalAmount')} error={fieldError('finalAmount')} />
          <Input id="amountReceived" inputMode="numeric" prefix="₹" label="Received so far" value={form.amountReceived} onChange={setMoney('amountReceived')} error={fieldError('amountReceived')} />
        </div>
        {preview !== null && (
          <p className="tabular flex justify-between rounded bg-ivory-2 px-3 py-2 text-sm">
            <span>Balance to collect</span>
            <strong className={preview > 0 ? 'text-terra' : 'text-green-700'}>{inr(preview)}</strong>
          </p>
        )}
        <Input id="notes" as="textarea" rows={3} label="Notes" hint="Only you can see this." value={form.notes} onChange={set('notes')} error={fieldError('notes')} />
        {error && !error.field && <p role="alert" className="text-sm text-sindoor">{error.message}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <Btn type="submit" tone="primary" disabled={busy} className="flex-1">
            {busy ? 'Saving…' : booking ? 'Save changes' : 'Add booking'}
          </Btn>
          {booking && <DeleteControl label="Delete" onConfirm={remove} busy={busy} />}
        </div>
      </form>
    </Sheet>
  );
}

export function BlockSheet({ startDate = '', onClose, onSaved }) {
  const [form, setForm] = useState({ startDate, endDate: startDate, reason: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const fieldError = (name) => (error?.field === name ? error.message : undefined);

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'startDate' && value && (!f.endDate || f.endDate < value)) next.endDate = value;
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api('/blocks', { method: 'POST', body: form });
      onSaved('Dates closed. Clients now see them as not available.');
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <Sheet title="Close dates" onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-4">
        <p className="text-sm text-ink-soft">
          Clients will see these dates as not available. They won’t see your reason.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input id="blockStart" type="date" label="From date" value={form.startDate} onChange={set('startDate')} error={fieldError('startDate')} />
          <Input id="blockEnd" type="date" label="To date" min={form.startDate || undefined} value={form.endDate} onChange={set('endDate')} error={fieldError('endDate')} />
        </div>
        <Input id="reason" label="Reason (optional)" value={form.reason} onChange={set('reason')} error={fieldError('reason')} />
        {error && !error.field && <p role="alert" className="text-sm text-sindoor">{error.message}</p>}
        <Btn type="submit" tone="primary" disabled={busy}>{busy ? 'Saving…' : 'Close these dates'}</Btn>
      </form>
    </Sheet>
  );
}

export const describeBlock = (b) =>
  `${formatRange(b.startDate, b.endDate)}${b.reason ? ` · ${b.reason}` : ''}`;
