import { useMemo, useState } from 'react';
import {
  CalendarPlus, ChevronLeft, ChevronRight, Lock, MessageCircle, Phone, Plus, Search,
} from 'lucide-react';
import { api } from './api';
import { balanceOf, countFree, inr, nextFreeDates, whatsappLink } from './derive';
import { describeBlock } from './Forms';
import { Btn, Empty, Input, PageTitle } from './ui';
import { MIN_PASSWORD_LENGTH, deriveLoginKey } from '../../shared/password';
import {
  addMonths, daysBetween, formatLong, formatMonth, formatRange, formatShort, monthCells,
  startOfMonth,
} from '../../shared/dates';

const AddBooking = ({ actions }) => (
  <Btn tone="primary" onClick={() => actions.newBooking()}>
    <Plus size={17} /> Add booking
  </Btn>
);

const whenLabel = (today, date) => {
  const days = daysBetween(today, date);
  if (days <= 0) return 'Today';
  return days === 1 ? 'Tomorrow' : `In ${days} days`;
};

function BookingRow({ booking, today, onOpen }) {
  const balance = balanceOf(booking);
  return (
    <button
      type="button"
      onClick={() => onOpen(booking)}
      className="grid w-full grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 border-b border-cream px-1 py-3.5 text-left transition-colors hover:bg-white"
    >
      <span className="font-semibold text-green-800">{booking.clientName}</span>
      <span className="tabular text-right font-semibold">{inr(booking.finalAmount)}</span>
      <span className="text-sm text-ink-soft">
        {formatRange(booking.startDate, booking.endDate)}
        {booking.startDate >= today ? ` · ${whenLabel(today, booking.startDate)}` : ''}
      </span>
      <span className={`tabular text-right text-sm ${balance > 0 ? 'text-terra' : 'text-ink-soft'}`}>
        {balance === null ? 'Amount not set' : balance > 0 ? `${inr(balance)} due` : 'Fully paid'}
      </span>
    </button>
  );
}

export function Overview({ data, dayMap, actions }) {
  const { today, bookings, enquiries } = data;
  const upcoming = bookings.filter((b) => b.endDate >= today);
  const fresh = enquiries.filter((e) => e.status === 'new');
  const stats = [
    ['Upcoming bookings', upcoming.length],
    ['Free days, next 30', countFree(dayMap, today, 30)],
    ['Upcoming value', inr(upcoming.reduce((sum, b) => sum + (b.finalAmount ?? 0), 0))],
    ['Balance to collect', inr(bookings.reduce((sum, b) => sum + Math.max(balanceOf(b) ?? 0, 0), 0))],
  ];
  const free = nextFreeDates(dayMap, today, 6);

  return (
    <>
      <PageTitle title="Overview" subtitle={formatLong(today)}>
        <AddBooking actions={actions} />
      </PageTitle>

      <dl className="mb-10 grid grid-cols-2 overflow-hidden rounded border border-cream bg-white lg:grid-cols-4">
        {stats.map(([label, value], i) => (
          <div key={label} className={`p-4 sm:p-5 ${i % 2 ? 'border-l border-cream' : ''} ${i > 1 ? 'border-t border-cream lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}>
            <dt className="text-sm text-ink-soft">{label}</dt>
            <dd className="tabular mt-1 break-words font-serif text-[2rem] font-semibold leading-none text-green-800">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
        <section aria-labelledby="next-events">
          <h2 id="next-events" className="mb-2 font-serif text-3xl font-semibold text-green-800">Coming up</h2>
          {upcoming.length ? (
            upcoming.slice(0, 6).map((b) => (
              <BookingRow key={b.id} booking={b} today={today} onOpen={actions.editBooking} />
            ))
          ) : (
            <Empty title="No upcoming bookings">Add your first booking and it will appear here.</Empty>
          )}
        </section>

        <div className="grid content-start gap-10">
          <section aria-labelledby="free-dates">
            <h2 id="free-dates" className="mb-3 font-serif text-3xl font-semibold text-green-800">Next free dates</h2>
            <div className="flex flex-wrap gap-2">
              {free.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => actions.newBooking({ startDate: day })}
                  aria-label={`Add booking on ${formatLong(day)}`}
                  className="min-h-11 rounded bg-green-100 px-3 text-sm font-medium text-green-800 hover:bg-gold-glow"
                >
                  {formatShort(day)}
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="new-enquiries">
            <h2 id="new-enquiries" className="mb-2 font-serif text-3xl font-semibold text-green-800">New enquiries</h2>
            {fresh.length ? (
              <>
                {fresh.slice(0, 3).map((e) => (
                  <a key={e.id} href="#enquiries" className="block border-b border-cream py-3 hover:bg-white">
                    <span className="font-semibold text-green-800">{e.name}</span>
                    <span className="block text-sm text-ink-soft">
                      {e.eventType}{e.eventDate ? ` · ${formatShort(e.eventDate)}` : ''}
                    </span>
                  </a>
                ))}
              </>
            ) : (
              <p className="text-sm text-ink-soft">Nothing new. Requests from the website appear here.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarView({ data, dayMap, actions }) {
  const { today, blocks } = data;
  const [month, setMonth] = useState(startOfMonth(today));
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const entry = selected ? dayMap.get(selected) : null;

  const open = (day) => {
    const hit = dayMap.get(day);
    if (hit?.kind === 'booking') actions.editBooking(hit.item);
    else setSelected(day);
  };

  const reopen = async (block) => {
    setBusy(true);
    try {
      await api(`/blocks/${block.id}`, { method: 'DELETE' });
      await actions.saved('Dates reopened. Clients can request them again.');
      setSelected('');
    } catch (err) {
      actions.toast(err.message);
    } finally {
      setBusy(false);
    }
  };

  const upcomingBlocks = blocks.filter((b) => b.endDate >= today);

  return (
    <>
      <PageTitle title="Calendar">
        <Btn onClick={() => actions.closeDates()}><Lock size={16} /> Close dates</Btn>
        <AddBooking actions={actions} />
      </PageTitle>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded border border-cream bg-white p-2 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <Btn aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1))}><ChevronLeft size={18} /></Btn>
            <h2 className="font-serif text-3xl font-semibold text-green-800">{formatMonth(month)}</h2>
            <Btn aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight size={18} /></Btn>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-medium text-ink-soft" aria-hidden>
            {WEEKDAYS.map((d) => <span key={d} className="py-1">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthCells(month).map((day, i) => {
              if (!day) return <span key={`blank-${i}`} />;
              const hit = dayMap.get(day);
              const style = hit?.kind === 'booking'
                ? 'bg-green-800 text-ivory hover:bg-green-700'
                : hit?.kind === 'block'
                  ? 'bg-ivory-2 text-ink-soft hover:bg-cream'
                  : day < today
                    ? 'text-ink-soft/40 hover:bg-ivory'
                    : 'bg-green-50 text-green-800 hover:bg-gold-glow';
              const state = hit?.kind === 'booking'
                ? `booked by ${hit.item.clientName}`
                : hit?.kind === 'block' ? 'closed' : 'free';
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => open(day)}
                  aria-label={`${formatLong(day)}, ${state}`}
                  className={`flex min-h-12 flex-col overflow-hidden rounded p-1 text-left text-sm font-semibold transition-colors sm:min-h-20 sm:p-1.5 ${style} ${
                    selected === day ? 'ring-2 ring-gold-bright' : ''
                  } ${day === today ? 'outline outline-1 outline-gold' : ''}`}
                >
                  <span className="tabular">{Number(day.slice(8))}</span>
                  <span className="mt-auto hidden truncate text-xs font-normal sm:block">
                    {hit?.kind === 'booking' ? hit.item.clientName : hit?.kind === 'block' ? 'Closed' : ''}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 px-1 text-xs text-ink-soft">
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm bg-green-100" /> Free</span>
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm bg-green-800" /> Booked</span>
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm bg-cream" /> Closed</span>
          </div>
        </div>

        <aside className="grid content-start gap-8">
          <section aria-live="polite">
            {selected ? (
              <>
                <h2 className="font-serif text-2xl font-semibold leading-tight text-green-800">{formatLong(selected)}</h2>
                {entry?.kind === 'block' ? (
                  <>
                    <p className="my-2 text-sm text-ink-soft">Closed: {describeBlock(entry.item)}</p>
                    <Btn disabled={busy} onClick={() => reopen(entry.item)} className="w-full">Reopen these dates</Btn>
                  </>
                ) : (
                  <div className="mt-3 grid gap-2">
                    <Btn tone="primary" onClick={() => actions.newBooking({ startDate: selected })}><CalendarPlus size={16} /> Add booking</Btn>
                    <Btn onClick={() => actions.closeDates(selected)}><Lock size={16} /> Close this date</Btn>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-ink-soft">Tap a date to add a booking or close it. Tap a booked date to see its details.</p>
            )}
          </section>

          <section>
            <h2 className="mb-1 font-serif text-2xl font-semibold text-green-800">Closed dates</h2>
            {upcomingBlocks.length ? upcomingBlocks.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 border-b border-cream py-2 text-sm">
                <span>{describeBlock(b)}</span>
                <button type="button" disabled={busy} onClick={() => reopen(b)} className="min-h-11 font-semibold text-green-700 underline">Reopen</button>
              </div>
            )) : <p className="text-sm text-ink-soft">None. Every date without a booking is open to clients.</p>}
          </section>
        </aside>
      </div>
    </>
  );
}

const FILTERS = [
  ['upcoming', 'Upcoming'], ['due', 'Balance due'], ['past', 'Past'], ['all', 'All'],
];

export function Bookings({ data, actions }) {
  const { today, bookings } = data;
  const [filter, setFilter] = useState('upcoming');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = bookings.filter((b) => {
      if (filter === 'upcoming' && b.endDate < today) return false;
      if (filter === 'past' && b.endDate >= today) return false;
      if (filter === 'due' && !(balanceOf(b) > 0)) return false;
      return !q || `${b.clientName} ${b.phone} ${b.eventType}`.toLowerCase().includes(q);
    });
    return filter === 'past' ? list.reverse() : list;
  }, [bookings, filter, query, today]);

  return (
    <>
      <PageTitle title="Bookings"><AddBooking actions={actions} /></PageTitle>
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_280px]">
        <div className="flex gap-1 overflow-x-auto" role="group" aria-label="Filter bookings">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={`min-h-11 whitespace-nowrap rounded px-3 text-sm font-medium ${
                filter === key ? 'bg-green-800 text-ivory' : 'text-green-800 hover:bg-ivory-2'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-3.5 text-ink-soft" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or phone"
            aria-label="Search bookings"
            className="min-h-11 w-full rounded border border-cream bg-white pl-9 pr-3 focus:border-green-700 focus:outline-none"
          />
        </div>
      </div>

      {rows.length ? (
        <div className="overflow-hidden rounded border border-cream bg-white">
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="bg-ivory-2/60 text-ink-soft">
              <tr>
                {['Booked by', 'Dates', 'Event', 'Final amount', 'Received', 'Balance'].map((h, i) => (
                  <th key={h} scope="col" className={`px-4 py-3 font-medium ${i > 2 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular">
              {rows.map((b) => {
                const balance = balanceOf(b);
                return (
                  <tr key={b.id} onClick={() => actions.editBooking(b)} className="cursor-pointer border-t border-cream hover:bg-ivory">
                    <td className="px-4 py-3">
                      <button type="button" className="text-left font-semibold text-green-800 hover:underline">{b.clientName}</button>
                      {b.phone && <span className="block text-xs text-ink-soft">{b.phone}</span>}
                    </td>
                    <td className="px-4 py-3">{formatRange(b.startDate, b.endDate)}</td>
                    <td className="px-4 py-3">{b.eventType || '—'}</td>
                    <td className="px-4 py-3 text-right">{inr(b.finalAmount)}</td>
                    <td className="px-4 py-3 text-right">{inr(b.amountReceived)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${balance > 0 ? 'text-terra' : ''}`}>{inr(balance)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-3 md:hidden">
            {rows.map((b) => <BookingRow key={b.id} booking={b} today={today} onOpen={actions.editBooking} />)}
          </div>
        </div>
      ) : (
        <Empty title="No bookings here">{query ? 'Try a different name or number.' : 'Bookings you add will appear here.'}</Empty>
      )}
    </>
  );
}

const STATUS_LABELS = { new: 'New', contacted: 'Contacted', booked: 'Booked', closed: 'Closed' };

export function Enquiries({ data, dayMap, actions }) {
  const [busyId, setBusyId] = useState(null);

  const run = async (id, request, message) => {
    setBusyId(id);
    try {
      await request();
      await actions.saved(message);
    } catch (err) {
      actions.toast(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageTitle title="Enquiries" />
      {data.enquiries.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {data.enquiries.map((e) => {
            const taken = e.eventDate && dayMap.has(e.eventDate);
            return (
              <article key={e.id} className={`rounded border bg-white p-4 ${e.status === 'new' ? 'border-gold-bright' : 'border-cream'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold leading-tight text-green-800">{e.name}</h2>
                    <p className="text-sm text-ink-soft">
                      {e.eventType} · {e.eventDate ? formatShort(e.eventDate) : 'No date chosen'}
                      {taken && e.status !== 'booked' ? <strong className="text-sindoor"> · now taken</strong> : ''}
                    </p>
                  </div>
                  <select
                    aria-label={`Status for ${e.name}`}
                    value={e.status}
                    disabled={busyId === e.id}
                    onChange={(ev) => run(e.id, () => api(`/enquiries/${e.id}`, { method: 'PATCH', body: { status: ev.target.value } }), 'Status updated')}
                    className="min-h-11 rounded border border-cream bg-white px-2 text-sm"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                {e.message && <p className="mt-3 whitespace-pre-wrap text-sm">{e.message}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Btn as="a" href={`tel:${e.phone.replace(/[^\d+]/g, '')}`}><Phone size={15} /> {e.phone}</Btn>
                  <Btn as="a" href={whatsappLink(e.phone)} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${e.name}`}><MessageCircle size={15} /></Btn>
                  {e.status !== 'booked' && (
                    <Btn
                      tone="primary"
                      onClick={() => actions.newBooking({
                        clientName: e.name, phone: e.phone, eventType: e.eventType,
                        startDate: e.eventDate ?? '', notes: e.message, enquiryId: e.id,
                      })}
                    >
                      Create booking
                    </Btn>
                  )}
                  <Btn tone="quiet" disabled={busyId === e.id} onClick={() => run(e.id, () => api(`/enquiries/${e.id}`, { method: 'DELETE' }), 'Enquiry deleted')}>Delete</Btn>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty title="No enquiries yet">Requests from the website’s booking form will appear here.</Empty>
      )}
    </>
  );
}

export function Settings({ username, actions }) {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const websiteUrl = `${location.protocol}//${location.host.replace(/^admin\./, '')}`;

  const submit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const newPassword = form.get('newPassword');
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError({
        field: 'newPassword',
        message: `Use at least ${MIN_PASSWORD_LENGTH} characters for the new password.`,
      });
      return;
    }
    if (newPassword !== form.get('repeatPassword')) {
      setError({ field: 'repeatPassword', message: 'The new passwords do not match.' });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const [currentKey, newKey] = await Promise.all([
        deriveLoginKey(username, form.get('currentPassword')),
        deriveLoginKey(username, newPassword),
      ]);
      await api('/password', { method: 'POST', body: { currentKey, newKey } });
      formEl.reset();
      actions.toast('Password changed. Other devices were signed out.');
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };
  const fieldError = (name) => (error?.field === name ? error.message : undefined);

  return (
    <>
      <PageTitle title="Settings" />
      <div className="grid max-w-3xl gap-10 md:grid-cols-2">
        <form onSubmit={submit} className="grid content-start gap-4">
          <h2 className="font-serif text-3xl font-semibold text-green-800">Change password</h2>
          <input type="text" name="username" value={username} autoComplete="username" readOnly hidden />
          <Input id="currentPassword" name="currentPassword" type="password" label="Current password" autoComplete="current-password" error={fieldError('currentPassword')} />
          <Input id="newPassword" name="newPassword" type="password" label="New password" hint="At least 10 characters." autoComplete="new-password" error={fieldError('newPassword')} />
          <Input id="repeatPassword" name="repeatPassword" type="password" label="Repeat new password" autoComplete="new-password" error={fieldError('repeatPassword')} />
          {error && !error.field && <p role="alert" className="text-sm text-sindoor">{error.message}</p>}
          <Btn type="submit" tone="primary" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</Btn>
        </form>
        <div className="grid content-start gap-3">
          <h2 className="font-serif text-3xl font-semibold text-green-800">Account</h2>
          <p className="text-sm text-ink-soft">Signed in as <strong className="text-ink">{username}</strong></p>
          <Btn as="a" href={websiteUrl} target="_blank" rel="noreferrer">Open the website</Btn>
          <Btn onClick={actions.signOut}>Sign out</Btn>
        </div>
      </div>
    </>
  );
}
